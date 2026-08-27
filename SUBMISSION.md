# Submission

## Live product

URL: <ADD_AFTER_DEPLOYMENT>

## Demo users

- Ayush — ayush@demo.local
- Alex — alex@demo.local
- Maya — maya@demo.local

## Included materials

- source code
- README.md
- ARCHITECTURE.md
- AI_WORKFLOW.md
- SUBMISSION.md
- walkthrough-url.txt
- screenshots/

## Working functionality

- [x] Create document
- [x] Rename document
- [x] Rich-text editing
- [x] Save/reopen
- [x] `.txt` import
- [x] `.md` import
- [x] Ownership
- [x] Sharing
- [x] Owned/shared distinction
- [x] Persistent storage
- [x] Automated tests
- [x] Production build
- [ ] Live deployment  — pending: needs a PostgreSQL URL and a host

Verification performed: `npm test` (11 pass), `npx tsc --noEmit` (clean),
`npm run build` (pass), and a full HTTP end-to-end run of the create → rename →
edit → refresh → share → cross-user access → denial flow. Browser walkthrough and
screenshots are the remaining manual step for the candidate.

## Known limitations

- Auto-save is last-write-wins; no conflict resolution for simultaneous editors.
- Demo cookie auth by design — no login step.
- Markdown import flattens deeply nested constructs.

## With another 2–4 hours

- Production authentication (magic link) replacing the demo cookie
- Viewer/editor share roles (schema already has `permission`)
- Version history with restore
- Real-time presence / collaborative editing
- `.docx` import
- Optimistic-concurrency save-conflict detection
