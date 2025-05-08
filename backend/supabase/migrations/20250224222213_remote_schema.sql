create schema if not exists "powersync";


drop policy "Enable insert for authenticated users only" on "public"."proposals";

drop view if exists "public"."decrypted_organization_integrations";

create table "public"."profile_keys" (
    "user_id" uuid not null,
    "key" text not null
);


alter table "public"."profile_keys" enable row level security;

alter table "public"."profiles" drop column "avatar_url";

alter table "public"."profiles" drop column "manage_reference_id";

alter table "public"."profiles" add column "contact_id" bigint;

alter table "public"."profiles" add column "system_member_id" bigint;

alter table "public"."proposal_settings" alter column "assumptions" drop not null;

alter table "public"."proposals" add column "fts" tsvector generated always as (to_tsvector('english'::regconfig, ((name || ' '::text) || company_name))) stored;

CREATE UNIQUE INDEX profile_keys_pkey ON public.profile_keys USING btree (user_id);

CREATE INDEX proposals_fts ON public.proposals USING gin (fts);

alter table "public"."profile_keys" add constraint "profile_keys_pkey" PRIMARY KEY using index "profile_keys_pkey";

alter table "public"."profile_keys" add constraint "profile_keys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."profile_keys" validate constraint "profile_keys_user_id_fkey";

set check_function_bodies = off;

create or replace view "public"."calculate_totals" as  WITH ticket_hours AS (
         SELECT sum(t.budget_hours) AS total_hours
           FROM (phases p
             JOIN tickets t ON ((p.id = t.phase)))
          GROUP BY p.id
        ), product_totals AS (
         SELECT sum(
                CASE
                    WHEN (p.product_class = 'Bundle'::text) THEN (p.calculated_price * p.quantity)
                    ELSE (p.price * p.quantity)
                END) AS total_product,
            sum(
                CASE
                    WHEN (p.product_class = 'Bundle'::text) THEN (p.calculated_cost * p.quantity)
                    ELSE (p.cost * p.quantity)
                END) AS total_cost,
            sum(
                CASE
                    WHEN p.recurring_flag THEN (p.price * p.quantity)
                    ELSE (0)::numeric
                END) AS total_recurring
           FROM products p
          WHERE (NOT (p.recurring_flag AND (p.recurring_bill_cycle = 2)))
          GROUP BY p.id
        ), labor_totals AS (
         SELECT (COALESCE(sum(th.total_hours), (0)::numeric) * max(pr.labor_rate)) AS labor_total
           FROM ticket_hours th,
            proposals pr
        )
 SELECT lt.labor_total,
    pt.total_product,
    pt.total_recurring,
    ((pt.total_product + pt.total_recurring) + lt.labor_total) AS total_price,
    (pt.total_cost + pt.total_recurring) AS total_cost
   FROM labor_totals lt,
    product_totals pt;


CREATE OR REPLACE FUNCTION public.read_secret(secret_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  secret text;
begin
  if current_setting('role') != 'service_role' then
    raise exception 'authentication required';
  end if;
 
  select decrypted_secret from vault.decrypted_secrets where name =
  secret_name into secret;
  return secret;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$-- declare
--   manageReferenceId int;
begin
  -- select get_member::int 
  -- into manageReferenceId 
  -- from public.get_member(new.raw_user_meta_data->>'email');

  insert into public.profiles (
    id, 
    first_name, 
    last_name,
    organization,
    username
  )
  values (
    new.id, 
    SPLIT_PART(new.raw_user_meta_data->>'full_name', ' ', 1),
    SPLIT_PART(new.raw_user_meta_data->>'full_name', ' ', 2),
    '1c80bfac-b59f-420b-8b0e-a330aa377edd',
    new.raw_user_meta_data->>'preferred_username'
  );

  return new;
end;$function$
;

grant delete on table "public"."profile_keys" to "anon";

grant insert on table "public"."profile_keys" to "anon";

grant references on table "public"."profile_keys" to "anon";

grant select on table "public"."profile_keys" to "anon";

grant trigger on table "public"."profile_keys" to "anon";

grant truncate on table "public"."profile_keys" to "anon";

grant update on table "public"."profile_keys" to "anon";

grant delete on table "public"."profile_keys" to "authenticated";

grant insert on table "public"."profile_keys" to "authenticated";

grant references on table "public"."profile_keys" to "authenticated";

grant select on table "public"."profile_keys" to "authenticated";

grant trigger on table "public"."profile_keys" to "authenticated";

grant truncate on table "public"."profile_keys" to "authenticated";

grant update on table "public"."profile_keys" to "authenticated";

grant delete on table "public"."profile_keys" to "service_role";

grant insert on table "public"."profile_keys" to "service_role";

grant references on table "public"."profile_keys" to "service_role";

grant select on table "public"."profile_keys" to "service_role";

grant trigger on table "public"."profile_keys" to "service_role";

grant truncate on table "public"."profile_keys" to "service_role";

grant update on table "public"."profile_keys" to "service_role";

create policy "Anyone can insert"
on "public"."profile_keys"
as permissive
for insert
to public
with check (true);


create policy "Only Can Select Own Keys"
on "public"."profile_keys"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "Enable insert for authenticated users only"
on "public"."proposals"
as permissive
for insert
to public
with check (true);



revoke insert on table "reporting"."conversations_new" from "anon";

revoke select on table "reporting"."conversations_new" from "anon";

revoke update on table "reporting"."conversations_new" from "anon";

revoke insert on table "reporting"."conversations_new" from "authenticated";

revoke select on table "reporting"."conversations_new" from "authenticated";

revoke update on table "reporting"."conversations_new" from "authenticated";

alter table "reporting"."conversations_new" drop constraint "conversations_new_pkey1";

drop index if exists "reporting"."conversations_new_pkey1";

drop table "reporting"."conversations_new";

CREATE INDEX conversations_date_idx ON reporting.conversations USING btree (date);

set check_function_bodies = off;

create materialized view "reporting"."abandoned_conversations_by_day" as  SELECT date(conversations.date) AS conversation_date,
    count(*) AS abandoned_count,
    (avg(conversations.abandon_time))::integer AS average_abandon_time
   FROM reporting.conversations
  WHERE (conversations.abandoned IS NOT NULL)
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date));


