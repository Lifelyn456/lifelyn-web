import type { Role } from "@/lib/api/generated/types";

export const patientHome = "/dashboard";
export const clinicianHome = "/clinician/patients";

/** Where an authenticated account with this role lands when it has no other destination. */
export function homeRouteForRole(role: Role): string {
  return role === "PATIENT" ? patientHome : clinicianHome;
}

/** Whether an account with this role may view a screen that requires `requiredRole`. */
export function isAuthorizedForRole(role: Role, requiredRole: Role): boolean {
  return role === requiredRole;
}
