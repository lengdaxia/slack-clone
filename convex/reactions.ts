import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkAndGetUserId, getUserMember } from "./utils";

export const toggle = mutation({
  args: {
    messageId: v.id("messages"),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const message = await ctx.db.get(args.messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    const member = await getUserMember(ctx, message.workspaceId, userId);

    if (!member) {
      throw new Error("Unauthorized");
    }

    const existingMessageReaction = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("memberId"), member._id),
          q.eq(q.field("value"), args.value)
        )
      )
      .first();

    // if same reaction exists then delete it
    if (existingMessageReaction) {
      await ctx.db.delete(existingMessageReaction._id);
      return existingMessageReaction._id;
    } else {
      // else create new reaction for the message
      const reactId = await ctx.db.insert("reactions", {
        value: args.value,
        memberId: member._id,
        messageId: message._id,
        workspaceId: message.workspaceId,
      });

      return reactId;
    }
  },
});
