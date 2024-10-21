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
    joinCode: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    // check workspcae exist
    const workspace = await ctx.db.query("workspaces")
    .withIndex("by_id", (q) => q.eq("_id", args.workspaceId))
    .unique();
    if (!workspace) {
      throw new Error("Workspace not found")
    }

    // check if joincode matches
    const joincodeNotValid = workspace.joinCode !== args.joinCode;
    if (joincodeNotValid) {
        throw new Error("Join code not valid, please confirm again")
    }

    // check if memeber exist
    const memberUSer = await getUserMember(ctx, args.workspaceId, userId);

    if (memberUSer) {
      throw new Error("Already a member of this workspace!")
    }

    // join the workspace
    const memberId = await ctx.db.insert("members", {
      userId: userId,
      workspaceId: args.workspaceId,
      role:"member"
    })

    return memberId;
  }
})