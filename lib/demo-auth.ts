import { cookies } from "next/headers";
import { prisma } from "./db";

export const CURRENT_USER_COOKIE = "draftspace_user";

/**
 * Demo authentication: the "current user" is stored in a cookie holding a user
 * id. This is intentionally chosen for the timeboxed assessment in place of a
 * full auth system. All document authorization is still enforced on the server
 * against this identity (see lib/permissions.ts).
 */
export async function getCurrentUser() {
  const id = cookies().get(CURRENT_USER_COOKIE)?.value;
  if (id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) return user;
  }
  // Fall back to the first seeded user so the app is usable out of the box.
  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("No demo users seeded. Run `npm run db:seed`.");
  return user;
}
