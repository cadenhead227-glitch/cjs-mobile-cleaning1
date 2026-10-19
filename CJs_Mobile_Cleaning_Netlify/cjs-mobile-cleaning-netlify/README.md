# CJ’s Mobile Cleaning — Netlify edition

Read **NETLIFY_SETUP_GUIDE.md** first. It walks through setup using GitHub, Netlify and Supabase dashboards, with no local terminal required.

This is a standard Next.js 16 / React 19 application. Netlify hosts the server-rendered site and API functions. Supabase provides PostgreSQL, private photo storage and the manually created owner account. No Cloudflare binding or ChatGPT login is required.

## Netlify build settings

- Base directory: repository root (package.json must be at root)
- Build: `npm run build`
- Publish: `.next`
- Node: 24, configured in netlify.toml
- Current Netlify Next.js adapter: automatic

Use GitHub import, not Netlify Drop or a static ZIP upload. The deploy package is source code, not a prebuilt Netlify function bundle.

## Backend setup

Run `supabase/SETUP.sql` once on a new, empty Supabase project through its SQL Editor. Create a private `cjs-private-photos` bucket, a confirmed owner email/password account, and disable public signup. Configure Netlify variables documented in `.env.example`.

Never commit DATABASE_URL, passwords, a Supabase secret key or real customer records. No NEXT_PUBLIC credential variables are used. TLS database verification stays enabled.

## Preserved features

- Exact supplied owner photograph, responsive WebP variants and CJ’s branding
- Exterior service scope, quote requests and explicit approval before activating proposed prices
- Preserved legacy interior-price fields; no currently advertised interior service
- Two-hour Phoenix appointment windows, hourly starting options, travel buffer and database-enforced no-overlap constraint
- Full-day and individual blocks; removal of unbooked options without deleting customers
- Cancellation, rescheduling, daily/seven-day owner views, payment records and CSV export
- Customer addresses and private photos; before/after sets require publication with permission
- HTTP-only, Secure-in-production, SameSite owner cookie; server checks every admin operation against Supabase’s verified user endpoint and OWNER_EMAIL
- Public request limits, validation, parameterized SQL, honeypot and security headers
- Duplicate request recovery, truthful saved confirmation and optional Resend email delivery

The browser prepares source images to at most 1 MiB and 1600 pixels before upload. Source files can be at most 5 MB. Customer images upload one at a time to fit Netlify function payload limits.

## Developer checks (optional for dashboard setup)

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm test
node tests/smoke.mjs
```

Tests execute the production API handler source against a persistent embedded PostgreSQL engine. Test-only adapters provide Next request cookies and an isolated PostgreSQL connection pool; Supabase Auth/Storage HTTP responses are mocked. Real provider credentials, Netlify deployment and physical-device browser testing are not claimed. Read TESTING_SUMMARY.md for details.

No live deployment or data migration has occurred. Read MIGRATION_AND_ROLLBACK.md if the old website contains real bookings before cutting over.
