import { mutation } from "./_generated/server";

export const upload = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
