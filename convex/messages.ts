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
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const member = await getUserMember(ctx, args.workspaceId, userId);
    if (!member) {
      throw new Error("Unauthrized");
    }

    let _conversationId = args.conversationId;

    // Only possible if replying in a thread in 1-1 conversation
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);

      if (!parentMessage) {
        throw new Error("ParentMessage not found");
      }

      _conversationId = parentMessage.conversationId;
    }

    const messageId = await ctx.db.insert("messages", {
      body: args.body,
      image: args.image,
      parentMessageId: args.parentMessageId,
      workspaceId: args.workspaceId,
      channelId: args.channelId,
      memberId: member._id,
      conversationId: _conversationId,
      updateAt: Date.now(),
    });

    return messageId;
  },
});
