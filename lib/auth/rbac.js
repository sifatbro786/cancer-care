/**
 * Role-based access control — one table, used by UI (hide/show) AND server (enforce).
 * The UI check is cosmetic; every Server Action / Route Handler calls `authorize()` itself.
 *
 * Roles (owner decision): super_admin, admin. No pharmacist role.
 */
export const ROLES = Object.freeze(["super_admin", "admin"]);

export const PERMISSIONS = Object.freeze({
  inboxRead: "inbox:read", // appointments, orders, messages, prescriptions (view + download)
  inboxWrite: "inbox:write", // status changes, notes, verify/reject prescriptions
  contentWrite: "content:write", // doctor, services, products, blog, testimonials, FAQ, settings, media
  seoWrite: "seo:write",
  usersManage: "users:manage", // create / disable / reset admin users
  auditRead: "audit:read",
});

const P = PERMISSIONS;
const GRANTS = {
  admin: [P.inboxRead, P.inboxWrite, P.contentWrite, P.seoWrite],
  super_admin: Object.values(P),
};

export function can(role, permission) {
  return Boolean(GRANTS[role]?.includes(permission));
}
