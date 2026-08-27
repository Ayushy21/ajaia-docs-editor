# Architecture

## System overview

```
Browser (React client components: editor, toolbar, dialogs)
   │  fetch / router
Next.js App Router
   ├── Server Components (dashboard, document page) ── read directly via Prisma
   └── Route Handlers (/api/*) ── mutations
        │
   Validation (Zod)  +  Authorization (lib/permissions.ts)
        │
   Prisma ORM
        │
   PostgreSQL (local + production)
```

Every request that touches a document resolves the current user from the
`draftspace_user` cookie (`lib/demo-auth.ts`) and then calls
`getDocumentAccess(documentId, userId)` before reading or writing.

## Data model

- **User** — `id`, `name`, `email` (unique). Seeded: Ayush, Alex, Maya.
- **Document** — `id`, `title`, `content` (JSON string of the TipTap doc),
  `ownerId`, `createdAt`, `updatedAt`. Exactly one owner (`onDelete: Cascade`).
- **DocumentShare** — join row: `documentId`, `userId`, `permission`
  (`"editor"`), unique on `(documentId, userId)` so a user cannot be shared twice.

```
User ──owns──< Document ──has──< DocumentShare >── shared with ── User
```

## Rich-text representation

The editor persists **TipTap / ProseMirror JSON**, not raw HTML. Structured JSON
is a stable, safe document model: it round-trips losslessly (paragraphs, bold,
italic, underline, headings, lists), it is not vulnerable to HTML injection when
re-loaded, and it can be transformed server-side (that is exactly what file
import does). The column is a JSON string for portability across SQLite and
PostgreSQL; `lib/tiptap.ts` parses and structurally validates it on the way out,
falling back to an empty document if it is ever malformed.

## Sharing model

- **Owner:** read, edit, share.
- **Shared user (`editor`):** read, edit.
- **Everyone else:** no access — the document page returns Next.js `notFound()`
  and the API returns `404`, so content is never leaked and existence is not
  confirmed.

Only the owner can grant access. The owner cannot share with themselves and
duplicate shares are rejected (`409`).

## Authentication tradeoff

The assignment is timeboxed to 4–6 hours and explicitly says not to build
production authentication unless it already exists. DraftSpace therefore uses
three seeded demo users and a cookie-based active-user switcher. This was a
deliberate scope decision: it makes the sharing and authorization story fully
demonstrable (switch user → see Shared with me → confirm a third user is denied)
without spending the budget on login, sessions, password reset, and email. The
security boundary — server-side authorization on every document operation — is
built properly and would not change when real auth is added; only the identity
source (`getCurrentUser`) would be swapped.

## File import

- **Supported:** `.txt`, `.md`. **Max:** 1 MB. Checked both client-side (fast
  feedback) and server-side (authoritative) in `/api/import`.
- **`.txt`:** blank-line-separated blocks become paragraphs; single newlines
  become hard breaks.
- **`.md`:** parsed with `marked`'s lexer into tokens, then mapped to TipTap
  nodes (headings, paragraphs, bold, italic, ordered/bullet lists, blockquote,
  code). We never render or execute uploaded HTML — tokens are converted directly
  to the structured document model.
- **Errors:** unsupported extension, oversized, empty, unreadable, and malformed
  multipart payloads each return a distinct visible error; no document is created.

## Reliability choices

- Centralized authorization helper used by every route and server component.
- Zod validation for title, editor content shape, and share requests.
- Debounced auto-save with explicit state machine and retry; local content is
  never cleared on failure.
- Persistent relational database with referential cascade deletes.
- Automated tests for the authorization matrix and import validation.
- No hard-coded hostnames; configuration via `DATABASE_URL`.

## Deliberate omissions

Real-time collaboration (CRDT/OT/WebSockets), production OAuth, comments,
suggestion mode, full version history, `.docx`/PDF, folders, offline mode, and
granular RBAC are out of scope. They would consume the assessment budget without
proportionally strengthening the core slice: persistent rich-text editing plus a
demonstrable, server-enforced sharing model.
