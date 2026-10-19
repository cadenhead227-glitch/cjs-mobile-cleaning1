# CJ’s Mobile Cleaning — Netlify setup using website dashboards

Use the NEW Netlify source ZIP. Do not combine it with the previous Cloudflare package. This project now uses standard Next.js on Netlify plus Supabase PostgreSQL, Auth and private Storage. You do not need a local command shell for this setup; Netlify runs npm/build commands for you, and you paste the supplied SQL into Supabase’s browser editor.

No live deployment, external account, DNS record, database migration or purchase was performed for you. The old hosted Site and records remain unchanged.

## 1. Download and extract

Extract `CJs_Mobile_Cleaning_Netlify.zip`. Open its `cjs-mobile-cleaning-netlify` folder. The contents include package.json, package-lock.json, netlify.toml, app, lib, public, components, supabase and this guide.

This is a lean source package with fewer than 100 files. Build output and installed dependencies are intentionally excluded. Do not upload an outer wrapper folder, the ZIP itself, node_modules, .next, .env.local or real credentials.

## 2. Create your Supabase project

Go to https://supabase.com/dashboard and create an organization/project. Choose a suitable region near your hosting region. Save the DATABASE password securely; it is different from your Supabase account password and the owner login password.

Review the plan/usage terms shown in the dashboard before accepting. Keep the project available for bookings; account limits or a paused project can make the backend unavailable. No specific paid plan is assumed.

If you already have real customer bookings on the old website, read MIGRATION_AND_ROLLBACK.md before creating a blank replacement schedule or changing your live domain.

## 3. Create the database tables

In the Supabase project open **SQL Editor → New query**.

Open `supabase/SETUP.sql` from the download, copy ALL of it, paste it into the SQL Editor and click **Run**.

Run it only once in a new/empty project. It creates persistent booking tables, an exclusion constraint against overlapping appointments, scheduling-block controls, submission-rate counters and Row Level Security. It revokes direct anonymous/authenticated browser access to customer records. Do not add a public read/write policy to these business tables.

Check that these tables appear in the Table Editor:

- settings
- slots
- bookings
- files
- results
- availability_blocks
- request_limits

The SQL is for PostgreSQL. Do NOT run the old Cloudflare/SQLite `drizzle` migrations here. No sample customer records are seeded.

## 4. Create private photo storage

In Supabase open **Storage → New bucket**.

- Bucket name: `cjs-private-photos`
- Public bucket: **OFF**
- Allowed file types: image/jpeg, image/png, image/webp
- Maximum individual file size: 2 MB (the application prepares images to at most 1 MiB before upload)

The site accesses this private bucket from authenticated server code. Do not add anonymous upload/download policies or enable a public bucket URL. Published before/after images are served through the site after its publication check; customer-uploaded images remain owner-only.

## 5. Create the owner account

Open **Authentication → Users → Add user → Create user** (wording can vary).

Enter your owner email and a strong unique password. Confirm/auto-confirm the email when creating this account. Save the password securely. Do not use the database password as the login password.

Under **Authentication → Sign In / Providers** or general authentication settings, disable new public user signups. Keep email/password sign-in enabled. You manually create the owner; visitors never need an account to book.

There is no website signup page. Even another authenticated Supabase account cannot administer the business unless its confirmed email matches OWNER_EMAIL.

## 6. Collect your project configuration

In Supabase:

**Project URL:** from project API settings / Connect.

**Publishable key:** Settings → API Keys, usually beginning `sb_publishable_`.

**Secret key:** Settings → API Keys, beginning `sb_secret_`. Keep this server-side and never paste it into GitHub or a customer-facing page. This is NOT your account personal access token.

**Database connection string:** click **Connect → Transaction pooler**, copy the PostgreSQL URI (normally port 6543), replace the password placeholder with your database password. Preserve the full project-specific username, hostname and port. URL-encode special password characters in the password portion. Do not use the raw IPv6-only direct endpoint for this serverless setup.

The application accepts legacy anon/service_role keys as compatibility fallbacks, but the new publishable/secret key names are preferred. New API keys are sent in `apikey`; the code does not incorrectly treat `sb_secret_` as a JWT.

