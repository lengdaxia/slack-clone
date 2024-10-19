import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { useId } from "react";


export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!useId) {
        return[];
    }

    const members = await ctx.db.query("members")
    .withIndex("by_user_id", (q) => q.eq("userId", userId!))
    .collect()

    const workspaceIds = members.map((member) => member.workspaceId);
    const workspaces = [];
    for(const wkId of workspaceIds) {
      const wk = await ctx.db.get(wkId);
      if (wk) {
        workspaces.push(wk);
      }
    }

    return workspaces;
  }
})

export const create = mutation({
  args: {
    name: v.string()
  },  
  handler: async (ctx, args) => {
    const userId = await checkAndGetUserId(ctx);
    const joinCode = generateJoinCode();
    const workspaceId = await ctx.db.insert("workspaces", {
      name: args.name,
      userId,
      joinCode
    });

    // join the workspace member when create a workspace
    await ctx.db.insert("members", {
      userId,
      workspaceId,
      role: "admin"
    })

    return workspaceId;
  }
})

export const getById = query({
  args: {id: v.id("workspaces")},
  handler: async (ctx, args)  => {
      const userId = await checkAndGetUserId(ctx);

      const member = await ctx.db.query("members")
      .withIndex("by_workspace_id_user_id", (q) => 
        q.eq("workspaceId", args.id).eq("userId", userId))
      .unique();

      if (!member) {
        return null;
      }

      return await ctx.db.get(args.id);
  },
})

const checkAndGetUserId = async (ctx: any) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw Error("Unauthorized")    
  }
  return userId;
}

const generateJoinCode = () => {
  const code = Array.from(
    {length: 6},
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code;
}
