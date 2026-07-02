import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { findRouteRule, isPublicRoute } from "@/lib/permissions";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = req.auth;

  if (!session?.user) {
    return denyUnauthenticated(req, pathname);
  }

  const rule = findRouteRule(pathname);

  if (rule && !rule.roles.includes(session.user.role)) {
    return denyForbidden(req, pathname);
  }

  return NextResponse.next();
});

function denyUnauthenticated(req: Parameters<Parameters<typeof auth>[0]>[0], pathname: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

function denyForbidden(req: Parameters<Parameters<typeof auth>[0]>[0], pathname: string) {
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