## 7. Upload the NEW source to GitHub

At https://github.com create a new PRIVATE repository named `cjs-mobile-cleaning-netlify`. Starting fresh avoids leftover Cloudflare files. If you keep the same repository, remove the old source first only after preserving its backup.

Choose **Add file → Upload files**. Drag the CONTENTS of the extracted folder into GitHub. The new package is under 100 files. Commit the upload.

`package.json`, `package-lock.json` and `netlify.toml` must be visible at the repository root. A harmless `.env.example` documents variable names but contains no real values. The actual credentials go into Netlify’s dashboard, not a committed .env file. Hidden template files may need Explorer’s hidden-file visibility option; none contain required secret values.

## 8. Create your Netlify project

Go to https://app.netlify.com and choose **Add new project → Import an existing project → GitHub**. Authorize access only to the intended repository and select `cjs-mobile-cleaning-netlify`.

Use these settings:

| Setting | Value |
| --- | --- |
| Production branch | main (or your actual primary branch) |
| Base directory | leave blank if package.json is at repository root |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | 24 (already specified in netlify.toml) |

Do not choose Netlify Drop/manual static ZIP upload. This is a server-rendered app with API functions, not an HTML-only export. Netlify automatically supplies its current Next.js adapter; do not set NETLIFY_NEXT_PLUGIN_SKIP.

If the initial import deploys before variables are configured, the site can show its public pages but booking storage/login stay unavailable. This is not a completed launch. Add variables next and redeploy before inviting customers.

## 9. Set environment variables in Netlify

Open **Project configuration → Environment variables**. Add the values below with Production context. Use both Builds and Functions scopes where scope selection is available (or all scopes). They must be available to server functions, not only the build process.

| Name | Value |
| --- | --- |
| SITE_ORIGIN | Exact `https://your-project.netlify.app` URL initially; replace with final canonical custom domain later |
| DATABASE_URL | Supabase Transaction pooler PostgreSQL URI, including password |
| SUPABASE_URL | `https://your-project.supabase.co` |
| SUPABASE_PUBLISHABLE_KEY | Your Supabase publishable key |
| SUPABASE_SECRET_KEY | Your Supabase server secret key |
| SUPABASE_STORAGE_BUCKET | `cjs-private-photos` |
| OWNER_EMAIL | Exact confirmed email of the manually created owner account |

Mark credential values secret where Netlify offers that option. Do not prefix any of them with NEXT_PUBLIC_. Never send me your database password or secret key in a chat message.

If strict TLS verification reports an unknown CA, obtain the database CA PEM certificate from Supabase’s SSL settings and add it as **DATABASE_CA_CERT**. The code deliberately does not disable certificate verification. Do not solve certificate errors with NODE_TLS_REJECT_UNAUTHORIZED=0.

For now, omit the optional email variables. To enable email later, add RESEND_API_KEY, NOTIFICATION_FROM (verified sender) and BUSINESS_NOTIFICATION_EMAIL. The dashboard accurately reports disconnected email and customers still receive saved on-screen confirmations. Test real inbox delivery before relying on it.

Use a separate Supabase project/database for deploy previews, or leave backend credentials unavailable outside Production. Do not let unreviewed preview code mutate the production schedule.

After adding/changing variables, use **Deploys → Trigger deploy → Deploy project**. The rebuilt functions receive the updated environment. Connecting GitHub means later pushes may deploy automatically; review that behavior before making live changes.

## 10. Verify on the Netlify address before changing your domain

Open your actual HTTPS Netlify URL. Public pages should load without any ChatGPT login or editor controls.

Visit `/owner`, sign in with your manually created Supabase email/password. Login uses an HTTP-only cookie, limited to at most one hour; sign in again after expiration. There is no hardcoded administrator password.

In **Website settings**:

1. Review the proposed exterior prices ($60 sedan/coupe, $70 small SUV/crossover, $85 large SUV/truck).
2. Check the explicit approval/activation box and Save only when ready.
3. Add actual business phone/email if you want them shown publicly.
4. Confirm coverage and FAQs. Previous interior price values remain separate; interior services are not currently advertised.

