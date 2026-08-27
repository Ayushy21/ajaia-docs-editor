# AI Workflow

## Tools used

- Claude Code (primary implementation agent)
- _<add any other tools you personally used, e.g. editor Copilot, ChatGPT>_

## Where AI materially accelerated the work

- **Repository analysis** — confirming the repo was empty and choosing a stack
  aligned with the assignment's preferred architecture.
- **Scaffolding** — generating the Next.js App Router project, Tailwind/PostCSS
  config, Prisma schema, and seed script in one pass.
- **Editor integration** — wiring TipTap (StarterKit + Underline + Placeholder)
  with SSR-safe config, a toolbar with active-state detection, and a debounced
  auto-save state machine.
- **Server authorization** — factoring `getDocumentAccess` into a single helper
  with a narrow injectable DB interface so it is unit-testable.
- **File import** — mapping `marked` tokens to ProseMirror/TipTap JSON nodes for
  `.md`, and paragraph/hard-break handling for `.txt`.
- **Test creation** — the authorization matrix and import-validation test suites.
- **Documentation** — README, this file, ARCHITECTURE, and SUBMISSION drafts.

## What AI-generated output I changed or rejected

- Kept persistence as **structured TipTap JSON**, not raw HTML, so re-loading a
  document cannot execute injected markup.
- Made the permission helpers accept an injected DB client so tests exercise the
  real branching logic without a database or mocking framework.
- Ensured a failed auto-save **keeps local editor content** and retries, rather
  than surfacing an error and dropping the buffer.
- Sharing returns **404 (not 403)** for users with no relationship to a document,
  so the API does not confirm a document's existence to strangers.
- _<record any further changes you made by hand>_

## How correctness was verified

- `npm test` — 11 passing tests (authorization + import validation).
- `npx tsc --noEmit` — clean.
- `npm run build` — production build succeeds; lint runs clean during build.
- Manual end-to-end via HTTP: create → rename → edit content → refresh (persists);
  Ayush shares with Alex → Alex gets `200` → Maya gets `404` on the same URL and
  `404` when attempting to share; `.md` import succeeds, `.png` import rejected
  with a visible error.
- _<add: manual browser walkthrough, screenshots, deployed smoke test>_
