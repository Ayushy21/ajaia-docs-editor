# DraftSpace

A lightweight collaborative document workspace inspired by Google Docs. Users can
create rich-text documents, edit them with formatting that persists, import `.txt`
and `.md` files, and share documents with other users — with all access control
enforced on the server.

Built for the Ajaia LLC AI-Native Full Stack Developer assignment.

## Live URL

```
Live URL: <ADD_AFTER_DEPLOYMENT>
```

## Tech stack

- **Next.js 14 (App Router)** + **TypeScript**
- **Tailwind CSS**
- **TipTap** (ProseMirror) rich-text editor — content stored as structured JSON
- **Prisma ORM** — SQLite locally, PostgreSQL in production
- **Vitest** for automated tests

## Demo users

The app seeds three demo users:

```
Ayush  ayush@demo.local
Alex   alex@demo.local
Maya   maya@demo.local
```

**User switcher:** the header has a segmented control that sets the active user.
The selection is stored in an httpOnly cookie (`draftspace_user`) holding the
user id; every server request resolves the current user from that cookie. This is
**demo authentication intentionally chosen for the timeboxed assessment** — there
are no passwords. Authorization for documents is still fully enforced server-side
(see `lib/permissions.ts`), so switching users or typing a document URL directly
cannot bypass access rules.

## Features

### Completed

- Switch between demo users (server-resolved identity)
- Create a document (owner assigned, valid empty TipTap content, opens editor)
- Rename a document inline with validation (trimmed, non-empty, ≤ 120 chars)
- Rich-text editing: bold, italic, underline, H1, H2, paragraph, bullet list,
  numbered list, undo/redo, active-state toolbar, placeholder, styled editor
- Debounced auto-save (800 ms) with visible Saving / Saved / Save failed states;
  failed saves keep local content and retry
- Content + title persist to the database and survive refresh/reopen
- Import `.txt` and `.md` (max 1 MB) into a new owned document; Markdown headings,
  paragraphs, bold, italic and lists are converted; unsafe HTML is never executed
- Sharing: owner opens a share dialog, sees owner / already-shared / available
  users, grants `editor` access; cannot share with self; duplicate shares blocked
- Dashboard with distinct **Owned by me** and **Shared with me** sections, card
  metadata (title, owner, updated time, ownership badge) and empty states
- Centralized server-side authorization on every read/edit/rename/share path;
  unrelated users get a 404-style not-found response
- Visible error feedback via toasts for load / auth / save / rename / share /
  import failures; loading and in-flight button states
- Automated tests: authorization matrix + file-import validation
- Production build passes; deployment-ready (no hard-coded localhost)

### Intentionally deferred

- Production authentication / OAuth
- Real-time collaboration, presence, live cursors, CRDT/OT
- Comments, suggestion mode, full version history
- `.docx` parsing, PDF export, folders, offline mode, complex RBAC

### Known limitations

- Auto-save is last-write-wins; there is no save-conflict resolution between two
  users editing the same document simultaneously.
- Markdown import handles common constructs (headings, paragraphs, bold, italic,
  lists, blockquote, code); nested/complex Markdown is flattened.
- Demo auth trusts the cookie value; there is no login step by design.

## Local setup

```bash
npm install
cp .env.example .env        # DATABASE_URL defaults to file:./dev.db
npx prisma db push          # create the SQLite schema
npm run db:seed             # create the 3 demo users + a sample document
npm run dev                 # http://localhost:3000
```

## Tests

```bash
npm test          # vitest run
```

Covers: owner/shared/unrelated authorization, owner-only sharing, and
`.txt`/`.md` accepted vs. unsupported/oversized/empty rejected.

## File import

```
Supported: .txt, .md
Max size:  1 MB
```

Invalid uploads (unsupported extension, oversized, empty, unreadable, malformed)
produce a visible error and no document is created.

## Deployment

Any Node host that supports Next.js (Vercel, Render, Railway, Fly).

1. Set `DATABASE_URL` to a PostgreSQL connection string.
2. In `prisma/schema.prisma` set `datasource db { provider = "postgresql" }`.
3. Build command: `npm run build` (runs `prisma generate` then `next build`).
4. Release/predeploy step: `npx prisma db push` (or `prisma migrate deploy` if
   you generate migrations) then `npm run db:seed`.
5. Start command: `npm run start`.

Required environment variables:

```
DATABASE_URL   PostgreSQL connection string (with sslmode=require for most hosts)
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md).

## AI workflow

See [AI_WORKFLOW.md](AI_WORKFLOW.md).

## What I would build with another 2–4 hours

- Production authentication (email magic link) replacing the demo cookie
- Viewer vs. editor share roles (the schema already carries a `permission` field)
- Version history with restore
- Real-time presence and collaborative editing (Yjs + WebSocket provider)
- `.docx` import
- Save-conflict detection using `updatedAt` optimistic concurrency
