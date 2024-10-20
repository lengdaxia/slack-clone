import { getAuthUserId } from "@convex-dev/auth/server";
import { MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const checkAndGetUserId = async (ctx: QueryCtx | MutationCtx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw Error("Unauthorized")    
  }
  return userId;
}

export const generateJoinCode = () => {
  const code = Array.from(
    {length: 6},
    () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
  ).join("");
  return code;
}

export const populateUser = async (ctx: QueryCtx, id:Id<"users">) => {
    return await ctx.db.get(id);
}
