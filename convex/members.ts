import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkAndGetUserId, getUserMember, populateUser } from "./utils";

export const current = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await getUserMember(ctx, args.workspaceId, userId);

    if (!member) {
      return null;
    }
    return member;
  },
});

export const getById = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await ctx.db.get(args.memberId);
    if (!member) {
      return null;
    }

    const currentMember = await getUserMember(ctx, member.workspaceId, userId);
    if (!currentMember) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }

    return {
      ...member,
      user,
    };
  },
});

export const get = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await getUserMember(ctx, args.workspaceId, userId);

    if (!member) {
      return [];
    }

    const data = await ctx.db
      .query("members")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    const memberUsers = [];
    for (const item of data) {
      const user = await populateUser(ctx, item.userId);
      if (user) {
        memberUsers.push({
          ...item,
          user,
        });
      }
    }

    return memberUsers;
  },
});

export const joinMember = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    joinCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    // check workspcae exist
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_id", (q) => q.eq("_id", args.workspaceId))
      .unique();
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // check if joincode matches
    const joincodeNotValid = workspace.joinCode !== args.joinCode.toLowerCase();
    if (joincodeNotValid) {
      throw new Error("Join code not valid, please confirm again");
    }

    // check if memeber exist
    const memberUSer = await getUserMember(ctx, args.workspaceId, userId);

    if (memberUSer) {
      throw new Error("Already a member of this workspace!");
    }

    // join the workspace
    const memberId = await ctx.db.insert("members", {
      userId: userId,
      workspaceId: args.workspaceId,
      role: "member",
    });

    return memberId;
  },
});

export const update = mutation({
  args: {
    id: v.id("members"),
    role: v.union(v.literal("admin"), v.literal("member")),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await getUserMember(ctx, member.workspaceId, userId);

    if (!currentMember || currentMember.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
    });

    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("members"),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await ctx.db.get(args.id);

    if (!member) {
      throw new Error("Member not found");
    }

    const currentMember = await getUserMember(ctx, member.workspaceId, userId);

    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    if (member.role === "admin") {
      throw new Error("Admin cannot be removed");
    }

    if (currentMember._id === args.id) {
      throw new Error("Unauthorized");
    }

    const [messages, reactions, conversations] = await Promise.all([
      ctx.db
        .query("messages")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.id))
        .collect(),
      ctx.db
        .query("reactions")
        .withIndex("by_member_id", (q) => q.eq("memberId", args.id))
        .collect(),
      ctx.db
        .query("conversations")
        .filter((q) => q.eq(q.field("workspaceId"), member.workspaceId))
        .filter((q) =>
          q.or(
            q.eq(q.field("senderId"), args.id),
            q.eq(q.field("receiverId"), args.id)
          )
        )
        .collect(),
    ]);

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    for (const react of reactions) {
      await ctx.db.delete(react._id);
    }

    for (const conversation of conversations) {
      await ctx.db.delete(conversation._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
