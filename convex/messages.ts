import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkAndGetUserId, getUserMember } from "./utils";

export const create = mutation({
  args: {
    body: v.string(),
    image: v.optional(v.id("_storage")),
    workspaceId: v.id("workspaces"),
    channelId: v.optional(v.id("channels")),
    parentMessageId: v.optional(v.id("messages")),
    // TODO: conversation id
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await getUserMember(ctx, args.workspaceId, userId);
    if (!member) {
      throw new Error("Unauthrized");
    }

    const messageId = await ctx.db.insert("messages", {
      body: args.body,
      image: args.image,
      parentMessageId: args.parentMessageId,
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      memberId: member._id,
      // TODO: conversationId
      updateAt: Date.now(),
    });

    return messageId;
  },
});
