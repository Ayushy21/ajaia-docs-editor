import { describe, expect, it } from "vitest";
import { getDocumentAccess, type PermissionsDb } from "@/lib/permissions";

const OWNER = "user-owner";
const SHARED = "user-shared";
const STRANGER = "user-stranger";
const DOC = "doc-1";

function makeDb(shares: { userId: string; permission: string }[]): PermissionsDb {
  return {
    document: {
      async findUnique({ where }) {
        return where.id === DOC ? { id: DOC, ownerId: OWNER } : null;
      },
    },
    documentShare: {
      async findUnique({ where }) {
        const s = shares.find((x) => x.userId === where.documentId_userId.userId);
        return s ? { permission: s.permission } : null;
      },
    },
  };
}

describe("getDocumentAccess", () => {
  it("grants the owner read, edit and ownership", async () => {
    const access = await getDocumentAccess(DOC, OWNER, makeDb([]));
    expect(access).toEqual({ canAccess: true, canEdit: true, isOwner: true });
  });

  it("grants a shared editor read and edit but not ownership", async () => {
    const access = await getDocumentAccess(
      DOC,
      SHARED,
      makeDb([{ userId: SHARED, permission: "editor" }]),
    );
    expect(access).toEqual({ canAccess: true, canEdit: true, isOwner: false });
  });

  it("denies an unrelated user", async () => {
    const access = await getDocumentAccess(DOC, STRANGER, makeDb([]));
    expect(access).toEqual({ canAccess: false, canEdit: false, isOwner: false });
  });

  it("denies access to a non-existent document", async () => {
    const access = await getDocumentAccess("missing", OWNER, makeDb([]));
    expect(access.canAccess).toBe(false);
  });

  it("only the owner is reported as owner (for share authorization)", async () => {
    const shared = await getDocumentAccess(DOC, SHARED, makeDb([{ userId: SHARED, permission: "editor" }]));
    const stranger = await getDocumentAccess(DOC, STRANGER, makeDb([]));
    expect(shared.isOwner).toBe(false);
    expect(stranger.isOwner).toBe(false);
  });
});