create or replace view "reporting"."calls_by_agent" as  SELECT conversations.agent,
    sum(
        CASE
            WHEN (conversations.direction = 'Inbound'::text) THEN 1
            ELSE 0
        END) AS inbound_calls,
    sum(
        CASE
            WHEN (conversations.direction = 'Outbound'::text) THEN 1
            ELSE 0
        END) AS outbound_calls
   FROM reporting.conversations
  GROUP BY conversations.agent
  ORDER BY conversations.agent;


create materialized view "reporting"."calls_by_agent_by_day" as  SELECT conversations.date,
    conversations.agent,
    count(*) AS total_conversations,
    sum(
        CASE
            WHEN (conversations.direction ~~* 'Inbound'::text) THEN 1
            ELSE 0
        END) AS inbound_calls,
    sum(
        CASE
            WHEN (conversations.direction ~~* 'Outbound'::text) THEN 1
            ELSE 0
        END) AS outbound_calls,
    sum(COALESCE(conversations.talk_time, (0)::bigint)) AS total_talk_time
   FROM reporting.conversations
  WHERE (conversations.agent IS NOT NULL)
  GROUP BY conversations.date, conversations.agent
  ORDER BY conversations.date DESC, conversations.agent;


create materialized view "reporting"."calls_summary_by_day" as  SELECT date(conversations.date) AS call_date,
    count(*) AS total_calls,
    count(
        CASE
            WHEN (conversations.direction ~~* 'Inbound'::text) THEN 1
            ELSE NULL::integer
        END) AS inbound_conversations,
    count(
        CASE
            WHEN (conversations.direction ~~* 'Outbound'::text) THEN 1
            ELSE NULL::integer
        END) AS outbound_conversations,
    sum(COALESCE(conversations.talk_time, (0)::bigint)) AS total_talk_time
   FROM reporting.conversations
  WHERE ((conversations.date IS NOT NULL) AND (conversations.talk_time > 0))
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date));


create materialized view "reporting"."conversations_by_agent_by_day" as  SELECT date(conversations.date) AS conversation_date,
    conversations.agent,
    count(*) AS total_conversations,
    count(
        CASE
            WHEN (conversations.direction ~~* 'Inbound'::text) THEN 1
            ELSE NULL::integer
        END) AS inbound_conversations,
    count(
        CASE
            WHEN (conversations.direction ~~* 'Outbound'::text) THEN 1
            ELSE NULL::integer
        END) AS outbound_conversations,
    sum(COALESCE(conversations.talk_time, (0)::bigint)) AS total_talk_time
   FROM reporting.conversations
  WHERE ((conversations.agent IS NOT NULL) AND (conversations.talk_time > 0))
  GROUP BY (date(conversations.date)), conversations.agent
  ORDER BY (date(conversations.date)) DESC, conversations.agent;


create materialized view "reporting"."conversations_summary_by_day" as  SELECT date(conversations.date) AS conversation_date,
    count(*) AS total_conversations,
    count(
        CASE
            WHEN (conversations.direction ~~* 'Inbound'::text) THEN 1
            ELSE NULL::integer
        END) AS inbound_conversations,
    count(
        CASE
            WHEN (conversations.direction ~~* 'Outbound'::text) THEN 1
            ELSE NULL::integer
        END) AS outbound_conversations,
    count(
        CASE
            WHEN (conversations.abandoned_phase = 'Voicemail'::text) THEN 1
            ELSE NULL::integer
        END) AS voicemail_count
   FROM reporting.conversations
  WHERE (conversations.date IS NOT NULL)
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date)) DESC;


