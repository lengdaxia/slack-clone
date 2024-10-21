import { v } from "convex/values";
import { query } from "./_generated/server";
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
