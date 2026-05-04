import { getMeFromRequest } from "@/lib/api/client";
import { defineMiddleware } from "astro:middleware";

const protectedRoutePrefixes = ["/crm"];

function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  console.log(pathname);

  if (!isProtectedRoute(pathname)) {
    return next();
  }

  try {
    const { authenticated } = await getMeFromRequest(context.request);

    if (authenticated) {
      return next();
    }
  } catch {
    // Treat backend/auth failures as unauthenticated.
  }

  return context.redirect("/auth/sign-in");
});
