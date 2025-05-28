create extension if not exists "vector" with schema "extensions";

drop policy "Public can see only visible rows" on "public"."tasks";

drop policy "All" on "public"."phases";

drop policy "All" on "public"."tasks";

drop policy "All" on "public"."tickets";

drop view if exists "public"."calculate_totals";

drop view if exists "public"."proposal_totals";

drop index if exists "public"."proposals_fts";

create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default gen_random_uuid(),
    "type" text not null,
    "resource_path" text not null,
    "resource_params" jsonb,
    "from" text,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "is_read" boolean not null default false,
    "resource_name" text
);

alter table "public"."notifications" enable row level security;

create table "public"."phase_templates" (
    "id" uuid not null default gen_random_uuid(),
    "template_id" uuid not null,
    "description" text not null,
    "mark_as_milestone_flag" boolean not null default false,
    "bill_phase_separately" boolean,
    "order" smallint not null,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null default auth.uid(),
    "updated_at" timestamp with time zone not null default now(),
    "updated_by" timestamp with time zone not null default now()
);

alter table "public"."phase_templates" enable row level security;

create table "public"."proposal_followers" (
    "proposal_id" uuid not null,
    "user_id" uuid not null
);

alter table "public"."proposal_followers" enable row level security;

alter table "public"."profiles" add column "image_url" text;

alter table "public"."proposals" drop column "assumptions";

alter table "public"."proposals" add column "embedding" vector(512);

alter table "public"."proposals" add column "is_conversion_completed" boolean not null default false;

alter table "public"."proposals" add column "is_getting_converted" boolean not null default false;

alter table "public"."proposals" alter column "fts" set default to_tsvector('english'::regconfig, (((name || ' '::text) || ((company ->> 'name'::text) || ' '::text)) || ((contact ->> 'name'::text) || ' '::text)));

alter table "public"."tickets" alter column "order" drop default;

alter table "public"."tickets" alter column "order" set data type smallint using "order"::smallint;

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX proposal_followers_pkey ON public.proposal_followers USING btree (proposal_id, user_id);

CREATE INDEX proposals_embedding_idx ON public.proposals USING hnsw (embedding vector_ip_ops);

CREATE INDEX proposals_fts_idx ON public.proposals USING gin (fts);

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."proposal_followers" add constraint "proposal_followers_pkey" PRIMARY KEY using index "proposal_followers_pkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."proposal_followers" add constraint "proposal_followers_proposal_id_fkey" FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."proposal_followers" validate constraint "proposal_followers_proposal_id_fkey";

alter table "public"."proposal_followers" add constraint "proposal_followers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."proposal_followers" validate constraint "proposal_followers_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.hybrid_search(query_text text, query_embedding vector, match_count integer, full_text_weight double precision DEFAULT 1, semantic_weight double precision DEFAULT 1, rrf_k integer DEFAULT 50)
 RETURNS SETOF proposals
 LANGUAGE sql
