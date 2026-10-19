# Existing customer data and safe cutover

The old Cloudflare version and any live customer data were not modified. This Netlify source ZIP contains no real customers, credentials or private photos. Running Supabase SETUP.sql creates empty tables; it does not transfer old records.

If you have no real bookings or photos yet, use the fresh-project setup guide.

If you have existing records:

1. Retain the previous source/package and a recoverable database/photo backup before changing traffic.
2. Schedule a cutover window. Pause new bookings on the old site while transferring final records; do not run two independent booking databases at once.
3. Obtain an authorized D1 export of settings, slots, bookings, files, results and availability_blocks. Request-limit counters need not transfer. Exports may contain personal information and upload-token hashes: keep them private and out of GitHub.
4. Obtain private R2 objects and their exact object keys/content types. Transfer them to the private Supabase bucket without renaming keys. Importing SQL alone will not transfer photos.
5. Test in a separate new Supabase project first. SQLite exports are NOT valid PostgreSQL imports; backticks, trigger syntax and schema definitions differ. Use the supplied new schema and map row values, preserving IDs and booking-slot references.
6. Import settings/slots and stage booking rows before enabling reservations. Historical bookings cannot simply pass the new-booking future-time trigger. An authorized data migration must load history transactionally without applying new-booking validation, then derive each active reservation's tstzrange from its slot start/end plus buffer before re-enabling the trigger. The exclusion constraint must still validate the imported schedule. Do not disable it to conceal real conflicts.
7. Preserve customer addresses where present; leave absent legacy addresses blank. Preserve original service IDs or mark legacy records legacy-interior. Preserve payment/work-time/private-note fields and statuses. Do not fabricate historical prices or contact details.
8. Verify per-table row counts, IDs, upcoming appointment times in America/Phoenix, cancellation status, payments, private photo visibility and published result images. Resolve any conflicting future slots with the business owner before taking new bookings.
9. Only after verification, configure production Netlify variables to the intended Supabase project and switch the domain. Re-test owner access and customer booking flows.
10. Keep the previous site available as a rollback option until the new deployment is verified, while ensuring only one active system accepts bookings.

A ready-to-run import of actual records cannot be prepared or verified without the authorized export. No blind or destructive migration has been performed. If records exist, complete the export/mapping stage before public launch rather than starting with an empty replacement schedule.

## Rollback

Netlify can restore an earlier deployment of code; that does not restore or rewind Supabase data. Prefer additive schema changes so older compatible code remains usable.

If reverting traffic to the old site, first reconcile any bookings created on Netlify/Supabase since cutover. Never overwrite a newer production database with an old backup or silently discard new appointments. Preserve private objects until their retention obligations are resolved.

## Continued backups

Use Supabase's database backup/export facilities appropriate to your account and separately retain private storage objects. A database backup alone is not a backup of photo file bytes. Keep all exports outside your public website and source repository.
