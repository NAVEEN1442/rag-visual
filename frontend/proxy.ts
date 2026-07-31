import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Routes that require authentication (unauthenticated → /log-in). */
const PROTECTED_ROUTES = ["/dashboard"];

/** Auth-only routes (authenticated → /dashboard). */
const AUTH_ROUTES = ["/log-in", "/sign-up"];

function pathStartsWithAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Authenticated user visiting auth pages → redirect to dashboard
  if (userId && pathStartsWithAny(pathname, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Unauthenticated user visiting protected pages → redirect to login
  if (!userId && pathStartsWithAny(pathname, PROTECTED_ROUTES)) {
    const signInUrl = new URL("/log-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

