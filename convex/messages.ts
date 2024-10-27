import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  checkAndGetUserId,
  getUserMember,
  populateMember,
  populateReactions,
  populateThreads,
  populateUser,
} from "./utils";
import { paginationOptsValidator } from "convex/server";
import { Doc, Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {
    channelId: v.optional(v.id("channels")),
    conversationId: v.optional(v.id("conversations")),
    parentMessageId: v.optional(v.id("messages")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await checkAndGetUserId(ctx);

    let _conversationId = args.conversationId;
    if (!args.conversationId && !args.channelId && args.parentMessageId) {
      const parentMessage = await ctx.db.get(args.parentMessageId);
      if (!parentMessage) {
        throw new Error("Parent message not found");
      }
      _conversationId = parentMessage.conversationId;
    }

    const results = await ctx.db
      .query("messages")
      .withIndex("by_channel_id_parent_message_id_conversatopn_id", (q) =>
        q
          .eq("channelId", args.channelId)
          .eq("parentMessageId", args.parentMessageId)
          .eq("conversationId", _conversationId)
      )
      .order("desc")
      .paginate(args.paginationOpts);

    return {
      ...results,
      page: (
        await Promise.all(
          results.page.map(async (message) => {
            const member = await populateMember(ctx, message.memberId);
            const user = member ? await populateUser(ctx, member.userId) : null;

            if (!member || !user) {
              return null;
            }

            const reactions = await populateReactions(ctx, message._id);
            const thread = await populateThreads(ctx, message._id);

            const image = message.image
              ? await ctx.storage.getUrl(message.image)
              : undefined;

            const reactionsWithCounts = reactions.map((reaction) => {
              return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value)
                  .length,
              };
            });

            const deducedReactions = reactionsWithCounts.reduce(
              (acc, reaction) => {
                const existingReaction = acc.find(
                  (r) => r.value === reaction.value
                );
                if (existingReaction) {
                  existingReaction.memberIds = Array.from(
                    new Set([...existingReaction.memberIds, reaction.memberId])
                  );
                } else {
                  acc.push({ ...reaction, memberIds: [reaction.memberId] });
                }
                return acc;
              },
              [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
              })[]
            );

            const reactionsWithoutMemberIdProperty = deducedReactions.map(
              ({ memberId, ...rest }) => rest
            );

            return {
              ...message,
              image,
              member,
              user,
              reactions: reactionsWithoutMemberIdProperty,
              threadCount: thread.count,
              threadImage: thread.image,
              threadName: thread.name,
              threadTimestamp: thread.timestamp,
            };
          })
        )
      ).filter((message) => message !== null),
    };
  },
});

export const getById = query({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const message = await ctx.db.get(args.id);
    if (!message) {
      return null;
    }

    const currentMember = await getUserMember(ctx, message.workspaceId, userId);
    if (!currentMember) {
      return null;
    }

    const member = await populateMember(ctx, message.memberId);
    if (!member) {
      return null;
    }

    const user = await populateUser(ctx, member.userId);

    if (!user) {
      return null;
    }
    const reactions = await populateReactions(ctx, message._id);

    const reactionsWithCounts = reactions.map((reaction) => {
      return {
        ...reaction,
        count: reactions.filter((r) => r.value === reaction.value).length,
      };
    });

    const deducedReactions = reactionsWithCounts.reduce(
      (acc, reaction) => {
        const existingReaction = acc.find((r) => r.value === reaction.value);
        if (existingReaction) {
          existingReaction.memberIds = Array.from(
            new Set([...existingReaction.memberIds, reaction.memberId])
          );
        } else {
          acc.push({ ...reaction, memberIds: [reaction.memberId] });
        }
        return acc;
      },
      [] as (Doc<"reactions"> & {
        count: number;
        memberIds: Id<"members">[];
      })[]
    );

    const reactionsWithoutMemberIdProperty = deducedReactions.map(
      ({ memberId, ...rest }) => rest
    );

    return {
      ...message,
      image: message.image
        ? await ctx.storage.getUrl(message.image)
        : undefined,
      user,
      member,
      reactions: reactionsWithoutMemberIdProperty,
    };
  },
});

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
    });

    return messageId;
  },
});

export const update = mutation({
  args: {
    id: v.id("messages"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);

    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }

    // check if the user still belong to the workspace and match the message's memberId
    const member = await getUserMember(ctx, message.workspaceId, userId);
    if (!member || member._id !== message.memberId) {
      throw new Error("Unauthrized");
    }

    await ctx.db.patch(args.id, {
      body: args.body,
      updateAt: Date.now(),
    });
    return args.id;
  },
});

export const remove = mutation({
  args: {
    id: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error("Message not found");
    }
    const member = await getUserMember(ctx, message.workspaceId, userId);

    if (!member) {
      throw new Error("UnAuthorized");
    }

    //remove related images
    console.log("message.image: ", message.image);
    if (message.image) {
      await ctx.storage.delete(message.image!);
    }

    //remove reactions
    const [reactions] = await Promise.all([
      ctx.db
        .query("reactions")
        .withIndex("by_message_id", (q) => q.eq("messageId", args.id))
        .collect(),
    ]);

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id);
    }

    await ctx.db.delete(args.id);

    return args.id;
  },
});