create materialized view "reporting"."handle_time_by_day" as  SELECT date(conversations.date) AS conversation_date,
    avg((conversations.talk_time + conversations.hold_time)) AS average_handling_time,
    avg(conversations.abandon_time) AS average_abandon_time,
    avg(conversations.queue_time) AS average_queue_time
   FROM reporting.conversations
  WHERE (conversations.date IS NOT NULL)
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date));


create or replace view "reporting"."handle_time_by_day_test" as  SELECT date(conversations.date) AS conversation_date,
    avg((conversations.talk_time + conversations.hold_time)) AS average_handling_time,
    avg(conversations.abandon_time) AS average_abandon_time,
    avg(conversations.queue_time) AS average_queue_time
   FROM reporting.conversations
  WHERE ((conversations.date IS NOT NULL) AND (conversations.abandoned IS NULL))
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date)) DESC;


CREATE OR REPLACE FUNCTION reporting.refresh_reporting_views()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
REFRESH MATERIALIZED VIEW reporting.handle_time_by_day;
END;$function$
;

CREATE OR REPLACE FUNCTION reporting.search_number(phone_number text)
 RETURNS TABLE(userid bigint, companyid bigint, name text, territoryname text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    url text;
BEGIN
    url := concat('https://athena.velomethod.com/api/search_number?from=', phone_number);

    RETURN QUERY
    SELECT
        (json_data->>'userId')::bigint AS userId,
        (json_data->>'companyId')::bigint AS companyId,
        (json_data->>'name') AS name,
        (json_data->>'territoryName') AS territoryName
    FROM
        (SELECT content::json AS json_data
         FROM extensions.http (
             (
                 'GET',
                 url,
                 NULL,
                 NULL,
                 NULL
             )
         )) AS subquery;
END;
$function$
;

create materialized view "reporting"."voicemails_by_day" as  SELECT date(conversations.date) AS voicemail_date,
    count(*) AS voicemail_count
   FROM reporting.conversations
  WHERE (conversations.abandoned_phase = 'Voicemail'::text)
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date)) DESC;


create materialized view "reporting"."voicemails_by_month" as  SELECT date_trunc('month'::text, conversations.date) AS voicemail_month,
    count(*) AS voicemail_count
   FROM reporting.conversations
  WHERE ((conversations.direction = 'Inbound'::text) AND (conversations.abandoned_phase = 'Voicemail'::text))
  GROUP BY (date_trunc('month'::text, conversations.date))
  ORDER BY (date_trunc('month'::text, conversations.date)) DESC;


create or replace view "reporting"."voicemails_left_by_day" as  SELECT date(conversations.date) AS date,
    count(*) AS voicemail_count
   FROM reporting.conversations
  WHERE ((conversations.date IS NOT NULL) AND (conversations.abandoned_phase = 'Voicemail'::text))
  GROUP BY (date(conversations.date))
  ORDER BY (date(conversations.date)) DESC;


grant delete on table "reporting"."conversations" to "anon";

grant references on table "reporting"."conversations" to "anon";

grant trigger on table "reporting"."conversations" to "anon";

grant truncate on table "reporting"."conversations" to "anon";

grant delete on table "reporting"."conversations" to "authenticated";

grant references on table "reporting"."conversations" to "authenticated";

grant trigger on table "reporting"."conversations" to "authenticated";

grant truncate on table "reporting"."conversations" to "authenticated";

grant delete on table "reporting"."conversations" to "service_role";

grant insert on table "reporting"."conversations" to "service_role";

grant references on table "reporting"."conversations" to "service_role";

grant select on table "reporting"."conversations" to "service_role";

grant trigger on table "reporting"."conversations" to "service_role";

grant truncate on table "reporting"."conversations" to "service_role";

grant update on table "reporting"."conversations" to "service_role";

grant delete on table "reporting"."conversations" to "supabase_admin";

grant insert on table "reporting"."conversations" to "supabase_admin";

grant references on table "reporting"."conversations" to "supabase_admin";

grant select on table "reporting"."conversations" to "supabase_admin";

grant trigger on table "reporting"."conversations" to "supabase_admin";

grant truncate on table "reporting"."conversations" to "supabase_admin";

grant update on table "reporting"."conversations" to "supabase_admin";

CREATE TRIGGER on_conversation_update AFTER UPDATE ON reporting.conversations FOR EACH STATEMENT EXECUTE FUNCTION reporting.refresh_reporting_views();
ALTER TABLE "reporting"."conversations" DISABLE TRIGGER "on_conversation_update";


create schema if not exists "taskrouter";

