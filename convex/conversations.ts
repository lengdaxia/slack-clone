import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { checkAndGetUserId, getUserMember } from "./utils";

export const getOrCreate = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    initMemberId: v.id("members"),
  },

  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const currentMember = await getUserMember(ctx, args.workspaceId, userId);
    if (!currentMember) {
      throw new Error("Unauthorized");
    }

    const existingConversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("senderId"), args.initMemberId),
            q.eq(q.field("receiverId"), currentMember._id)
          ),
          q.and(
            q.eq(q.field("senderId"), currentMember._id),
            q.eq(q.field("receiverId"), args.initMemberId)
          )
        )
      )
      .unique();

    if (existingConversation) {
      return existingConversation._id;
    } else {
      const conversationId = await ctx.db.insert("conversations", {
        workspaceId: args.workspaceId,
        senderId: args.initMemberId,
        receiverId: currentMember._id,
      });

      return conversationId;
    }
  },
});