Before activation the public website accepts quote requests and does not display unapproved exterior prices. Quote requests never reserve a time.

In **Availability**:

1. Generate a future Phoenix day with hourly starts and two-hour appointment windows.
2. Set a travel buffer appropriate to your route.
3. Block your unavailable windows/days.
4. Review daily and seven-day schedules.

Create a clearly marked test booking using contact details you control. Check:

- Customer address and vehicle/service are saved.
- Booking 7:30–9:30 removes overlapping 8:30–10:30.
- With zero travel buffer, 9:30–11:30 remains available.
- Refreshing or closing/reopening a browser retains the booking.
- Two conflicting submissions cannot both reserve a window.
- Cancellation can reopen a window or keep it blocked; records/payment notes remain.
- Full-day blocks still apply after generating more options.
- Owner reschedule and private photo viewing work.
- Owner before/after upload stays private until explicitly published with permission.
- Signing out blocks administrative API requests.
- Test on your phone and desktop, including calendar selection and the owner dashboard.

Source photos may be up to 5 MB each. The browser resizes them to JPEG at up to 1600 pixels and 1 MB before sending. Customer photos are sent individually; owner result pairs stay below the server request limit. This avoids Netlify’s buffered function payload ceiling.

Keep the test appointment marked cancelled or identifiable; never delete real customer records merely to clean up tests.

## 11. Connect your existing Cloudflare-managed domain

Do this only after Netlify-hosted acceptance checks pass and you approve the live DNS change.

1. In Netlify open **Domain management → Add a domain you already own**.
2. Enter your chosen canonical hostname. Keep using your existing external DNS provider; you do not need to transfer registration or change nameservers.
3. Netlify displays the exact required DNS records. In Cloudflare **DNS → Records**, add/update only those website records. Use the Netlify-provided target; do not guess an IP address. Preserve MX/TXT records used by email and other services.
4. Use DNS-only records during initial verification/certificate setup. Confirm the hostname resolves to Netlify and its certificate becomes active before considering additional proxy configuration.
5. Add/check both apex and www in Netlify, choose the primary domain and verify the alternate redirects while preserving paths.
6. In Netlify’s HTTPS settings verify the certificate and HTTPS redirect.
7. Change SITE_ORIGIN to the final primary HTTPS address and redeploy.
8. Sign in again on the custom domain and repeat the booking/owner/image checks. Cookies do not transfer from netlify.app to your custom hostname.
9. Confirm sitemap.xml, robots.txt, canonical URLs and social image use the final domain.

Do not leave the old site and the new site accepting bookings into separate databases at the same time.

## 12. Updates, account recovery and rollback

Commit future source changes to GitHub; Netlify builds the site. Routine opening/blocking appointments and price/content changes happen in the owner dashboard without touching GitHub.

For an expired session, sign in again. For a forgotten owner password, use Supabase’s project dashboard to reset/update the manually created user. No public password-recovery endpoint was added to this application.

Retain the old Cloudflare package and any database/photo backups. Netlify’s prior deployment rollback can revert site code, but it does not roll back customer data. Never restore old database backups over newer bookings without reconciliation. See MIGRATION_AND_ROLLBACK.md.

## Optional developer commands

Only needed if someone wants to build/test locally; you do NOT need to run these for dashboard setup:

```sh
npm ci
npm run typecheck
npm run lint
npm run build
npm test
node tests/smoke.mjs
```

## Official references checked 19 October 2026

- https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- https://docs.netlify.com/build/functions/configuration/
- https://docs.netlify.com/build/functions/environment-variables/
- https://docs.netlify.com/manage/domains/manage-domains/assign-a-domain-to-your-site-app/
- https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers
- https://supabase.com/docs/guides/getting-started/api-keys
- https://supabase.com/docs/guides/auth/users
- https://supabase.com/docs/guides/auth/general-configuration
- https://supabase.com/docs/guides/storage/buckets/fundamentals