create table "taskrouter"."blacklisted_phone_numbers" (
    "number" text not null,
    "organization_id" uuid not null
);


alter table "taskrouter"."blacklisted_phone_numbers" enable row level security;

create table "taskrouter"."tasks" (
    "task_sid" text not null,
    "created_at" timestamp with time zone not null default now(),
    "reservation_sid" text not null
);


alter table "taskrouter"."tasks" enable row level security;

CREATE UNIQUE INDEX blacklisted_phone_numbers_pkey ON taskrouter.blacklisted_phone_numbers USING btree (number, organization_id);

CREATE UNIQUE INDEX tasks_pkey ON taskrouter.tasks USING btree (task_sid, reservation_sid);

alter table "taskrouter"."blacklisted_phone_numbers" add constraint "blacklisted_phone_numbers_pkey" PRIMARY KEY using index "blacklisted_phone_numbers_pkey";

alter table "taskrouter"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "taskrouter"."blacklisted_phone_numbers" add constraint "blacklisted_phone_numbers_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "taskrouter"."blacklisted_phone_numbers" validate constraint "blacklisted_phone_numbers_organization_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION taskrouter.completethetask()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
    -- calls pg_net function net.http_post
    -- sends request to postman API
    perform net.http_post(
      'https://notification-service-5201.twil.io/wrapupTask',
      jsonb_build_object(
        'task_sid', to_jsonb(old.task_sid),
        'reservation_sid', to_jsonb(old.reservation_sid)
      ),
      headers:='{"Content-Type": "application/json"}'::jsonb
    ) as request_id;
    return new;
END$function$
;

grant delete on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant insert on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant references on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant select on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant trigger on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant truncate on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant update on table "taskrouter"."blacklisted_phone_numbers" to "anon";

grant delete on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant insert on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant references on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant select on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant trigger on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant truncate on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant update on table "taskrouter"."blacklisted_phone_numbers" to "authenticated";

grant delete on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant insert on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant references on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant select on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant trigger on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant truncate on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant update on table "taskrouter"."blacklisted_phone_numbers" to "service_role";

grant delete on table "taskrouter"."tasks" to "anon";

grant insert on table "taskrouter"."tasks" to "anon";

grant references on table "taskrouter"."tasks" to "anon";

grant select on table "taskrouter"."tasks" to "anon";

grant trigger on table "taskrouter"."tasks" to "anon";

grant truncate on table "taskrouter"."tasks" to "anon";

grant update on table "taskrouter"."tasks" to "anon";

grant delete on table "taskrouter"."tasks" to "authenticated";

grant insert on table "taskrouter"."tasks" to "authenticated";

grant references on table "taskrouter"."tasks" to "authenticated";

grant select on table "taskrouter"."tasks" to "authenticated";

grant trigger on table "taskrouter"."tasks" to "authenticated";

grant truncate on table "taskrouter"."tasks" to "authenticated";

grant update on table "taskrouter"."tasks" to "authenticated";

grant delete on table "taskrouter"."tasks" to "service_role";

grant insert on table "taskrouter"."tasks" to "service_role";

grant references on table "taskrouter"."tasks" to "service_role";

grant select on table "taskrouter"."tasks" to "service_role";

grant trigger on table "taskrouter"."tasks" to "service_role";

grant truncate on table "taskrouter"."tasks" to "service_role";

grant update on table "taskrouter"."tasks" to "service_role";

create policy "All"
on "taskrouter"."blacklisted_phone_numbers"
as permissive
for all
to public
using (true)
with check (true);


create policy "All"
on "taskrouter"."tasks"
as permissive
for all
to public
using (true)
with check (true);


CREATE TRIGGER on_deletion_of_task AFTER DELETE ON taskrouter.tasks FOR EACH ROW EXECUTE FUNCTION taskrouter.completethetask();


create table "user_experience"."views" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "creator" uuid default auth.uid(),
    "filters" jsonb not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "user_experience"."views" enable row level security;

CREATE UNIQUE INDEX custom_view_pkey ON user_experience.views USING btree (id);

alter table "user_experience"."views" add constraint "custom_view_pkey" PRIMARY KEY using index "custom_view_pkey";

alter table "user_experience"."views" add constraint "custom_view_creator_fkey" FOREIGN KEY (creator) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "user_experience"."views" validate constraint "custom_view_creator_fkey";

grant insert on table "user_experience"."views" to "anon";

grant select on table "user_experience"."views" to "anon";

grant update on table "user_experience"."views" to "anon";

grant insert on table "user_experience"."views" to "authenticated";

grant select on table "user_experience"."views" to "authenticated";

grant update on table "user_experience"."views" to "authenticated";

create policy "Can View Created Views"
on "user_experience"."views"
as permissive
for all
to public
using ((auth.uid() = creator))
with check (true);



