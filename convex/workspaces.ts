import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { checkAndGetUserId, generateJoinCode, getUserMember } from "./utils";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const members = await ctx.db
      .query("members")
      .withIndex("by_user_id", (q) => q.eq("userId", userId!))
      .collect();

    const workspaceIds = members.map((member) => member.workspaceId);
    const workspaces = [];
    for (const wkId of workspaceIds) {
      const wk = await ctx.db.get(wkId);
      if (wk) {
        workspaces.push(wk);
      }
    }

    return workspaces;
  },
});

export const getPublicInfo = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const member = await getUserMember(ctx, args.workspaceId, userId);

    const worksapce = await ctx.db.get(args.workspaceId);

    return {
      name: worksapce?.name,
      isMember: !!member,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    const joinCode = generateJoinCode();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode,
    });

    // join the workspace member when create a workspace
    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin",
    });

    // create general channel for the initiation of workspace
    await ctx.db.insert("channels", {
      name: "general",
      workspaceId,
    });

    return workspaceId;
  },
});

export const update = mutation({
  args: { id: v.id("workspaces"), name: v.string() },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    const member = await getUserMember(ctx, args.id, userId);

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
    });

    return args.id;
  },
});

export const newJoincode = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    const member = await getUserMember(ctx, args.workspaceId, userId);

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const newCode = generateJoinCode();
    await ctx.db.patch(args.workspaceId, {
      joinCode: newCode,
    });

    return args.workspaceId;
  },
});

export const remove = mutation({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    const member = await getUserMember(ctx, args.id, userId);

    if (!member || member.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // remove related members, channels, etc of the deleting workspace
    const [members, channels, messages, reactions, conversations] =
      await Promise.all([
        await ctx.db
          .query("members")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        await ctx.db
          .query("channels")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        await ctx.db
          .query("messages")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        await ctx.db
          .query("reactions")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
        await ctx.db
          .query("conversations")
          .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
          .collect(),
      ]);

    // delete all workspace's user membership
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // delete workspace's channels
    for (const channel of channels) {
      await ctx.db.delete(channel._id);
    }
    // delete workspace's messages
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    // delete workspace's reactions
    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }
    // delete workspace's conversation
    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    //finally remove worksapce entity from db
    await ctx.db.delete(args.id);

    return args.id;
  },
});

export const getById = query({
  args: { id: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw Error("Unauthorized");
    }

    const member = await ctx.db
      .query("members")
      .withIndex("by_workspace_id_user_id", (q) =>
        q.eq("workspaceId", args.id).eq("userId", userId)
      )
      .unique();

    if (!member) {
      return null;
    }

    return await ctx.db.get(args.id);
  },
});