AS $function$
with full_text as (
  select
    id,
    -- Note: ts_rank_cd is not indexable but will only rank matches of the where clause
    -- which shouldn't be too big
    row_number() over(order by ts_rank_cd(fts, websearch_to_tsquery(query_text)) desc) as rank_ix
  from
    proposals
  where
    fts @@ websearch_to_tsquery(query_text)
  order by rank_ix
  limit least(match_count, 30) * 2
),
semantic as (
  select
    id,
    row_number() over (order by embedding <#> query_embedding) as rank_ix
  from
    proposals
  order by rank_ix
  limit least(match_count, 30) * 2
)
select
  proposals.*
from
  full_text
  full outer join semantic
    on full_text.id = semantic.id
  join proposals
    on coalesce(full_text.id, semantic.id) = proposals.id
order by
  coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
  coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
  desc
limit
  least(match_count, 30)
$function$
;

CREATE OR REPLACE FUNCTION public.notify_followers_when_proposal_signed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  follower RECORD;
BEGIN
  IF OLD.status IS DISTINCT FROM 'signed' AND NEW.status = 'signed' THEN
    FOR follower IN
      SELECT user_id FROM proposal_followers WHERE proposal_id = NEW.id
    LOOP
      INSERT INTO notifications (
        "from", 
        type, 
        resource_name,
        resource_path, 
        resource_params, 
        user_id
      ) VALUES (
        NEW.approval_info->'name',
        'proposal_approved',
        NEW.name,
        '/proposals/' || NEW.id || '/' || NEW.working_version, -- Or use a template string if required
        jsonb_build_object('id', NEW.id, 'version', NEW.working_version),
        follower.user_id
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;$function$
;

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


CREATE OR REPLACE FUNCTION public.handle_new_proposal()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
  user_org uuid;
  org_labor_rate numeric;
begin
  -- select organization 
  -- into user_org
  -- from profiles 
  -- where id = '1c80bfac-b59f-420b-8b0e-a330aa377edd';

  select labor_rate
  into org_labor_rate
  from organizations
  where id = '1c80bfac-b59f-420b-8b0e-a330aa377edd';

  new.organization = user_org;
  new.labor_rate = org_labor_rate;
  new.expiration_date = now() + interval '90 days';

  return new;
end;$function$
;

CREATE OR REPLACE FUNCTION public.handle_proposal_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$begin
  UPDATE proposals
  SET updated_at = now()
  WHERE id = new.id; 
  return new;
end;$function$
;

create or replace view "public"."proposal_totals" as  WITH phase_totals AS (
         SELECT ph.version,
            sum(ph.hours) AS total_hours
           FROM phases ph
          GROUP BY ph.version
        ), product_totals AS (
         SELECT pr.version,
            sum(
                CASE
                    WHEN ((pr.recurring_flag = false) AND (pr.parent IS NULL)) THEN
                    CASE
                        WHEN (pr.product_class = 'Bundle'::text) THEN pr.calculated_price
                        ELSE pr.extended_price
                    END
                    ELSE (0)::numeric
                END) AS non_recurring_total,
            sum(
                CASE
                    WHEN ((pr.recurring_flag = false) AND (pr.parent IS NULL)) THEN
                    CASE
                        WHEN (pr.product_class = 'Bundle'::text) THEN pr.calculated_cost
                        ELSE pr.extended_cost
                    END
                    ELSE (0)::numeric
                END) AS non_recurring_cost,
            sum(
                CASE
                    WHEN ((pr.recurring_flag = true) AND (pr.parent IS NULL)) THEN
                    CASE
                        WHEN (pr.product_class = 'Bundle'::text) THEN pr.calculated_price
                        ELSE pr.extended_price
                    END
                    ELSE (0)::numeric
                END) AS recurring_total,
            sum(
                CASE
                    WHEN ((pr.recurring_flag = true) AND (pr.parent IS NULL)) THEN
                    CASE
                        WHEN (pr.product_class = 'Bundle'::text) THEN pr.calculated_cost
                        ELSE pr.extended_cost
                    END
                    ELSE (0)::numeric
                END) AS recurring_cost
           FROM products pr
          WHERE (pr.parent IS NULL)
          GROUP BY pr.version
        )
 SELECT p.id AS proposal_id,
    v.id AS version_id,
    v.number AS version_number,
    COALESCE(pt.total_hours, (0)::numeric) AS total_hours,
    p.labor_rate,
    (COALESCE(pt.total_hours, (0)::numeric) * p.labor_rate) AS labor_cost,
    COALESCE(ptot.non_recurring_total, (0)::numeric) AS non_recurring_product_total,
    COALESCE(ptot.non_recurring_cost, (0)::numeric) AS non_recurring_product_cost,
    COALESCE(ptot.recurring_total, (0)::numeric) AS recurring_total,
    COALESCE(ptot.recurring_cost, (0)::numeric) AS recurring_cost,
    ((COALESCE(ptot.non_recurring_total, (0)::numeric) + COALESCE(ptot.recurring_total, (0)::numeric)) + (COALESCE(pt.total_hours, (0)::numeric) * p.labor_rate)) AS total_price
   FROM (((proposals p
     JOIN versions v ON (((v.proposal = p.id) AND (v.id = p.working_version))))
     LEFT JOIN phase_totals pt ON ((pt.version = v.id)))
     LEFT JOIN product_totals ptot ON ((ptot.version = v.id)));


grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."proposal_followers" to "anon";

grant insert on table "public"."proposal_followers" to "anon";

grant references on table "public"."proposal_followers" to "anon";

grant select on table "public"."proposal_followers" to "anon";

grant trigger on table "public"."proposal_followers" to "anon";

grant truncate on table "public"."proposal_followers" to "anon";

grant update on table "public"."proposal_followers" to "anon";

grant delete on table "public"."proposal_followers" to "authenticated";

grant insert on table "public"."proposal_followers" to "authenticated";

grant references on table "public"."proposal_followers" to "authenticated";

grant select on table "public"."proposal_followers" to "authenticated";

grant trigger on table "public"."proposal_followers" to "authenticated";

grant truncate on table "public"."proposal_followers" to "authenticated";

grant update on table "public"."proposal_followers" to "authenticated";

grant delete on table "public"."proposal_followers" to "service_role";

grant insert on table "public"."proposal_followers" to "service_role";

grant references on table "public"."proposal_followers" to "service_role";

grant select on table "public"."proposal_followers" to "service_role";

grant trigger on table "public"."proposal_followers" to "service_role";

grant truncate on table "public"."proposal_followers" to "service_role";

grant update on table "public"."proposal_followers" to "service_role";


create policy "Can only modify your notifications"
on "public"."notifications"
as permissive
for all
to public
using (( SELECT (auth.uid() = notifications.user_id)))
with check (( SELECT (auth.uid() = notifications.user_id)));

create policy "Anyone can update"
on "public"."profile_keys"
as permissive
for update
to public
using (true)
with check (true);


create policy "All"
on "public"."proposal_followers"
as permissive
for all
to authenticated, anon
using (true)
with check (true);

create policy "Public user can only see visible columns"
on "public"."tasks"
as permissive
for select
to public
using ((visible = true));

create policy "All"
on "public"."phases"
as permissive
for all
to authenticated, anon
using (true)
with check (true);


create policy "All"
on "public"."tasks"
as permissive
for all
to authenticated, anon
using (true)
with check (true);


create policy "All"
on "public"."tickets"
as permissive
for all
to authenticated, anon
using (true)
with check (true);


CREATE TRIGGER notify_follows_when_proposal_is_signed AFTER UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION notify_followers_when_proposal_signed();


