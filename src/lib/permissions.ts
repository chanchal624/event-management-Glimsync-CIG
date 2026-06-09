import { Session } from "next-auth";

export const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 4,
  PHOTOGRAPHER: 3,
  CLUB_MEMBER: 2,
  VIEWER: 1,
};

export function hasRole(userRole: string | undefined | null, requiredRole: string): boolean {
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole.toUpperCase()] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole.toUpperCase()] || 999;

  return userLevel >= requiredLevel;
}

export function canAccessPrivate(session: Session | null): boolean {
  return hasRole(session?.user?.role, "CLUB_MEMBER");
}

export function canUpload(session: Session | null): boolean {
  return hasRole(session?.user?.role, "PHOTOGRAPHER");
}
