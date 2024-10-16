import { convexAuthNextjsMiddleware, createRouteMatcher, isAuthenticatedNextjs, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isPublicPage = createRouteMatcher(["/auth"])

export default convexAuthNextjsMiddleware((req) => {
  //if user not sign in, redirect to auth page from other non public page
  if(!isPublicPage(req) && !isAuthenticatedNextjs()){
    return nextjsMiddlewareRedirect(req, "auth");
  }
  // if user sign in, redirect to home page. (SignIn Page is not allowed to visit again)
  if(isPublicPage(req) && isAuthenticatedNextjs()){
    return nextjsMiddlewareRedirect(req, "/")
  }
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};