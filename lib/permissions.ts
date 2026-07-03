import { Role } from "@/app/generated/prisma/enums";

/**
 * Deny-by-default route protection. Anything not matched by PUBLIC_ROUTES
 * requires at least an authenticated session; PROTECTED_ROUTES further
 * restricts by role. Add new routes here explicitly — a route with no
 * entry is still protected (auth-only), never silently public.
 */

export const PUBLIC_ROUTES: RegExp[] = [
  /^\/$/,
  /^\/events$/,
  /^\/news$/,
  /^\/login$/,
  /^\/register$/,
  /^\/claim-account$/,
  /^\/api\/auth(\/.*)?$/,
  /^\/api\/register$/,
  /^\/api\/claim-account$/,
  /^\/api\/verify-email$/,
  /^\/api\/news$/,
];

export type RouteRule = {
  pattern: RegExp;
  roles: Role[];
};

export const PROTECTED_ROUTES: RouteRule[] = [
  { pattern: /^\/admin(\/.*)?$/, roles: [Role.ADMIN] },
  { pattern: /^\/api\/admin(\/.*)?$/, roles: [Role.ADMIN] },
  {
    pattern: /^\/students$/,
    roles: [Role.CEINFUA_MEMBER, Role.ADMIN, Role.EXTERNAL_PARTNER],
  },
  // List endpoint: staff/partner only.
  {
    pattern: /^\/api\/students$/,
    roles: [Role.CEINFUA_MEMBER, Role.ADMIN, Role.EXTERNAL_PARTNER],
  },
  // Single-student endpoint: all authenticated roles, including STUDENT —
  // self/staff/partner access is enforced in-handler (lib/authz + route logic).
  {
    pattern: /^\/api\/students\/.+$/,
    roles: [Role.STUDENT, Role.CEINFUA_MEMBER, Role.ADMIN, Role.EXTERNAL_PARTNER],
  },
  // /profile has no role restriction beyond "authenticated" — falls through
  // to the default authenticated-only check in middleware.
];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((re) => re.test(pathname));
}

export function findRouteRule(pathname: string): RouteRule | undefined {
  return PROTECTED_ROUTES.find((rule) => rule.pattern.test(pathname));
}
