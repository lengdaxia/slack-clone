import { getAuthUserId } from "@convex-dev/auth/server";

export const checkAndGetUserId = async (ctx: any) => {
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
