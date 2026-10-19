# Netlify edition verification

Validated locally on 19 October 2026. No Netlify/Supabase account was provisioned and no live deployment, DNS update, email delivery or customer migration was performed.

## Passed checks

- Strict TypeScript type check.
- ESLint, with existing dynamic JSON/D1-style row typing retained behind runtime validation; no new hooks or navigation warnings.
- Standard Next.js production webpack build, with server-rendered pages and API routes. No Vinext/Cloudflare build dependency remains.
- Production Node/Next HTTP smoke checks: home, service, pricing, about, coverage, booking, gallery, guides, policies, owner landing, robots, sitemap, favicon, manifest and supplied photo load; expected security headers and canonical origin are present; forged legacy owner headers are rejected.
- The exact Supabase SETUP.sql applies successfully to a local PostgreSQL engine with equivalent anonymous/authenticated roles. Anonymous customer-table access is denied.
- Production API handlers execute against real PostgreSQL SQL, range types and exclusion constraints through a test-only connection-pool shim. Supabase Auth and Storage HTTP contracts are mocked; scheduling queries and transactions are not mocked.
- Eight simultaneous API submissions for one slot and eight for different overlapping slots: exactly one reservation succeeds in each test batch. Embedded PostgreSQL executes through one local engine; live multi-connection provider testing remains outstanding.
- Direct insert into a DIFFERENT overlapping option fails the PostgreSQL exclusion constraint independently of the public API's availability check.
- Booking persistence survives closing and reopening the local PostgreSQL engine.
- Hourly generation, two-hour windows, invalid dates, buffers, blocking, full-day blocks protecting newly generated slots, block removal and safe cleanup.
- Cancellation/reopen, cancellation/keep-blocked, rescheduling and preservation of payment/notes/work-time records.
- Existing interior prices remain separate; exterior prices require owner activation; service/address validation and saved quote requests.
- Repeated submission returns the existing confirmation without inserting a duplicate.
- Request limits and cross-origin rejection.
- Owner login upstream-verification contract; wrong user/password/token rejection; HTTP-only, SameSite=Lax, Secure production cookie with one-hour maximum and cookie deletion on logout.
- Private customer photos, sequential uploads, private draft result photos, explicit publication, and newer Supabase secret-key apikey-header behavior.

## Remaining live checks

- Provision actual Supabase PostgreSQL/Auth/private Storage and test the transaction-pooler TLS connection.
- Deploy through Netlify's current automatic Next.js adapter and test real function behavior and environment-variable scopes.
- Verify actual owner account, expired sessions, real storage operations and optional email delivery.
- Test booking races against the live database using synthetic records before public launch.
- Physically test mobile/desktop layout, keyboard navigation, calendar controls and browser image resizing. No browser automation was available; no screenshot, Lighthouse score or measured Core Web Vitals is claimed.
- Verify custom-domain DNS, HTTPS, apex/www redirect, canonical URLs and sitemap after you approve domain changes.
- Transfer existing customer records/photos if there are any; none were exported or migrated in this task.

See NETLIFY_SETUP_GUIDE.md for the acceptance checklist and MIGRATION_AND_ROLLBACK.md for data-preserving cutover.
