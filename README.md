# Youth Finance First — Editorial Workspace

A responsive editorial application for article uploads, editorial feedback, article-cycle progress, and permanent historical performance. The interface follows the Youth Finance First public brand's friendly financial-education tone and blue-led visual character, while remaining an original admin workspace.

**Want this live on a permanent link?** Read [`DEPLOYMENT.md`](./DEPLOYMENT.md) — it is a step-by-step beginner's guide using GitHub, Neon, and Vercel.

## Architecture

- **Next.js App Router + TypeScript (strict)** for protected server routes and the responsive interface.
- **PostgreSQL + Drizzle ORM** for users, writer profiles, articles, stored-file metadata, feedback, cycle checklists, timer state, immutable cycle snapshots, and audit logs.
- **Auth.js credentials sign-in** with bcrypt password hashes and JWT sessions. Roles are stored in the database and re-loaded from PostgreSQL on every API request.
- **Zod** validation on the server and in forms.
- **Private local file adapter** (`FileStorageAdapter`) storing UUID-keyed blobs outside `public/`, ready to swap for Vercel Blob, Azure Blob Storage, or S3.
- **Vitest** unit tests and **Playwright** end-to-end tests.

## Features

- Two administrator accounts and any number of writer accounts, each verified by their own email and password.
- Writers see only their own articles and feedback.
- Writers can update **their own** three cycle steps; administrators can update anyone's.
- PDF, DOC, DOCX, and TXT uploads up to 25 MB, plus optional JPG/PNG/WebP thumbnails up to 5 MB.
- Safe preview for PDF, TXT, and images; an explanatory download page for Word files.
- Multi-entry chronological feedback with preserved line breaks, quoted and italicised, editable and deletable only by the administrator who wrote it.
- Exactly three checklist items per writer, producing 0%, 33%, 67%, or 100%, shown as an animated ring with a text value.
- UTC-backed cycle timer with pause/resume, accurate across refreshes and restarts.
- Atomic, idempotent "New Article Cycle" rollover that snapshots every writer, records real dates and elapsed duration, and starts a fresh one-calendar-month timer.
- Spreadsheet-style backlog with sticky writer column and header, writer search, progress filter, archived-writer history, "Not participating" markers, and Excel-friendly CSV export.

## Getting started

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` to your PostgreSQL database and `AUTH_SECRET` to a long random value:

```bash
openssl rand -base64 32
```

Create the tables and load the starting data:

```bash
npx drizzle-kit push
npx tsx scripts/seed.ts
```

Run it:

```bash
npm run dev
```

Open <http://localhost:3000>. You are asked to sign in.

## Accounts created by the seed

| Role | Email | Password |
| --- | --- | --- |
| Administrator | `admin@youthfinancefirst.com` | `YFFAdmin!2026` |
| Administrator | `editor@youthfinancefirst.com` | `YFFEditor!2026` |
| Writer | `ava.chen@youthfinancefirst.com` | `YFFWriter!2026` |
| Writer | `elijah.brooks@youthfinancefirst.com` | `YFFWriter!2026` |
| Writer | `mila.jones@youthfinancefirst.com` | `YFFWriter!2026` |
| Writer | `noah.patel@youthfinancefirst.com` | `YFFWriter!2026` |

Change these before sharing the link:

```bash
npx tsx scripts/set-password.ts admin@youthfinancefirst.com 'YourNewLongPassword1!'
```

## Who can do what

| Action | Administrator | Writer |
| --- | --- | --- |
| Add / edit / archive writers | Yes | No |
| Upload an article | For any writer | For themselves |
| Open / download articles | Any | Their own |
| Read feedback | Any | Their own |
| Submit, edit, delete feedback | Yes (their own entries) | No |
| Update cycle checklist | Any writer | **Their own** |
| Timer on / off | Yes | No |
| Start a new cycle | Yes | No |
| View backlog | All writers | Their own row |
| Export backlog CSV | Yes | Yes (own row) |

Permissions are enforced on the server in `src/lib/permissions.ts`, not only in the interface.

## Tests and quality checks

```bash
npx vitest run          # unit tests: progress, timer, validation, permissions, CSV
npx playwright test     # end-to-end workflow
npm run lint            # ESLint
npx next typegen        # route type generation
npm exec tsc -- --noEmit  # strict TypeScript
npm run build           # production build
```

Playwright starts its own development server on port 3100, so it does not clash with `npm run dev`.

## Production build

```bash
npm run build
npm run start
```

## Security notes

- Passwords are bcrypt-hashed with cost 12. None are stored in plain text.
- Sessions are signed with `AUTH_SECRET`, which is validated on startup.
- Every API route re-reads the account's role and active status from PostgreSQL.
- Writer-scoped endpoints reject attempts to read or change another writer's records with `403`.
- Mutating endpoints reject mismatching `Origin` headers.
- Uploads are checked for size, extension, MIME type, and file signature. Filenames are sanitised against path traversal. Files are served with `nosniff`, a safe `Content-Disposition`, and a restrictive `Content-Security-Policy`, and are never executed.
- Cycle rollover uses a row lock, a serializable transaction, a unique request key, and a single-active-cycle constraint so partial history cannot be created.
- Every sensitive action is written to `audit_logs`.

## Project layout

```
src/app/(workspace)/    Articles, Feedback, Current article cycle, Backlog
src/app/api/            REST endpoints (writers, articles, files, feedback, cycle, backlog)
src/components/         App shell, dialogs, cards, progress ring, toasts
src/lib/                Permissions, progress, timer, validation, storage, CSV, env
src/db/                 Drizzle schema and client
scripts/                Seed and password helper
tests/                  Vitest unit tests
e2e/                    Playwright end-to-end test
drizzle/                Generated SQL migrations
```

## Replacing the logo

Replace `public/yff-logo.svg` with the approved Youth Finance First logo, keeping the same filename. If the dimensions differ, update the `width` and `height` props on the `next/image` in `src/components/app-shell.tsx` and `src/app/login/page.tsx`.

## Switching to cloud storage

See Step 5 of [`DEPLOYMENT.md`](./DEPLOYMENT.md). Implement the three methods of `FileStorageAdapter` in `src/lib/storage.ts` and use the new adapter in the article upload, preview, and download routes. Keep the UUID `storageKey` values so no database or interface changes are needed.

## Assumptions

- Two administrators are seeded by design; more can be created by changing the role in the database or by extending the writer-creation endpoint.
- Removing a writer archives them rather than deleting them, so their articles and history remain in the backlog.
- Only administrators submit feedback; writers read the feedback on their own articles.
- Cycle length is one calendar month, clipped to the last valid day of the following month.
- Dates are stored in UTC (`timestamptz`) and displayed in the viewer's local timezone; CSV headings use UTC dates for consistency.
