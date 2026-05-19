import type { CurrentUser } from "@/lib/auth";
import type { UserRole } from "@/lib/constants";

export function hasRole(user: CurrentUser | null, role: UserRole) {
  return user?.role === role;
}

export function hasAnyRole(user: CurrentUser | null, roles: UserRole[]) {
  return Boolean(user && roles.includes(user.role));
}

export function isAdmin(user: CurrentUser | null) {
  return hasRole(user, "ADMIN");
}

export function canAccessAdmin(user: CurrentUser | null) {
  return isAdmin(user);
}

export function canManageProfessionalVerification(user: CurrentUser | null) {
  return isAdmin(user);
}

export function isOwnerOrAdmin(user: CurrentUser | null, ownerId: string) {
  return Boolean(user && (user.id === ownerId || user.role === "ADMIN"));
}
