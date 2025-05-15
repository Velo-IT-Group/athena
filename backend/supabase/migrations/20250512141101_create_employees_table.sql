drop policy "All" on "public"."phases";

drop policy "All" on "public"."tasks";

drop policy "All" on "public"."tickets";

create table "public"."goal_progress" (
    "id" uuid not null default gen_random_uuid(),
    "goal_id" uuid,
    "actual_value" numeric,
    "synced_at" timestamp with time zone default now()
);


alter table "public"."goal_progress" enable row level security;

create table "public"."goal_sources" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text
);


alter table "public"."goal_sources" enable row level security;

create table "public"."goal_templates" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "name" text not null,
    "source_id" uuid,
    "target_value" numeric not null,
    "unit" text,
    "aggregation_method" text,
    "field_name" text not null,
    "metadata" jsonb,
    "recurrence" text not null,
    "auto_generate" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."goal_templates" enable row level security;

create table "public"."goals" (
    "id" uuid not null default gen_random_uuid(),
    "template_id" uuid,
    "user_id" uuid,
    "period_start" date not null,
    "period_end" date not null,
    "target_value" numeric not null,
    "unit" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."goals" enable row level security;

create table "public"."phone_numbers" (
    "id" uuid not null default gen_random_uuid(),
    "twilio_sid" text not null,
    "phone_number" text not null,
    "status" text,
    "assigned_to" uuid,
    "assigned_at" timestamp with time zone,
    "released_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."phone_numbers" enable row level security;

create table "public"."pinned_items" (
    "id" uuid not null default gen_random_uuid(),
    "record_type" text not null,
    "identifier" text not null,
    "helper_name" text not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null default auth.uid(),
    "params" jsonb not null,
    "path" text not null
);


alter table "public"."pinned_items" enable row level security;

create table "public"."stories" (
    "id" uuid not null default gen_random_uuid(),
    "author_id" uuid not null default auth.uid(),
    "target_type" text not null,
    "target_id" uuid not null,
    "type" text not null default 'comment'::text,
    "text" text,
    "data" jsonb,
    "created_at" timestamp with time zone default now()
);


alter table "public"."stories" enable row level security;

create table "public"."taskrouter_events" (
    "id" uuid not null default gen_random_uuid(),
    "event_type" text not null,
    "payload" jsonb not null,
    "created_at" timestamp with time zone not null default now(),
    "task_sid" text,
    "reservation_sid" text,
    "worker_sid" text
);


alter table "public"."taskrouter_events" enable row level security;

create table "public"."teams" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "permalink_url" text,
    "visibility" text,
    "edit_team_name_or_description_access_level" text,
    "edit_team_visibility_or_trash_team_access_level" text,
    "member_invite_management_access_level" text,
    "guest_invite_management_access_level" text,
    "join_request_management_access_level" text,
    "team_member_removal_access_level" text,
    "team_content_management_access_level" text,
    "endorsed" boolean
);


alter table "public"."teams" enable row level security;

alter table "public"."profiles" add column "date_updated" timestamp with time zone not null default now();

alter table "public"."profiles" alter column "worker_sid" set not null;

alter table "public"."proposals" add column "company" jsonb;

alter table "public"."proposals" add column "contact" jsonb;

alter table "public"."tasks" drop column "visibile";

alter table "public"."tasks" add column "visible" boolean not null default false;

CREATE UNIQUE INDEX goal_progress_pkey ON public.goal_progress USING btree (id);

CREATE UNIQUE INDEX goal_sources_pkey ON public.goal_sources USING btree (id);

CREATE UNIQUE INDEX goal_templates_pkey ON public.goal_templates USING btree (id);

CREATE UNIQUE INDEX goals_pkey ON public.goals USING btree (id);

CREATE INDEX idx_stories_target ON public.stories USING btree (target_type, target_id);

CREATE UNIQUE INDEX phone_numbers_phone_number_key ON public.phone_numbers USING btree (phone_number);

CREATE UNIQUE INDEX phone_numbers_pkey ON public.phone_numbers USING btree (id);

CREATE UNIQUE INDEX phone_numbers_twilio_sid_key ON public.phone_numbers USING btree (twilio_sid);

CREATE UNIQUE INDEX pinned_items_pkey ON public.pinned_items USING btree (id, user_id);

CREATE UNIQUE INDEX stories_pkey ON public.stories USING btree (id);

CREATE INDEX taskrouter_events_event_type_idx ON public.taskrouter_events USING btree (event_type);

CREATE UNIQUE INDEX taskrouter_events_pkey ON public.taskrouter_events USING btree (id);

CREATE INDEX taskrouter_events_task_sid_idx ON public.taskrouter_events USING btree (task_sid);

CREATE INDEX taskrouter_events_worker_sid_idx ON public.taskrouter_events USING btree (worker_sid);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

alter table "public"."goal_progress" add constraint "goal_progress_pkey" PRIMARY KEY using index "goal_progress_pkey";

alter table "public"."goal_sources" add constraint "goal_sources_pkey" PRIMARY KEY using index "goal_sources_pkey";

alter table "public"."goal_templates" add constraint "goal_templates_pkey" PRIMARY KEY using index "goal_templates_pkey";

alter table "public"."goals" add constraint "goals_pkey" PRIMARY KEY using index "goals_pkey";

alter table "public"."phone_numbers" add constraint "phone_numbers_pkey" PRIMARY KEY using index "phone_numbers_pkey";

alter table "public"."pinned_items" add constraint "pinned_items_pkey" PRIMARY KEY using index "pinned_items_pkey";

alter table "public"."stories" add constraint "stories_pkey" PRIMARY KEY using index "stories_pkey";

alter table "public"."taskrouter_events" add constraint "taskrouter_events_pkey" PRIMARY KEY using index "taskrouter_events_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."goal_progress" add constraint "goal_progress_goal_id_fkey" FOREIGN KEY (goal_id) REFERENCES goals(id) not valid;

alter table "public"."goal_progress" validate constraint "goal_progress_goal_id_fkey";

alter table "public"."goal_templates" add constraint "goal_templates_recurrence_check" CHECK ((recurrence = ANY (ARRAY['daily'::text, 'monthly'::text, 'quarterly'::text]))) not valid;

alter table "public"."goal_templates" validate constraint "goal_templates_recurrence_check";

alter table "public"."goal_templates" add constraint "goal_templates_source_id_fkey" FOREIGN KEY (source_id) REFERENCES goal_sources(id) not valid;

alter table "public"."goal_templates" validate constraint "goal_templates_source_id_fkey";

alter table "public"."goal_templates" add constraint "goal_templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."goal_templates" validate constraint "goal_templates_user_id_fkey";

alter table "public"."goals" add constraint "goals_template_id_fkey" FOREIGN KEY (template_id) REFERENCES goal_templates(id) not valid;

alter table "public"."goals" validate constraint "goals_template_id_fkey";

alter table "public"."goals" add constraint "goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."goals" validate constraint "goals_user_id_fkey";

alter table "public"."phone_numbers" add constraint "phone_numbers_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES profiles(id) not valid;

alter table "public"."phone_numbers" validate constraint "phone_numbers_assigned_to_fkey";

alter table "public"."phone_numbers" add constraint "phone_numbers_phone_number_key" UNIQUE using index "phone_numbers_phone_number_key";

alter table "public"."phone_numbers" add constraint "phone_numbers_twilio_sid_key" UNIQUE using index "phone_numbers_twilio_sid_key";

alter table "public"."stories" add constraint "stories_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."stories" validate constraint "stories_author_id_fkey";

alter table "public"."stories" add constraint "stories_author_id_fkey1" FOREIGN KEY (author_id) REFERENCES profiles(id) not valid;

alter table "public"."stories" validate constraint "stories_author_id_fkey1";

alter table "public"."taskrouter_events" add constraint "taskrouter_events_worker_sid_fkey" FOREIGN KEY (worker_sid) REFERENCES profiles(worker_sid) not valid;

alter table "public"."taskrouter_events" validate constraint "taskrouter_events_worker_sid_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_phase()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  -- new.visible = new.description not like '%Backoffice Coordination%'::text;

  update phases
    set visible = new.description not like '%Backoffice Coordination%'::text
    where id = new.id;

  return new;
end;$function$
;

grant delete on table "public"."goal_progress" to "anon";

grant insert on table "public"."goal_progress" to "anon";

grant references on table "public"."goal_progress" to "anon";

grant select on table "public"."goal_progress" to "anon";

grant trigger on table "public"."goal_progress" to "anon";

grant truncate on table "public"."goal_progress" to "anon";

grant update on table "public"."goal_progress" to "anon";

grant delete on table "public"."goal_progress" to "authenticated";

grant insert on table "public"."goal_progress" to "authenticated";

grant references on table "public"."goal_progress" to "authenticated";

grant select on table "public"."goal_progress" to "authenticated";

grant trigger on table "public"."goal_progress" to "authenticated";

grant truncate on table "public"."goal_progress" to "authenticated";

grant update on table "public"."goal_progress" to "authenticated";

grant delete on table "public"."goal_progress" to "service_role";

grant insert on table "public"."goal_progress" to "service_role";

grant references on table "public"."goal_progress" to "service_role";

grant select on table "public"."goal_progress" to "service_role";

grant trigger on table "public"."goal_progress" to "service_role";

grant truncate on table "public"."goal_progress" to "service_role";

grant update on table "public"."goal_progress" to "service_role";

grant delete on table "public"."goal_sources" to "anon";

grant insert on table "public"."goal_sources" to "anon";

grant references on table "public"."goal_sources" to "anon";

grant select on table "public"."goal_sources" to "anon";

grant trigger on table "public"."goal_sources" to "anon";

grant truncate on table "public"."goal_sources" to "anon";

grant update on table "public"."goal_sources" to "anon";

grant delete on table "public"."goal_sources" to "authenticated";

grant insert on table "public"."goal_sources" to "authenticated";

grant references on table "public"."goal_sources" to "authenticated";

grant select on table "public"."goal_sources" to "authenticated";

grant trigger on table "public"."goal_sources" to "authenticated";

grant truncate on table "public"."goal_sources" to "authenticated";

grant update on table "public"."goal_sources" to "authenticated";

grant delete on table "public"."goal_sources" to "service_role";

grant insert on table "public"."goal_sources" to "service_role";

grant references on table "public"."goal_sources" to "service_role";

grant select on table "public"."goal_sources" to "service_role";

grant trigger on table "public"."goal_sources" to "service_role";

grant truncate on table "public"."goal_sources" to "service_role";

grant update on table "public"."goal_sources" to "service_role";

grant delete on table "public"."goal_templates" to "anon";

grant insert on table "public"."goal_templates" to "anon";

grant references on table "public"."goal_templates" to "anon";

grant select on table "public"."goal_templates" to "anon";

grant trigger on table "public"."goal_templates" to "anon";

grant truncate on table "public"."goal_templates" to "anon";

grant update on table "public"."goal_templates" to "anon";

grant delete on table "public"."goal_templates" to "authenticated";

grant insert on table "public"."goal_templates" to "authenticated";

grant references on table "public"."goal_templates" to "authenticated";

grant select on table "public"."goal_templates" to "authenticated";

grant trigger on table "public"."goal_templates" to "authenticated";

grant truncate on table "public"."goal_templates" to "authenticated";

grant update on table "public"."goal_templates" to "authenticated";

grant delete on table "public"."goal_templates" to "service_role";

grant insert on table "public"."goal_templates" to "service_role";

grant references on table "public"."goal_templates" to "service_role";

grant select on table "public"."goal_templates" to "service_role";

grant trigger on table "public"."goal_templates" to "service_role";

grant truncate on table "public"."goal_templates" to "service_role";

grant update on table "public"."goal_templates" to "service_role";

grant delete on table "public"."goals" to "anon";

grant insert on table "public"."goals" to "anon";

grant references on table "public"."goals" to "anon";

grant select on table "public"."goals" to "anon";

grant trigger on table "public"."goals" to "anon";

grant truncate on table "public"."goals" to "anon";

grant update on table "public"."goals" to "anon";

grant delete on table "public"."goals" to "authenticated";

grant insert on table "public"."goals" to "authenticated";

grant references on table "public"."goals" to "authenticated";

grant select on table "public"."goals" to "authenticated";

grant trigger on table "public"."goals" to "authenticated";

grant truncate on table "public"."goals" to "authenticated";

grant update on table "public"."goals" to "authenticated";

grant delete on table "public"."goals" to "service_role";

grant insert on table "public"."goals" to "service_role";

grant references on table "public"."goals" to "service_role";

grant select on table "public"."goals" to "service_role";

grant trigger on table "public"."goals" to "service_role";

grant truncate on table "public"."goals" to "service_role";

grant update on table "public"."goals" to "service_role";

grant delete on table "public"."phone_numbers" to "anon";

grant insert on table "public"."phone_numbers" to "anon";

grant references on table "public"."phone_numbers" to "anon";

grant select on table "public"."phone_numbers" to "anon";

grant trigger on table "public"."phone_numbers" to "anon";

grant truncate on table "public"."phone_numbers" to "anon";

grant update on table "public"."phone_numbers" to "anon";

grant delete on table "public"."phone_numbers" to "authenticated";

grant insert on table "public"."phone_numbers" to "authenticated";

grant references on table "public"."phone_numbers" to "authenticated";

grant select on table "public"."phone_numbers" to "authenticated";

grant trigger on table "public"."phone_numbers" to "authenticated";

grant truncate on table "public"."phone_numbers" to "authenticated";

grant update on table "public"."phone_numbers" to "authenticated";

grant delete on table "public"."phone_numbers" to "service_role";

grant insert on table "public"."phone_numbers" to "service_role";

grant references on table "public"."phone_numbers" to "service_role";

grant select on table "public"."phone_numbers" to "service_role";

grant trigger on table "public"."phone_numbers" to "service_role";

grant truncate on table "public"."phone_numbers" to "service_role";

grant update on table "public"."phone_numbers" to "service_role";

grant delete on table "public"."pinned_items" to "anon";

grant insert on table "public"."pinned_items" to "anon";

grant references on table "public"."pinned_items" to "anon";

grant select on table "public"."pinned_items" to "anon";

grant trigger on table "public"."pinned_items" to "anon";

grant truncate on table "public"."pinned_items" to "anon";

grant update on table "public"."pinned_items" to "anon";

grant delete on table "public"."pinned_items" to "authenticated";

grant insert on table "public"."pinned_items" to "authenticated";

grant references on table "public"."pinned_items" to "authenticated";

grant select on table "public"."pinned_items" to "authenticated";

grant trigger on table "public"."pinned_items" to "authenticated";

grant truncate on table "public"."pinned_items" to "authenticated";

grant update on table "public"."pinned_items" to "authenticated";

grant delete on table "public"."pinned_items" to "service_role";

grant insert on table "public"."pinned_items" to "service_role";

grant references on table "public"."pinned_items" to "service_role";

grant select on table "public"."pinned_items" to "service_role";

grant trigger on table "public"."pinned_items" to "service_role";

grant truncate on table "public"."pinned_items" to "service_role";

grant update on table "public"."pinned_items" to "service_role";

grant delete on table "public"."stories" to "anon";

grant insert on table "public"."stories" to "anon";

grant references on table "public"."stories" to "anon";

grant select on table "public"."stories" to "anon";

grant trigger on table "public"."stories" to "anon";

grant truncate on table "public"."stories" to "anon";

grant update on table "public"."stories" to "anon";

grant delete on table "public"."stories" to "authenticated";

grant insert on table "public"."stories" to "authenticated";

grant references on table "public"."stories" to "authenticated";

grant select on table "public"."stories" to "authenticated";

grant trigger on table "public"."stories" to "authenticated";

grant truncate on table "public"."stories" to "authenticated";

grant update on table "public"."stories" to "authenticated";

grant delete on table "public"."stories" to "service_role";

grant insert on table "public"."stories" to "service_role";

grant references on table "public"."stories" to "service_role";

grant select on table "public"."stories" to "service_role";

grant trigger on table "public"."stories" to "service_role";

grant truncate on table "public"."stories" to "service_role";

grant update on table "public"."stories" to "service_role";

grant delete on table "public"."taskrouter_events" to "anon";

grant insert on table "public"."taskrouter_events" to "anon";

grant references on table "public"."taskrouter_events" to "anon";

grant select on table "public"."taskrouter_events" to "anon";

grant trigger on table "public"."taskrouter_events" to "anon";

grant truncate on table "public"."taskrouter_events" to "anon";

grant update on table "public"."taskrouter_events" to "anon";

grant delete on table "public"."taskrouter_events" to "authenticated";

grant insert on table "public"."taskrouter_events" to "authenticated";

grant references on table "public"."taskrouter_events" to "authenticated";

grant select on table "public"."taskrouter_events" to "authenticated";

grant trigger on table "public"."taskrouter_events" to "authenticated";

grant truncate on table "public"."taskrouter_events" to "authenticated";

grant update on table "public"."taskrouter_events" to "authenticated";

grant delete on table "public"."taskrouter_events" to "service_role";

grant insert on table "public"."taskrouter_events" to "service_role";

grant references on table "public"."taskrouter_events" to "service_role";

grant select on table "public"."taskrouter_events" to "service_role";

grant trigger on table "public"."taskrouter_events" to "service_role";

grant truncate on table "public"."taskrouter_events" to "service_role";

grant update on table "public"."taskrouter_events" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";

create policy "All"
on "public"."goal_templates"
as permissive
for all
to public
using (true)
with check (true);


create policy "Public can see only visible rows"
on "public"."phases"
as permissive
for select
to public
using ((visible = true));


create policy "All"
on "public"."phone_numbers"
as permissive
for all
to public
using (true)
with check (true);


create policy "All"
on "public"."pinned_items"
as permissive
for all
to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "Public can only see rows"
on "public"."proposal_settings"
as permissive
for select
to public
using (true);


create policy "All"
on "public"."stories"
as permissive
for all
to public
using (true)
with check (true);


create policy "All"
on "public"."taskrouter_events"
as permissive
for all
to public
using (true)
with check (true);


create policy "Public can see only visible rows"
on "public"."tasks"
as permissive
for select
to public
using ((visible = true));


create policy "Enable users to view their own data only"
on "public"."teams"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Public can see only visible rows"
on "public"."tickets"
as permissive
for select
to public
using ((visible = true));


create policy "All"
on "public"."phases"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "All"
on "public"."tasks"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "All"
on "public"."tickets"
as permissive
for all
to authenticated
using (true)
with check (true);


CREATE TRIGGER on_phase_insert AFTER INSERT ON public.phases FOR EACH ROW EXECUTE FUNCTION handle_new_phase();


create table "reporting"."engagement_reservations" (
    "id" text not null,
    "enagement_id" text not null,
    "worker_sid" text not null,
    "reservation_status" text not null,
    "created_at" timestamp with time zone not null default now()
);


alter table "reporting"."engagement_reservations" enable row level security;

create table "reporting"."engagements" (
    "id" text not null,
    "channel" text not null default 'voice'::text,
    "is_inbound" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "contact" jsonb,
    "company" jsonb,
    "attributes" jsonb,
    "is_canceled" boolean,
    "recording_url" text,
    "transcription_sid" text,
    "is_voicemail" boolean,
    "follow_up_engagement_id" text,
    "workspace_sid" text
);


alter table "reporting"."engagements" enable row level security;

CREATE UNIQUE INDEX engagement_reservations_pkey ON reporting.engagement_reservations USING btree (id, enagement_id);

CREATE UNIQUE INDEX engagements_pkey ON reporting.engagements USING btree (id);

alter table "reporting"."engagement_reservations" add constraint "engagement_reservations_pkey" PRIMARY KEY using index "engagement_reservations_pkey";

alter table "reporting"."engagements" add constraint "engagements_pkey" PRIMARY KEY using index "engagements_pkey";

alter table "reporting"."engagement_reservations" add constraint "engagement_reservations_enagement_id_fkey" FOREIGN KEY (enagement_id) REFERENCES reporting.engagements(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "reporting"."engagement_reservations" validate constraint "engagement_reservations_enagement_id_fkey";

alter table "reporting"."engagement_reservations" add constraint "engagement_reservations_worker_sid_fkey" FOREIGN KEY (worker_sid) REFERENCES profiles(worker_sid) not valid;

alter table "reporting"."engagement_reservations" validate constraint "engagement_reservations_worker_sid_fkey";

alter table "reporting"."engagements" add constraint "engagements_follow_up_engagement_id_fkey" FOREIGN KEY (follow_up_engagement_id) REFERENCES reporting.engagements(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "reporting"."engagements" validate constraint "engagements_follow_up_engagement_id_fkey";

create or replace view "reporting"."call_summary_by_period" as  SELECT (date_trunc('day'::text, engagements.created_at))::timestamp without time zone AS call_date,
    engagements.channel,
    count(*) FILTER (WHERE (engagements.is_canceled IS NOT TRUE)) AS total_engagements,
    count(*) FILTER (WHERE ((engagements.is_inbound = true) AND (engagements.is_canceled IS NOT TRUE))) AS inbound_engagements,
    count(*) FILTER (WHERE ((engagements.is_inbound = false) AND (engagements.is_canceled IS NOT TRUE))) AS outbound_engagements,
    count(*) FILTER (WHERE ((engagements.is_voicemail = true) AND (engagements.is_canceled IS NOT TRUE))) AS voicemails
   FROM reporting.engagements
  GROUP BY ((date_trunc('day'::text, engagements.created_at))::timestamp without time zone), engagements.channel
  ORDER BY ((date_trunc('day'::text, engagements.created_at))::timestamp without time zone), engagements.channel;


grant insert on table "reporting"."engagement_reservations" to "anon";

grant select on table "reporting"."engagement_reservations" to "anon";

grant update on table "reporting"."engagement_reservations" to "anon";

grant insert on table "reporting"."engagement_reservations" to "authenticated";

grant select on table "reporting"."engagement_reservations" to "authenticated";

grant update on table "reporting"."engagement_reservations" to "authenticated";

grant insert on table "reporting"."engagements" to "anon";

grant select on table "reporting"."engagements" to "anon";

grant update on table "reporting"."engagements" to "anon";

grant insert on table "reporting"."engagements" to "authenticated";

grant select on table "reporting"."engagements" to "authenticated";

grant update on table "reporting"."engagements" to "authenticated";

create policy "All"
on "reporting"."engagement_reservations"
as permissive
for all
to public
using (true)
with check (true);


create policy "All"
on "reporting"."engagements"
as permissive
for all
to public
using (true)
with check (true);



