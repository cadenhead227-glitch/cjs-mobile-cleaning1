-- CJ's Mobile Cleaning / NEW EMPTY SUPABASE PROJECT ONLY.
-- Run once in Supabase's SQL Editor. Never run over an existing unrelated schema.
BEGIN;
CREATE TABLE public.settings(id integer PRIMARY KEY, data text NOT NULL);
CREATE TABLE public.slots(id text PRIMARY KEY, start text NOT NULL, "end" text NOT NULL, buffer integer NOT NULL DEFAULT 30 CHECK(buffer BETWEEN 0 AND 180), enabled integer NOT NULL DEFAULT 1, removed integer NOT NULL DEFAULT 0);
CREATE TABLE public.bookings(
 id text PRIMARY KEY,slot_id text,name text NOT NULL,email text NOT NULL,phone text NOT NULL,
 zip text NOT NULL,address text NOT NULL DEFAULT '',service text NOT NULL DEFAULT 'legacy-interior',vehicle text NOT NULL,condition text NOT NULL,
 notes text NOT NULL DEFAULT '',internal_notes text NOT NULL DEFAULT '',status text NOT NULL DEFAULT 'booked',
 price integer NOT NULL,paid integer NOT NULL DEFAULT 0,minutes integer NOT NULL DEFAULT 0,upload_hash text NOT NULL,
 created_at text NOT NULL,notification text NOT NULL DEFAULT 'dashboard',reserved_window tstzrange
);
CREATE UNIQUE INDEX unique_active_slot ON public.bookings(slot_id) WHERE status!='cancelled' AND slot_id IS NOT NULL;
ALTER TABLE public.bookings ADD CONSTRAINT overlapping_reservations EXCLUDE USING gist (reserved_window WITH &&) WHERE(status!='cancelled' AND reserved_window IS NOT NULL);
CREATE TABLE public.files(id text PRIMARY KEY,booking_id text NOT NULL,key text NOT NULL,type text NOT NULL,created_at text NOT NULL);
CREATE TABLE public.results(id text PRIMARY KEY,title text NOT NULL,area text NOT NULL,description text NOT NULL,before_key text NOT NULL,after_key text NOT NULL,published integer NOT NULL DEFAULT 0,created_at text NOT NULL);
CREATE TABLE public.availability_blocks(id text PRIMARY KEY,start text NOT NULL,"end" text NOT NULL,source_slot_id text,reason text NOT NULL DEFAULT '',created_at text NOT NULL,CHECK("end"::timestamptz>start::timestamptz));
CREATE INDEX blocks_window ON public.availability_blocks(start,"end");
CREATE TABLE public.request_limits(key text PRIMARY KEY,count integer NOT NULL,expires_at bigint NOT NULL);
CREATE INDEX limits_expiry ON public.request_limits(expires_at);
CREATE FUNCTION public.julianday(value text) RETURNS double precision LANGUAGE sql STABLE AS $$ SELECT extract(epoch FROM value::timestamptz)::double precision/86400.0 $$;
CREATE FUNCTION public.protect_booking() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE selected slots; needs_validation boolean;
BEGIN
 PERFORM pg_advisory_xact_lock(1720251019);
 IF NEW.slot_id IS NULL OR NEW.status='cancelled' THEN NEW.reserved_window:=NULL;RETURN NEW;END IF;
 IF TG_OP='INSERT' THEN needs_validation:=true;ELSE needs_validation:=NEW.slot_id IS DISTINCT FROM OLD.slot_id OR OLD.status='cancelled';END IF;
 SELECT * INTO selected FROM slots WHERE id=NEW.slot_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'appointment_conflict';END IF;
 IF needs_validation THEN
  IF selected.enabled!=1 OR selected.removed!=0 OR selected.start::timestamptz<=now() THEN RAISE EXCEPTION 'appointment_conflict';END IF;
  IF EXISTS(SELECT 1 FROM availability_blocks b WHERE selected.start<b."end" AND selected."end">b.start) THEN RAISE EXCEPTION 'appointment_conflict';END IF;
 END IF;
 NEW.reserved_window:=tstzrange(selected.start::timestamptz,selected."end"::timestamptz+selected.buffer*interval '1 minute','[)');
 RETURN NEW;
END $$;
CREATE TRIGGER protect_booking BEFORE INSERT OR UPDATE OF slot_id,status ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.protect_booking();
CREATE FUNCTION public.serialize_blocks() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$ BEGIN PERFORM pg_advisory_xact_lock(1720251019);RETURN NEW;END $$;
CREATE TRIGGER serialize_blocks BEFORE INSERT OR UPDATE ON public.availability_blocks FOR EACH ROW EXECUTE FUNCTION public.serialize_blocks();
-- No browser/public API role may read or mutate business records directly.
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.settings,public.slots,public.bookings,public.files,public.results,public.availability_blocks,public.request_limits FROM anon,authenticated;
COMMIT;
