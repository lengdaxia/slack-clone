import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { checkAndGetUserId, getUserMember } from "./utils";

export const get = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await getUserMember(ctx, args.workspaceId, userId);

    if (!member) {
      return [];
    }

    const channels = await ctx.db
      .query("channels")
      .withIndex("by_workspace_id", (q) =>
        q.eq("workspaceId", args.workspaceId)
      )
      .collect();

    return channels;
  },
});

export const getById = query({
  args: { channelId: v.id("channels") },
  handler: async (ctx, args) => {
    await checkAndGetUserId(ctx);
    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      return null;
    }
    return channel;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await getUserMember(ctx, args.workspaceId, userId);

    if (!member || member.role !== "admin") {
      throw new Error("Unauthrized");
    }

    const channelName = args.name.replace(/\s+/g, "-");
    const channelId = await ctx.db.insert("channels", {
      name: channelName,
      workspaceId: args.workspaceId,
    });

    return channelId;
  },
});

export const update = mutation({
  args: {
    name: v.string(),
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await getUserMember(ctx, channel.workspaceId, userId);

    if (!member || member.role !== "admin") {
      throw new Error("Unauthrized");
    }

    const channelName = args.name.replace(/\s+/g, "-");
    const channelId = await ctx.db.patch(args.channelId, {
      name: channelName,
    });

    return channelId;
  },
});

export const remove = mutation({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const channel = await ctx.db.get(args.channelId);

    if (!channel) {
      throw new Error("Channel not found");
    }

    const member = await getUserMember(ctx, channel.workspaceId, userId);

    if (!member || member.role !== "admin") {
      throw new Error("Unauthrized");
    }

    // TODO: delete assiciated conversations

    // delete channel
    await ctx.db.delete(args.channelId);

    return args.channelId;
  },
});
