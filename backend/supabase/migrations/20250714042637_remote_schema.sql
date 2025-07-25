

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "livekit";


ALTER SCHEMA "livekit" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE SCHEMA IF NOT EXISTS "powersync";


ALTER SCHEMA "powersync" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "reporting";


ALTER SCHEMA "reporting" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "system";


ALTER SCHEMA "system" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "taskrouter";


ALTER SCHEMA "taskrouter" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "user_experience";


ALTER SCHEMA "user_experience" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_tle";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "wrappers" WITH SCHEMA "extensions";






CREATE TYPE "public"."auth_type" AS ENUM (
    'OAuth 2.0',
    'Basic',
    'Bearer Token'
);


ALTER TYPE "public"."auth_type" OWNER TO "postgres";


CREATE TYPE "public"."integration_type" AS ENUM (
    'reseller',
    'distribution',
    'email'
);


ALTER TYPE "public"."integration_type" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'building',
    'inProgress',
    'signed',
    'canceled'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_to_manage"("proposal_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$ 
declare
  proposal_version uuid;
  created_opportunity_id int;
  created_project_id int;
  phase_id uuid;
  created_phase_id int;
  ticket_id uuid;
  task_id uuid;
  created_ticket_id int;
begin 
  -- Get Relevant Proposal
  select working_version into proposal_version from proposals where id =  convert_to_manage.proposal_id;

  -- Create Opportunity and save id
  select create_manage_opportunity::int into created_opportunity_id from create_manage_opportunity( convert_to_manage.proposal_id);

  -- Update proposal with opportunity id
  update proposals set opportunity_id = created_opportunity_id where id =  convert_to_manage.proposal_id;

  -- Create relevant products based on opportunity_id
  perform create_opportunity_products(created_opportunity_id, proposal_version);

  -- Create a project from opportunity
  select create_manage_project::int into created_project_id from create_manage_project(created_opportunity_id);

  -- Update proposal with opportunity id
  update proposals set project_id = created_project_id where id =  convert_to_manage.proposal_id;

  -- Loop over phases that equal proposals working_version
  for phase_id in select id from phases where version = proposal_version
  loop
    -- Create phase in project
    select create_project_phase into created_phase_id from create_project_phase(phase_id, created_project_id);

    for ticket_id in select id from tickets where phase = phase_id
    loop
      select create_phase_ticket into created_ticket_id from create_phase_ticket(ticket_id, created_phase_id);

      for task_id in select id from tasks where ticket = ticket_id
      loop
        perform create_ticket_task(task_id, created_ticket_id);
      end loop;
    end loop;
  end loop;
  return;
end; 
$$;


ALTER FUNCTION "public"."convert_to_manage"("proposal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."copy_version_data"("old_version" "uuid", "new_version" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    working_version_id uuid;
    phase_id uuid;
    new_phase_id uuid;
    product_id uuid;
    new_product_id uuid;
    ticket_id uuid;
    new_ticket_id uuid;
    section_id uuid;
    new_section_id uuid;
    task_id uuid;
    new_task_id uuid;
BEGIN
    SELECT working_version 
    INTO working_version_id 
    FROM proposals 
    WHERE id = old_version;

    INSERT INTO 
        public.proposal_settings (proposal, version, assumptions, description)
    SELECT
        proposal,
        new_version,
        assumptions,
        description
    FROM
        public.proposal_settings
    WHERE 
        VERSION = old_version;

    -- Duplicate phases
    FOR phase_id IN SELECT id FROM phases WHERE version = working_version_id
    LOOP
        -- Duplicate phase with new version and return the new phase id
        select into new_phase_id create_new_phase(phase_id, new_version);
       
        -- Duplicate tickets related to the phase
        FOR ticket_id IN SELECT id FROM tickets WHERE phase = phase_id
        LOOP
            -- Duplicate ticket with new phase and return the new ticket id
            select into new_ticket_id create_new_ticket(ticket_id, new_phase_id);
            
            -- Duplicate tasks related to the ticket
            FOR task_id IN SELECT id FROM tasks WHERE ticket = ticket_id
            LOOP
                -- Duplicate task with new ticket and return the new task id
                select into new_task_id create_new_task(task_id, new_ticket_id);
            END LOOP;
        END LOOP;
    END LOOP;

    FOR section_id IN SELECT id FROM sections WHERE version = working_version_id
    LOOP
        INSERT INTO sections (name, version, "order")
        SELECT name, new_version, "order"
        FROM sections 
        WHERE id = section_id
        returning id into new_section_id;

        FOR product_id in SELECT unique_id from products where section = section_id
        LOOP
            select into new_product_id public.create_new_product(product_id, new_version, new_section_id);

            INSERT INTO public.products (id, identifier, description, type, product_class, unit_of_measure, price, cost, taxable_flag, vendor, recurring_flag, recurring_cost, recurring_bill_cycle, recurring_cycle_type, category, parent, sequence_number, quantity, parent_catalog_item, catalog_item, manufacturer_part_number, calculated_price, calculated_cost, additional_overrides, section, version)
            SELECT id, identifier, description, type, product_class, unit_of_measure, price, cost, taxable_flag, vendor, recurring_flag, recurring_cost, recurring_bill_cycle, recurring_cycle_type, category, new_product_id, sequence_number, quantity, parent_catalog_item, catalog_item, manufacturer_part_number, calculated_price, calculated_cost, additional_overrides, new_section_id, new_version
            FROM public.products
            WHERE parent = product_id;
        END LOOP;
    END LOOP;
END;$$;


ALTER FUNCTION "public"."copy_version_data"("old_version" "uuid", "new_version" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_manage_opportunity"("proposal_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare 
  proposal record;
  manage_id int;
  opp text;
begin 
  select * 
  into proposal 
  from public.proposals
  where id = create_manage_opportunity.proposal_id;

  select manage_reference_id 
  into manage_id 
  from profiles 
  where id = proposal.created_by;

  select
    content::json->>'id'
  into opp
  from
    http ((
        'POST',
        'https://manage.velomethod.com/v4_6_release/apis/3.0/sales/opportunities',
        array[
          http_header (
            'Authorization',
            'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
          ),
          http_header (
            'clientId',
            '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
          )
        ],
        'application/json',
        jsonb_build_object(
          'name',
          proposal.name,
          'type',
          jsonb_build_object('id', 5),
          'primarySalesRep',
          jsonb_build_object('id', manage_id),
          'company',
          jsonb_build_object('id', 19297),
          'stage',
          jsonb_build_object('id', 6),
          'contact',
          jsonb_build_object('id', 6845)
        )
      )::http_request
    );

    return opp;
  end;
$$;


ALTER FUNCTION "public"."create_manage_opportunity"("proposal_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_manage_project"("opportunity_id" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  url text;
  ref text;
begin
  select into url concat('https://manage.velomethod.com/v4_6_release/apis/3.0/sales/opportunities/', opportunity_id, '/convertToProject');

  select content::json->>'id'
  into ref
  from http((
    'POST',
    url,
    array[
      http_header (
        'Authorization',
        'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
      ),
      http_header (
        'clientId',
        '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
      )
    ],
    'application/json',
    jsonb_build_object(
      'board',
      jsonb_build_object('id', 51),
      'estimatedStart',
      current_date,
      'estimatedEnd',
      current_date + interval '30' day,
      'includeAllProductsFlag',
      true
    )
  )::http_request);
  
  return ref;
end;
$$;


ALTER FUNCTION "public"."create_manage_project"("opportunity_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_phase"("old_phase_id" "uuid", "new_version_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_phase_id uuid;
BEGIN
    INSERT INTO public.phases (description, hours, "order", visible, version)
    SELECT description, hours, "order", visible, COALESCE(new_version_id, version)
    FROM public.phases
    WHERE id = old_phase_id
    RETURNING id INTO new_phase_id;
    
    RETURN new_phase_id;
END;
$$;


ALTER FUNCTION "public"."create_new_phase"("old_phase_id" "uuid", "new_version_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_product"("old_product_id" "uuid", "new_version" "uuid", "new_section" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_product_id uuid;
BEGIN
    INSERT INTO 
    public.products (
        id, 
        identifier, 
        description, 
        type, 
        product_class, 
        unit_of_measure, 
        price, 
        cost, 
        taxable_flag, 
        vendor, 
        recurring_flag, 
        recurring_cost, 
        recurring_bill_cycle, 
        recurring_cycle_type, 
        category, 
        parent, 
        sequence_number, 
        quantity, 
        parent_catalog_item, 
        catalog_item, 
        manufacturer_part_number, 
        calculated_price, 
        calculated_cost, 
        additional_overrides, 
        section, 
        version,
        "order"
    )
    SELECT 
        id, 
        identifier, 
        description, 
        type, 
        product_class, 
        unit_of_measure, 
        price, 
        cost, 
        taxable_flag, 
        vendor, 
        recurring_flag, 
        recurring_cost, 
        recurring_bill_cycle, 
        recurring_cycle_type, 
        category, 
        parent, 
        sequence_number, 
        quantity, 
        parent_catalog_item, 
        catalog_item, 
        manufacturer_part_number, 
        calculated_price, 
        calculated_cost, 
        additional_overrides, 
        new_section, 
        new_version,
        "order"
    FROM public.products
    WHERE unique_id = old_product_id
    RETURNING unique_id 
    INTO new_product_id;

    RETURN new_product_id;
END;
$$;


ALTER FUNCTION "public"."create_new_product"("old_product_id" "uuid", "new_version" "uuid", "new_section" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_task"("old_task_id" "uuid", "new_ticket_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_task_id uuid;
BEGIN
    INSERT INTO tasks (summary, notes, priority, ticket, visibile)
    SELECT summary, notes, priority, new_ticket_id, visibile
    FROM tasks WHERE id = old_task_id
    RETURNING id INTO new_task_id;
    
    RETURN new_task_id;
END;
$$;


ALTER FUNCTION "public"."create_new_task"("old_task_id" "uuid", "new_ticket_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_new_ticket"("old_ticket_id" "uuid", "new_phase_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_ticket_id uuid;
BEGIN
    INSERT INTO tickets (summary, "order", budget_hours, phase, visible)
    SELECT summary, "order", budget_hours, new_phase_id, visible
    FROM tickets 
    WHERE id = old_ticket_id
    RETURNING id INTO new_ticket_id;
    
    RETURN new_ticket_id;
END;
$$;


ALTER FUNCTION "public"."create_new_ticket"("old_ticket_id" "uuid", "new_phase_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_opportunity_products"("opportunity_id" integer) RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
declare
  prod json;
begin 
  select content::json into prod
  from http((
    'POST',
    concat('https://manage.velomethod.com/v4_6_release/apis/3.0/sales/opportunities/', opportunity_id, '/convertToProject'),
    array[
      http_header (
        'Authorization',
        'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
      ),
      http_header (
        'clientId',
        '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
      )
    ],
    'application/json',
    jsonb_build_object(
      'board',
      jsonb_build_object('id', 51)
      'estimatedStart',
      now(),
      'estimatedEnd',
      now() + interval '30' day,
      'includeAllProductsFlag',
      true
    )
  )::http_request);
  return prod;
end;
$$;


ALTER FUNCTION "public"."create_opportunity_products"("opportunity_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_opportunity_products"("opportunity_id" integer, "version_id" "uuid") RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
declare 
  p record;
  prod json;
  o_prod_id int;
begin 
  -- Loop over all non-bundle products 
  FOR p IN select id, price, cost, quantity from products where version = version_id and parent is null and product_class != 'Bundle'
  LOOP
    select content::json
    into prod
    from http((
      'POST',
      'https://manage.velomethod.com/v4_6_release/apis/3.0/procurement/products',
      array[
        http_header (
          'Authorization',
          'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
        ),
        http_header (
          'clientId',
          '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
        )
      ],
      'application/json',
      jsonb_build_object(
        'catalogItem',
        jsonb_build_object('id', p.id),
        'price',
        p.price,
        'cost',
        p.cost,
        'quantity',
        p.quantity,
        'billableOption',
        'Billable',
        'opportunity',
        jsonb_build_object('id', opportunity_id)
      )
    )::http_request);
  END LOOP;

  -- Loop over all bundle products
  FOR p IN select id, price, cost, quantity from products where version = version_id and parent is null and product_class = 'Bundle'
  LOOP
    select content::json
    into prod
    from http((
      'POST',
      'https://manage.velomethod.com/v4_6_release/apis/3.0/procurement/products',
      array[
        http_header (
          'Authorization',
          'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
        ),
        http_header (
          'clientId',
          '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
        )
      ],
      'application/json',
      jsonb_build_object(
        'catalogItem',
        jsonb_build_object('id', p.id),    
        'quantity',
        p.quantity,
        'billableOption',
        'Billable',
        'opportunity',
        jsonb_build_object('id', opportunity_id)
      )
    )::http_request);
  END LOOP;

  -- create temp table temp_products (
  --   id int,
  --   catalogItem int
  -- );

  -- insert 
  -- into temp_results (id, catalog_item_id)
  -- select *
  -- from get_opportunity_products(create_opportunity_products.opportunity_id);

  -- for p in select id, price, cost, quantity from products where parent is not null and version = version_id
  -- loop
  --   select id into o_prod_id from temp_products where catalogItem = p.id;
    
  --   select update_manage_product(o_prod_id, p.price, p.cost, quantity);

  -- end loop;

  return prod;
end;
$$;


ALTER FUNCTION "public"."create_opportunity_products"("opportunity_id" integer, "version_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_phase_ticket"("ticket_id" "uuid", "phase_id" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  ticket_summary text;
  ticket_hours int;
  ref text;
begin
  select summary, budget_hours 
  into ticket_summary, ticket_hours 
  from tickets 
  where id = create_phase_ticket.ticket_id;

  select content::json->>'id' 
  into ref
  from http((
    'POST',
    'https://manage.velomethod.com/v4_6_release/apis/3.0/project/tickets',
    array[
      http_header (
        'Authorization',
        'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
      ),
      http_header (
        'clientId',
        '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
      )
    ],
    'application/json',
    jsonb_build_object(
      'summary',
      ticket_summary,
      'budgetHours',
      ticket_hours,
      'phase',
      jsonb_build_object('id', phase_id)
    )
  )::http_request);

  return ref;
end;
$$;


ALTER FUNCTION "public"."create_phase_ticket"("ticket_id" "uuid", "phase_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_project_phase"("phase_id" "uuid", "project_id" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  phase_description text;
  phase_order int;
  url text;
  ref text;
begin
  select into url concat('https://manage.velomethod.com/v4_6_release/apis/3.0/project/projects/', project_id, '/phases');

  select description, "order" into phase_description, phase_order from phases where id = phase_id;

  select content::json->>'id'
  into ref
  from http((
    'POST',
    url,
    array[
      http_header (
        'Authorization',
        'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
      ),
      http_header (
        'clientId',
        '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
      )
    ],
    'application/json',
    jsonb_build_object(
      'description',
      phase_description,
      'wbsCode',
      phase_order::text
    )
  )::http_request);

  return ref;
end;
$$;


ALTER FUNCTION "public"."create_project_phase"("phase_id" "uuid", "project_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_ticket_task"("task_id" "uuid", "ticket_id" integer) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  t_summary text;
  t_notes text;
  t_priority int;
  url text;
  secret_client_id text;
  secret_secret_key text;
  ref text;
begin
  select into url concat('https://manage.velomethod.com/v4_6_release/apis/3.0/project/tickets/', ticket_id, '/tasks');

  select summary, notes, priority into t_summary, t_notes, t_priority from tasks where id = task_id;
  
  select content::json->>'id'
  into ref
  from http((
    'POST',
    url,
    array[
      http_header (
        'Authorization',
        'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
      ),
      http_header (
        'clientId',
        '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
      )
    ],
    'application/json',
    jsonb_build_object(
      'summary',
      t_summary,
      'notes',
      t_summary,
      'priority',
      t_priority
    )
  )::http_request);

  return ref;
end;
$$;


ALTER FUNCTION "public"."create_ticket_task"("task_id" "uuid", "ticket_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."duplicate_phases"("old_version" "uuid", "new_version" "uuid") RETURNS SETOF "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_phase_id uuid;
BEGIN
    INSERT INTO public.phases (description, hours, "order", visible, reference_id, version)
    SELECT description, hours, "order", visible, reference_id, duplicate_phases.new_version
    FROM public.phases
    WHERE version = duplicate_phases.old_version
    RETURNING id INTO new_phase_id;
    RETURN NEXT new_phase_id;
    LOOP
        EXIT WHEN NOT FOUND;
        RETURN NEXT new_phase_id;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."duplicate_phases"("old_version" "uuid", "new_version" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."duplicate_products"("original_id" "uuid", "new_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.products (identifier, description, inactive_flag, subcategory, type, product_class, serialized_flag, serialized_cost_flag, phase_product_flag, unit_of_measure, price, cost, taxable_flag, drop_ship_flag, special_order_flag, customer_description, manufacturer, vendor, recurring_flag, recurring_revenue, recurring_cost, recurring_one_time_flag, recurring_bill_cycle, recurring_cycle_type, calculated_price_flag, calculated_cost_flag, category, proposal, parent, sequence_number, quantity, hide_description_flag, hide_extended_price_flag, hide_item_identifier_flag, hide_price_flag, hide_quantity_flag, parent_catalog_item, catalog_item, manufacturer_part_number, calculated_price, calculated_cost)
    SELECT identifier, description, inactive_flag, subcategory, type, product_class, serialized_flag, serialized_cost_flag, phase_product_flag, unit_of_measure, price, cost, taxable_flag, drop_ship_flag, special_order_flag, customer_description, manufacturer, vendor, recurring_flag, recurring_revenue, recurring_cost, recurring_one_time_flag, recurring_bill_cycle, recurring_cycle_type, calculated_price_flag, calculated_cost_flag, category, duplicate_products.new_id, parent, sequence_number, quantity, hide_description_flag, hide_extended_price_flag, hide_item_identifier_flag, hide_price_flag, hide_quantity_flag, parent_catalog_item, catalog_item, manufacturer_part_number, calculated_price, calculated_cost
    FROM public.products
    WHERE proposal = duplicate_products.original_id;
END;
$$;


ALTER FUNCTION "public"."duplicate_products"("original_id" "uuid", "new_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."duplicate_tasks"("original_id" "uuid", "new_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    INSERT INTO public.tasks (summary, notes, priority, ticket, visibile)
    SELECT summary, notes, priority, duplicate_tasks.new_id, visibile
    FROM public.tasks
    WHERE ticket = duplicate_tasks.original_id;
END;
$$;


ALTER FUNCTION "public"."duplicate_tasks"("original_id" "uuid", "new_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."duplicate_tickets"("original_id" "uuid", "new_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
   INSERT INTO public.tickets (summary, "order", budget_hours, phase, visible)
    SELECT summary, "order", budget_hours, duplicate_tickets.new_id, visible
    FROM public.tickets
    WHERE phase = duplicate_tickets.original_id;
END;$$;


ALTER FUNCTION "public"."duplicate_tickets"("original_id" "uuid", "new_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."duplicate_version_data"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    working_version_id uuid;
    phase_id uuid;
    new_phase_id uuid;
    product_id uuid;
    new_product_id uuid;
    ticket_id uuid;
    new_ticket_id uuid;
    section_id uuid;
    new_section_id uuid;
    task_id uuid;
    new_task_id uuid;
BEGIN
    SELECT working_version INTO working_version_id FROM proposals WHERE id = new.proposal;

    INSERT INTO 
        public.proposal_settings (proposal, version, assumptions, description)
    SELECT
        proposal,
        new.id,
        assumptions,
        description
    FROM
        public.proposal_settings
    WHERE 
        version = working_version_id;

    -- Duplicate phases
    FOR phase_id IN SELECT id FROM phases WHERE version = working_version_id
    LOOP
        -- Duplicate phase with new version and return the new phase id
        select into new_phase_id create_new_phase(phase_id, new.id);
       
        -- Duplicate tickets related to the phase
        FOR ticket_id IN SELECT id FROM tickets WHERE phase = phase_id
        LOOP
            -- Duplicate ticket with new phase and return the new ticket id
            select into new_ticket_id create_new_ticket(ticket_id, new_phase_id);
            
            -- Duplicate tasks related to the ticket
            FOR task_id IN SELECT id FROM tasks WHERE ticket = ticket_id
            LOOP
                -- Duplicate task with new ticket and return the new task id
                select into new_task_id create_new_task(task_id, new_ticket_id);
            END LOOP;
        END LOOP;
    END LOOP;

    FOR section_id IN SELECT id FROM sections WHERE version = working_version_id
    LOOP
        INSERT INTO sections (name, version, "order")
        SELECT name, new.id, "order"
        FROM sections 
        WHERE id = section_id
        returning id into new_section_id;

        FOR product_id in SELECT unique_id from products where section = section_id
        LOOP
            select into new_product_id public.create_new_product(product_id, new.id, new_section_id);

            INSERT INTO public.products (id, identifier, description, type, product_class, unit_of_measure, price, cost, taxable_flag, vendor, recurring_flag, recurring_cost, recurring_bill_cycle, recurring_cycle_type, category, parent, sequence_number, quantity, parent_catalog_item, catalog_item, manufacturer_part_number, calculated_price, calculated_cost, additional_overrides, section, version)
            SELECT id, identifier, description, type, product_class, unit_of_measure, price, cost, taxable_flag, vendor, recurring_flag, recurring_cost, recurring_bill_cycle, recurring_cycle_type, category, new_product_id, sequence_number, quantity, parent_catalog_item, catalog_item, manufacturer_part_number, calculated_price, calculated_cost, additional_overrides, new_section_id, new.id
            FROM public.products
            WHERE parent = product_id;
        END LOOP;
    END LOOP;
    
    return new;
END;$$;


ALTER FUNCTION "public"."duplicate_version_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_member"("email" "text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
userId text;
url text;
begin
  url := concat('https://manage.velomethod.com/v4_6_release/apis/3.0/system/members?conditions=primaryEmail like "', get_member.email, '"');
SELECT
  json_array_elements(content::json) ->> 'id'
INTO
  userId
FROM
  extensions.http (
    (
      'GET',
      url,
      ARRAY[
        extensions.http_header (
          'Authorization',
          'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
        ),
        extensions.http_header (
          'clientId',
          '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
        )
      ],
      NULL,
      NULL
    )
  );
 return userId::int;
  end$$;


ALTER FUNCTION "public"."get_member"("email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_opportunity_products"("opportunity_id" integer) RETURNS TABLE("id" integer, "catalogitem" integer)
    LANGUAGE "plpgsql"
    AS $$
declare
  url text;
begin
  url := concat('https://manage.velomethod.com/v4_6_release/apis/3.0/procurement/products?conditions=opportunity/id=', opportunity_id);

  return query
  select 
    (json_array_elements(content::json)->>'id')::int as id, 
    (json_array_elements(content::json)->'catalogItem'->>'id')::int as catalogItem
  from
    http (
      (
        'GET',
        'https://manage.velomethod.com/v4_6_release/apis/3.0/procurement/products?fields=id,catalogItem/id&conditions=opportunity/id=4343',
        array[
          http_header (
            'Authorization',
            'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
          ),
          http_header (
            'clientId',
            '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
          )
        ],
        'application/json',
        null
      )::http_request
    );

  return;
end;
$$;


ALTER FUNCTION "public"."get_opportunity_products"("opportunity_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_organization_from_phase"("phase_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "labor_rate" numeric, "slug" "text", "default_template" bigint, "visibility_settings" "jsonb")
    LANGUAGE "plpgsql"
    AS $$BEGIN
  return query
    select organizations.id, organizations.name, organizations.labor_rate, organizations.slug, organizations.default_template, organizations.visibility_settings
    from organizations
    inner join proposals on organizations.id = proposals.organization
    inner join phases on proposals.id = phases.proposal
  where phases.id = phase_id;
END;$$;


ALTER FUNCTION "public"."get_organization_from_phase"("phase_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_phase"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  -- new.visible = new.description not like '%Backoffice Coordination%'::text;

  update phases
    set visible = new.description not like '%Backoffice Coordination%'::text
    where id = new.id;

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_phase"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_proposal"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  user_org uuid;
  org_labor_rate numeric;
begin
  select labor_rate
  into org_labor_rate
  from organizations
  where id = '1c80bfac-b59f-420b-8b0e-a330aa377edd';

  new.organization = user_org;
  new.labor_rate = org_labor_rate;
  new.expiration_date = now() + interval '90 days';

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_proposal"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$-- declare
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
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_version_creation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  version_id uuid;
begin
  insert into versions (proposal) 
  values (new.id)
  returning id into version_id;

  new.current_version = version_id;

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_version_creation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_proposal_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
  UPDATE proposals
  SET updated_at = now()
  WHERE id = new.id; 
  return new;
end;$$;


ALTER FUNCTION "public"."handle_proposal_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_version_increment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
   SELECT COALESCE(max(number)+1, 1) INTO NEW.number
      FROM versions
      WHERE proposal = NEW.proposal;
   RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_version_increment"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_organization_member"("organization_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$select exists (
  select 1
  from profiles p
  where p.organization = is_organization_member.organization_id
  and p.id = is_organization_member.user_id
);$$;


ALTER FUNCTION "public"."is_organization_member"("organization_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_proposal_shared"("proposal_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$declare
exists boolean;
begin
select exists (
  select 1
  from proposal_sharing ps
  where ps.proposal = is_proposal_shared.proposal_id
  and ps.user = is_proposal_shared.user_id
) into exists;

return exists;
end;$$;


ALTER FUNCTION "public"."is_proposal_shared"("proposal_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  result JSONB;
  v RECORD;
BEGIN
   result = val1;
   FOR v IN SELECT * FROM jsonb_each(val2) LOOP
     IF result @> jsonb_build_object(v.key,v.value)
        THEN result = result - v.key;
     ELSIF result ? v.key THEN CONTINUE;
     ELSE
        result = result || jsonb_build_object(v.key,'null');
     END IF;
   END LOOP;
   RETURN result;
END;
$$;


ALTER FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_followers_when_proposal_signed"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
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
END;$$;


ALTER FUNCTION "public"."notify_followers_when_proposal_signed"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."organization_integrations_encrypt_secret_secret_key"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
		BEGIN
		        new.secret_key = CASE WHEN new.secret_key IS NULL THEN NULL ELSE
			CASE WHEN '350be075-8d80-447a-a6bb-45c9aa5d0b26' IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret_key, 'utf8'),
				pg_catalog.convert_to(('')::text, 'utf8'),
				'350be075-8d80-447a-a6bb-45c9aa5d0b26'::uuid,
				NULL
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


ALTER FUNCTION "public"."organization_integrations_encrypt_secret_secret_key"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."phase_loop"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  proposal_version uuid;
  created_opportunity_id int;
  created_project_id int;
  phase_id uuid;
  created_phase_id int;
  ticket_id uuid;
  task_id uuid;
  created_ticket_id int;
begin
for phase_id in select id from phases where version = 'd22fd5ce-9acd-4b0f-8132-f62ba00dd610'
  loop
    -- Create phase in project
    select create_project_phase into created_phase_id from create_project_phase(phase_id, 1030);

    for ticket_id in select id from tickets where phase = phase_id
    loop
      select create_phase_ticket into created_ticket_id from create_phase_ticket(ticket_id, created_phase_id);

      for task_id in select id from tasks where ticket = ticket_id
      loop
        perform create_ticket_task(task_id, created_ticket_id);
      end loop;
    end loop;
  end loop;
  return;
end;
$$;


ALTER FUNCTION "public"."phase_loop"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."read_secret"("secret_name" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


ALTER FUNCTION "public"."read_secret"("secret_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_slug_from_name"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  new.slug = slugify(new.name);
  return new;
END
$$;


ALTER FUNCTION "public"."set_slug_from_name"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."slugify"("value" "text") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE STRICT
    AS $_$
  -- removes accents (diacritic signs) from a given string --
  WITH "unaccented" AS (
    SELECT unaccent("value") AS "value"
  ),
  -- lowercases the string
  "lowercase" AS (
    SELECT lower("value") AS "value"
    FROM "unaccented"
  ),
  -- remove single and double quotes
  "removed_quotes" AS (
    SELECT regexp_replace("value", '[''"]+', '', 'gi') AS "value"
    FROM "lowercase"
  ),
  -- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
  "hyphenated" AS (
    SELECT regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') AS "value"
    FROM "removed_quotes"
  ),
  -- trims hyphens('-') if they exist on the head or tail of the string
  "trimmed" AS (
    SELECT regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') AS "value"
    FROM "hyphenated"
  )
  SELECT "value" FROM "trimmed";
$_$;


ALTER FUNCTION "public"."slugify"("value" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_bundle_price"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  updated_bundle record;
begin
  if new.parent is not null then
    select 
      coalesce(sum(products.price * products.quantity), 0) as price_total, 
      coalesce(sum(products.cost * products.quantity), 0) as cost_total
    into updated_bundle
    from products 
    where parent = new.parent;

    update products
    set calculated_price = updated_bundle.price_total, calculated_cost = updated_bundle.cost_total
    where unique_id = new.parent;
  end if;

  return new;
end;$$;


ALTER FUNCTION "public"."update_bundle_price"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  url text;
begin
  url := concat('https://manage.velomethod.com/v4_6_release/apis/3.0/procurement/products/', o_prod_id);

  perform from http((
      'PATCH',
      url,
      array[
        http_header (
          'Authorization',
          'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
        ),
        http_header (
          'clientId',
          '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
        )
      ],
      'application/json',
      array_to_json(array[
        jsonb_build_object(
          'op',
          'replace',
          'path',
          '/price',
          'value',
          price
        ),
        jsonb_build_object(
          'op',
          'replace',
          'path',
          '/cost',
          'value',
          cost
        )
      ])
    )::http_request);
end;
$$;


ALTER FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric, "quantity" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  url text;
begin
  url := concat('https://manage.velomethod.com/v4_6_release/apis/3.0/procurement/products/', o_prod_id);

  perform from http((
      'PATCH',
      url,
      array[
        http_header (
          'Authorization',
          'Basic dmVsbytYMzJMQjRYeDVHVzVNRk56Olhjd3Jmd0dwQ09EaFNwdkQ='
        ),
        http_header (
          'clientId',
          '9762e3fa-abbd-4179-895e-ca7b0e015ab2'
        )
      ],
      'application/json',
      array_to_json(array[
        jsonb_build_object(
          'op',
          'replace',
          'path',
          '/price',
          'value',
          price
        ),
        jsonb_build_object(
          'op',
          'replace',
          'path',
          '/cost',
          'value',
          cost
        ),
        jsonb_build_object(
          'op',
          'replace',
          'path',
          '/quantity',
          'value',
          quantity
        )
      ])
    )::http_request);
end;
$$;


ALTER FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric, "quantity" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_phase_total_hours"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  total_labor_hours numeric;
begin
  select coalesce(sum(budget_hours), 0) as total 
  into total_labor_hours
  from tickets 
  where (phase = new.phase);

  update phases
  set hours = total_labor_hours
  where id = new.phase;
  return new;
end;
$$;


ALTER FUNCTION "public"."update_phase_total_hours"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_proposal_labor_hours"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  phase_labor_hours numeric;
begin
  select coalesce(sum(hours), 0) as total 
  into phase_labor_hours
  from phases 
  where (proposal = new.proposal);

  update proposals
  set labor_hours = phase_labor_hours
  where id = new.proposal;
  -- new.labor_hours = phase_labor_hours;
  return new;
end;
$$;


ALTER FUNCTION "public"."update_proposal_labor_hours"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_proposal_product_total"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
  products_total_price numeric;
begin
  select coalesce(sum(extended_price), 0) as total 
  into products_total_price
  from products 
  where (proposal = new.proposal);

  update proposals
  set total_product_price = products_total_price
  where id = new.proposal;
  -- new.labor_hours = phase_labor_hours;
  return new;
end;
$$;


ALTER FUNCTION "public"."update_proposal_product_total"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "reporting"."refresh_reporting_views"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$BEGIN
REFRESH MATERIALIZED VIEW reporting.handle_time_by_day;
END;$$;


ALTER FUNCTION "reporting"."refresh_reporting_views"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "reporting"."search_number"("phone_number" "text") RETURNS TABLE("userid" bigint, "companyid" bigint, "name" "text", "territoryname" "text")
    LANGUAGE "plpgsql"
    AS $$
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
$$;


ALTER FUNCTION "reporting"."search_number"("phone_number" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "taskrouter"."completethetask"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$begin
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
END$$;


ALTER FUNCTION "taskrouter"."completethetask"() OWNER TO "postgres";


CREATE FOREIGN DATA WRAPPER "wasm_wrapper" HANDLER "extensions"."wasm_fdw_handler" VALIDATOR "extensions"."wasm_fdw_validator";



SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "livekit"."join_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room" "text" NOT NULL,
    "token" "text" NOT NULL,
    "to_user" "uuid" NOT NULL,
    "from_user" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone
);


ALTER TABLE "livekit"."join_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text" NOT NULL,
    "hours" numeric DEFAULT '0'::numeric NOT NULL,
    "order" numeric DEFAULT '0'::numeric NOT NULL,
    "visible" boolean DEFAULT true,
    "reference_id" bigint,
    "version" "uuid" NOT NULL
);


ALTER TABLE "public"."phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" bigint,
    "identifier" "text",
    "description" "text",
    "type" "text",
    "product_class" "text",
    "unit_of_measure" "text",
    "price" numeric,
    "cost" numeric,
    "taxable_flag" boolean,
    "vendor" "text",
    "recurring_flag" boolean,
    "recurring_cost" numeric,
    "recurring_bill_cycle" bigint,
    "recurring_cycle_type" "text",
    "category" "text",
    "unique_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "parent" "uuid",
    "sequence_number" bigint,
    "quantity" numeric DEFAULT '1'::numeric NOT NULL,
    "parent_catalog_item" bigint,
    "catalog_item" bigint,
    "manufacturer_part_number" "text",
    "calculated_price" numeric,
    "calculated_cost" numeric,
    "additional_overrides" "jsonb",
    "section" "uuid",
    "version" "uuid" NOT NULL,
    "extended_price" numeric GENERATED ALWAYS AS (("price" * "quantity")) STORED,
    "extended_cost" numeric GENERATED ALWAYS AS (("cost" * "quantity")) STORED,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "order" bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "labor_hours" numeric DEFAULT '0'::numeric NOT NULL,
    "labor_rate" numeric DEFAULT '0'::numeric NOT NULL,
    "organization" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "templates_used" bigint[],
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "service_ticket" bigint,
    "expiration_date" timestamp with time zone,
    "status" "public"."status" DEFAULT 'building'::"public"."status" NOT NULL,
    "opportunity_id" bigint,
    "created_by" "uuid" DEFAULT "auth"."uid"(),
    "project_id" bigint,
    "catalog_items" bigint[],
    "working_version" "uuid",
    "company_id" bigint,
    "contact_id" bigint,
    "company_name" "text",
    "approval_info" "jsonb",
    "contact_name" "text",
    "embedding" "extensions"."vector"(512),
    "is_conversion_completed" boolean DEFAULT false NOT NULL,
    "is_getting_converted" boolean DEFAULT false NOT NULL,
    "contact" "jsonb",
    "company" "jsonb",
    "date_approved" timestamp with time zone
);


ALTER TABLE "public"."proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "summary" "text" NOT NULL,
    "order" smallint NOT NULL,
    "budget_hours" numeric DEFAULT '0'::numeric NOT NULL,
    "phase" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "reference_id" bigint
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."calculate_totals" WITH ("security_invoker"='on') AS
 WITH "ticket_hours" AS (
         SELECT "sum"("t"."budget_hours") AS "total_hours"
           FROM ("public"."phases" "p"
             JOIN "public"."tickets" "t" ON (("p"."id" = "t"."phase")))
          GROUP BY "p"."id"
        ), "product_totals" AS (
         SELECT "sum"(
                CASE
                    WHEN ("p"."product_class" = 'Bundle'::"text") THEN ("p"."calculated_price" * "p"."quantity")
                    ELSE ("p"."price" * "p"."quantity")
                END) AS "total_product",
            "sum"(
                CASE
                    WHEN ("p"."product_class" = 'Bundle'::"text") THEN ("p"."calculated_cost" * "p"."quantity")
                    ELSE ("p"."cost" * "p"."quantity")
                END) AS "total_cost",
            "sum"(
                CASE
                    WHEN "p"."recurring_flag" THEN ("p"."price" * "p"."quantity")
                    ELSE (0)::numeric
                END) AS "total_recurring"
           FROM "public"."products" "p"
          WHERE (NOT ("p"."recurring_flag" AND ("p"."recurring_bill_cycle" = 2)))
          GROUP BY "p"."id"
        ), "labor_totals" AS (
         SELECT (COALESCE("sum"("th"."total_hours"), (0)::numeric) * "max"("pr"."labor_rate")) AS "labor_total"
           FROM "ticket_hours" "th",
            "public"."proposals" "pr"
        )
 SELECT "lt"."labor_total",
    "pt"."total_product",
    "pt"."total_recurring",
    (("pt"."total_product" + "pt"."total_recurring") + "lt"."labor_total") AS "total_price",
    ("pt"."total_cost" + "pt"."total_recurring") AS "total_cost"
   FROM "labor_totals" "lt",
    "product_totals" "pt";


ALTER TABLE "public"."calculate_totals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo" "text",
    "type" "public"."integration_type",
    "auth_type" "public"."auth_type"
);


ALTER TABLE "public"."integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "resource_path" "text" NOT NULL,
    "resource_params" "jsonb",
    "from" "text",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "resource_name" "text"
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_integrations" (
    "organization" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "integration" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "client_id" "text",
    "secret_key" "text"
);


ALTER TABLE "public"."organization_integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "labor_rate" numeric NOT NULL,
    "slug" "text",
    "default_template" bigint,
    "visibility_settings" "jsonb" DEFAULT '{"tasks": false, "phases": true, "tickets": true}'::"jsonb" NOT NULL,
    "default_assumptions" "text",
    CONSTRAINT "organizations_slug_check" CHECK (("length"("slug") > 0))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pinned_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "record_type" "text" NOT NULL,
    "identifier" "text" NOT NULL,
    "helper_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "params" "jsonb" NOT NULL,
    "path" "text" NOT NULL
);


ALTER TABLE "public"."pinned_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile_keys" (
    "user_id" "uuid" NOT NULL,
    "key" "text" NOT NULL
);


ALTER TABLE "public"."profile_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "first_name" "text",
    "contact_id" bigint,
    "organization" "uuid",
    "system_member_id" bigint,
    "last_name" "text",
    "worker_sid" "text",
    "image_url" "text",
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_followers" (
    "proposal_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."proposal_followers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_settings" (
    "proposal" "uuid" NOT NULL,
    "version" "uuid" NOT NULL,
    "assumptions" "text",
    "description" "text"
);


ALTER TABLE "public"."proposal_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "number" smallint,
    "proposal" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."versions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."proposal_totals" WITH ("security_invoker"='on') AS
 WITH "phase_totals" AS (
         SELECT "ph"."version",
            "sum"("ph"."hours") AS "total_hours"
           FROM "public"."phases" "ph"
          GROUP BY "ph"."version"
        ), "product_totals" AS (
         SELECT "pr"."version",
            "sum"(
                CASE
                    WHEN (("pr"."recurring_flag" = false) AND ("pr"."parent" IS NULL)) THEN
                    CASE
                        WHEN ("pr"."product_class" = 'Bundle'::"text") THEN "pr"."calculated_price"
                        ELSE "pr"."extended_price"
                    END
                    ELSE (0)::numeric
                END) AS "non_recurring_total",
            "sum"(
                CASE
                    WHEN (("pr"."recurring_flag" = false) AND ("pr"."parent" IS NULL)) THEN
                    CASE
                        WHEN ("pr"."product_class" = 'Bundle'::"text") THEN "pr"."calculated_cost"
                        ELSE "pr"."extended_cost"
                    END
                    ELSE (0)::numeric
                END) AS "non_recurring_cost",
            "sum"(
                CASE
                    WHEN (("pr"."recurring_flag" = true) AND ("pr"."parent" IS NULL)) THEN
                    CASE
                        WHEN ("pr"."product_class" = 'Bundle'::"text") THEN "pr"."calculated_price"
                        ELSE "pr"."extended_price"
                    END
                    ELSE (0)::numeric
                END) AS "recurring_total",
            "sum"(
                CASE
                    WHEN (("pr"."recurring_flag" = true) AND ("pr"."parent" IS NULL)) THEN
                    CASE
                        WHEN ("pr"."product_class" = 'Bundle'::"text") THEN "pr"."calculated_cost"
                        ELSE "pr"."extended_cost"
                    END
                    ELSE (0)::numeric
                END) AS "recurring_cost"
           FROM "public"."products" "pr"
          WHERE ("pr"."parent" IS NULL)
          GROUP BY "pr"."version"
        )
 SELECT "p"."id" AS "proposal_id",
    "v"."id" AS "version_id",
    "v"."number" AS "version_number",
    COALESCE("pt"."total_hours", (0)::numeric) AS "total_hours",
    "p"."labor_rate",
    (COALESCE("pt"."total_hours", (0)::numeric) * "p"."labor_rate") AS "labor_cost",
    COALESCE("ptot"."non_recurring_total", (0)::numeric) AS "non_recurring_product_total",
    COALESCE("ptot"."non_recurring_cost", (0)::numeric) AS "non_recurring_product_cost",
    COALESCE("ptot"."recurring_total", (0)::numeric) AS "recurring_total",
    COALESCE("ptot"."recurring_cost", (0)::numeric) AS "recurring_cost",
    ((COALESCE("ptot"."non_recurring_total", (0)::numeric) + COALESCE("ptot"."recurring_total", (0)::numeric)) + (COALESCE("pt"."total_hours", (0)::numeric) * "p"."labor_rate")) AS "total_price"
   FROM ((("public"."proposals" "p"
     JOIN "public"."versions" "v" ON ((("v"."proposal" = "p"."id") AND ("v"."id" = "p"."working_version"))))
     LEFT JOIN "phase_totals" "pt" ON (("pt"."version" = "v"."id")))
     LEFT JOIN "product_totals" "ptot" ON (("ptot"."version" = "v"."id")));


ALTER TABLE "public"."proposal_totals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version" "uuid" NOT NULL,
    "order" bigint DEFAULT '1'::bigint NOT NULL
);


ALTER TABLE "public"."sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "summary" "text" NOT NULL,
    "notes" "text" NOT NULL,
    "priority" smallint NOT NULL,
    "ticket" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "visibile" boolean DEFAULT false NOT NULL,
    "reference_id" bigint,
    "budget_hours" numeric,
    "order" smallint DEFAULT '1'::smallint NOT NULL,
    "visible" boolean DEFAULT false
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "reporting"."conversations" (
    "id" "text" NOT NULL,
    "abandoned" "text",
    "abandoned_phase" "text",
    "communication_channel" "text",
    "phone_number" "text",
    "direction" "text",
    "workflow" "text",
    "queue" "text",
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "in_business_hours" boolean,
    "outcome" "text",
    "agent" "text",
    "abandon_time" bigint,
    "hold_time" bigint,
    "queue_time" bigint,
    "talk_time" bigint,
    "contact_id" bigint,
    "company_id" bigint
);


ALTER TABLE "reporting"."conversations" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."abandoned_conversations_by_day" AS
 SELECT "date"("conversations"."date") AS "conversation_date",
    "count"(*) AS "abandoned_count",
    ("avg"("conversations"."abandon_time"))::integer AS "average_abandon_time"
   FROM "reporting"."conversations"
  WHERE ("conversations"."abandoned" IS NOT NULL)
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date"))
  WITH NO DATA;


ALTER TABLE "reporting"."abandoned_conversations_by_day" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "reporting"."engagements" (
    "id" "text" NOT NULL,
    "channel" "text" DEFAULT 'voice'::"text" NOT NULL,
    "is_inbound" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "contact" "jsonb",
    "company" "jsonb",
    "attributes" "jsonb",
    "is_canceled" boolean,
    "recording_url" "text",
    "transcription_sid" "text",
    "is_voicemail" boolean,
    "follow_up_engagement_id" "text",
    "workspace_sid" "text"
);


ALTER TABLE "reporting"."engagements" OWNER TO "postgres";


CREATE OR REPLACE VIEW "reporting"."call_summary_by_period" WITH ("security_invoker"='on') AS
 SELECT ("date_trunc"('day'::"text", "engagements"."created_at"))::timestamp without time zone AS "call_date",
    "engagements"."channel",
    "count"(*) FILTER (WHERE ("engagements"."is_canceled" IS NOT TRUE)) AS "total_engagements",
    "count"(*) FILTER (WHERE (("engagements"."is_inbound" = true) AND ("engagements"."is_canceled" IS NOT TRUE))) AS "inbound_engagements",
    "count"(*) FILTER (WHERE (("engagements"."is_inbound" = false) AND ("engagements"."is_canceled" IS NOT TRUE))) AS "outbound_engagements",
    "count"(*) FILTER (WHERE (("engagements"."is_voicemail" = true) AND ("engagements"."is_canceled" IS NOT TRUE))) AS "voicemails"
   FROM "reporting"."engagements"
  GROUP BY (("date_trunc"('day'::"text", "engagements"."created_at"))::timestamp without time zone), "engagements"."channel"
  ORDER BY (("date_trunc"('day'::"text", "engagements"."created_at"))::timestamp without time zone), "engagements"."channel";


ALTER TABLE "reporting"."call_summary_by_period" OWNER TO "postgres";


CREATE OR REPLACE VIEW "reporting"."calls_by_agent" WITH ("security_invoker"='on') AS
 SELECT "conversations"."agent",
    "sum"(
        CASE
            WHEN ("conversations"."direction" = 'Inbound'::"text") THEN 1
            ELSE 0
        END) AS "inbound_calls",
    "sum"(
        CASE
            WHEN ("conversations"."direction" = 'Outbound'::"text") THEN 1
            ELSE 0
        END) AS "outbound_calls"
   FROM "reporting"."conversations"
  GROUP BY "conversations"."agent"
  ORDER BY "conversations"."agent";


ALTER TABLE "reporting"."calls_by_agent" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."calls_by_agent_by_day" AS
 SELECT "conversations"."date",
    "conversations"."agent",
    "count"(*) AS "total_conversations",
    "sum"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Inbound'::"text") THEN 1
            ELSE 0
        END) AS "inbound_calls",
    "sum"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Outbound'::"text") THEN 1
            ELSE 0
        END) AS "outbound_calls",
    "sum"(COALESCE("conversations"."talk_time", (0)::bigint)) AS "total_talk_time"
   FROM "reporting"."conversations"
  WHERE ("conversations"."agent" IS NOT NULL)
  GROUP BY "conversations"."date", "conversations"."agent"
  ORDER BY "conversations"."date" DESC, "conversations"."agent"
  WITH NO DATA;


ALTER TABLE "reporting"."calls_by_agent_by_day" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."calls_summary_by_day" AS
 SELECT "date"("conversations"."date") AS "call_date",
    "count"(*) AS "total_calls",
    "count"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Inbound'::"text") THEN 1
            ELSE NULL::integer
        END) AS "inbound_conversations",
    "count"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Outbound'::"text") THEN 1
            ELSE NULL::integer
        END) AS "outbound_conversations",
    "sum"(COALESCE("conversations"."talk_time", (0)::bigint)) AS "total_talk_time"
   FROM "reporting"."conversations"
  WHERE (("conversations"."date" IS NOT NULL) AND ("conversations"."talk_time" > 0))
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date"))
  WITH NO DATA;


ALTER TABLE "reporting"."calls_summary_by_day" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."conversations_by_agent_by_day" AS
 SELECT "date"("conversations"."date") AS "conversation_date",
    "conversations"."agent",
    "count"(*) AS "total_conversations",
    "count"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Inbound'::"text") THEN 1
            ELSE NULL::integer
        END) AS "inbound_conversations",
    "count"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Outbound'::"text") THEN 1
            ELSE NULL::integer
        END) AS "outbound_conversations",
    "sum"(COALESCE("conversations"."talk_time", (0)::bigint)) AS "total_talk_time"
   FROM "reporting"."conversations"
  WHERE (("conversations"."agent" IS NOT NULL) AND ("conversations"."talk_time" > 0))
  GROUP BY ("date"("conversations"."date")), "conversations"."agent"
  ORDER BY ("date"("conversations"."date")) DESC, "conversations"."agent"
  WITH NO DATA;


ALTER TABLE "reporting"."conversations_by_agent_by_day" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."conversations_summary_by_day" AS
 SELECT "date"("conversations"."date") AS "conversation_date",
    "count"(*) AS "total_conversations",
    "count"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Inbound'::"text") THEN 1
            ELSE NULL::integer
        END) AS "inbound_conversations",
    "count"(
        CASE
            WHEN ("conversations"."direction" ~~* 'Outbound'::"text") THEN 1
            ELSE NULL::integer
        END) AS "outbound_conversations",
    "count"(
        CASE
            WHEN ("conversations"."abandoned_phase" = 'Voicemail'::"text") THEN 1
            ELSE NULL::integer
        END) AS "voicemail_count"
   FROM "reporting"."conversations"
  WHERE ("conversations"."date" IS NOT NULL)
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date")) DESC
  WITH NO DATA;


ALTER TABLE "reporting"."conversations_summary_by_day" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "reporting"."engagement_reservations" (
    "id" "text" NOT NULL,
    "enagement_id" "text" NOT NULL,
    "worker_sid" "text" NOT NULL,
    "reservation_status" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "reporting"."engagement_reservations" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."handle_time_by_day" AS
 SELECT "date"("conversations"."date") AS "conversation_date",
    "avg"(("conversations"."talk_time" + "conversations"."hold_time")) AS "average_handling_time",
    "avg"("conversations"."abandon_time") AS "average_abandon_time",
    "avg"("conversations"."queue_time") AS "average_queue_time"
   FROM "reporting"."conversations"
  WHERE ("conversations"."date" IS NOT NULL)
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date"))
  WITH NO DATA;


ALTER TABLE "reporting"."handle_time_by_day" OWNER TO "postgres";


CREATE OR REPLACE VIEW "reporting"."handle_time_by_day_test" WITH ("security_invoker"='on') AS
 SELECT "date"("conversations"."date") AS "conversation_date",
    "avg"(("conversations"."talk_time" + "conversations"."hold_time")) AS "average_handling_time",
    "avg"("conversations"."abandon_time") AS "average_abandon_time",
    "avg"("conversations"."queue_time") AS "average_queue_time"
   FROM "reporting"."conversations"
  WHERE (("conversations"."date" IS NOT NULL) AND ("conversations"."abandoned" IS NULL))
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date")) DESC;


ALTER TABLE "reporting"."handle_time_by_day_test" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."voicemails_by_day" AS
 SELECT "date"("conversations"."date") AS "voicemail_date",
    "count"(*) AS "voicemail_count"
   FROM "reporting"."conversations"
  WHERE ("conversations"."abandoned_phase" = 'Voicemail'::"text")
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date")) DESC
  WITH NO DATA;


ALTER TABLE "reporting"."voicemails_by_day" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "reporting"."voicemails_by_month" AS
 SELECT "date_trunc"('month'::"text", "conversations"."date") AS "voicemail_month",
    "count"(*) AS "voicemail_count"
   FROM "reporting"."conversations"
  WHERE (("conversations"."direction" = 'Inbound'::"text") AND ("conversations"."abandoned_phase" = 'Voicemail'::"text"))
  GROUP BY ("date_trunc"('month'::"text", "conversations"."date"))
  ORDER BY ("date_trunc"('month'::"text", "conversations"."date")) DESC
  WITH NO DATA;


ALTER TABLE "reporting"."voicemails_by_month" OWNER TO "postgres";


CREATE OR REPLACE VIEW "reporting"."voicemails_left_by_day" WITH ("security_invoker"='on') AS
 SELECT "date"("conversations"."date") AS "date",
    "count"(*) AS "voicemail_count"
   FROM "reporting"."conversations"
  WHERE (("conversations"."date" IS NOT NULL) AND ("conversations"."abandoned_phase" = 'Voicemail'::"text"))
  GROUP BY ("date"("conversations"."date"))
  ORDER BY ("date"("conversations"."date")) DESC;


ALTER TABLE "reporting"."voicemails_left_by_day" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "system"."microsoft_graph_subscriptions" (
    "subscription_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "expiration_date" timestamp with time zone NOT NULL
);


ALTER TABLE "system"."microsoft_graph_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "taskrouter"."blacklisted_phone_numbers" (
    "number" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL
);


ALTER TABLE "taskrouter"."blacklisted_phone_numbers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "taskrouter"."tasks" (
    "task_sid" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reservation_sid" "text" NOT NULL
);


ALTER TABLE "taskrouter"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "user_experience"."views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "creator" "uuid" DEFAULT "auth"."uid"(),
    "filters" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "user_experience"."views" OWNER TO "postgres";


ALTER TABLE ONLY "livekit"."join_requests"
    ADD CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_integrations"
    ADD CONSTRAINT "organization_integrations_pkey" PRIMARY KEY ("organization", "integration");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."phases"
    ADD CONSTRAINT "phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pinned_items"
    ADD CONSTRAINT "pinned_items_pkey" PRIMARY KEY ("id", "user_id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_2_pkey" PRIMARY KEY ("unique_id");



ALTER TABLE ONLY "public"."profile_keys"
    ADD CONSTRAINT "profile_keys_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_worker_sid_key" UNIQUE ("worker_sid");



ALTER TABLE ONLY "public"."proposal_followers"
    ADD CONSTRAINT "proposal_followers_pkey" PRIMARY KEY ("proposal_id", "user_id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "section_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposal_settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("proposal", "version");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."versions"
    ADD CONSTRAINT "version_uuid_nr_unique" UNIQUE ("proposal", "number");



ALTER TABLE ONLY "public"."versions"
    ADD CONSTRAINT "versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "reporting"."conversations"
    ADD CONSTRAINT "conversations_new_pkey2" PRIMARY KEY ("id");



ALTER TABLE ONLY "reporting"."engagement_reservations"
    ADD CONSTRAINT "engagement_reservations_pkey" PRIMARY KEY ("id", "enagement_id");



ALTER TABLE ONLY "reporting"."engagements"
    ADD CONSTRAINT "engagements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "system"."microsoft_graph_subscriptions"
    ADD CONSTRAINT "microsoft_graph_subscriptions_pkey" PRIMARY KEY ("subscription_id");



ALTER TABLE ONLY "taskrouter"."blacklisted_phone_numbers"
    ADD CONSTRAINT "blacklisted_phone_numbers_pkey" PRIMARY KEY ("number", "organization_id");



ALTER TABLE ONLY "taskrouter"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("task_sid", "reservation_sid");



ALTER TABLE ONLY "user_experience"."views"
    ADD CONSTRAINT "custom_view_pkey" PRIMARY KEY ("id");



CREATE INDEX "profiles_worker_sid_idx" ON "public"."profiles" USING "btree" ("worker_sid");



CREATE INDEX "proposals_embedding_idx" ON "public"."proposals" USING "hnsw" ("embedding" "extensions"."vector_ip_ops");



CREATE INDEX "tasks_ticket_idx" ON "public"."tasks" USING "btree" ("ticket");



CREATE INDEX "tickets_phase_idx" ON "public"."tickets" USING "btree" ("phase");



CREATE INDEX "conversations_contact_id_company_id_idx" ON "reporting"."conversations" USING "btree" ("contact_id", "company_id");



CREATE INDEX "conversations_date_idx" ON "reporting"."conversations" USING "btree" ("date");



CREATE INDEX "engagements_workspace_sid_idx" ON "reporting"."engagements" USING "btree" ("workspace_sid");



CREATE OR REPLACE TRIGGER "handle_bundle_calculated_cost" AFTER UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_bundle_price"();



CREATE OR REPLACE TRIGGER "notify_follows_when_proposal_is_signed" AFTER UPDATE ON "public"."proposals" FOR EACH ROW EXECUTE FUNCTION "public"."notify_followers_when_proposal_signed"();



CREATE OR REPLACE TRIGGER "on_new_version_creation" AFTER INSERT ON "public"."versions" FOR EACH ROW EXECUTE FUNCTION "public"."duplicate_version_data"();



CREATE OR REPLACE TRIGGER "on_organization_insert" BEFORE INSERT ON "public"."organizations" FOR EACH ROW WHEN ((("new"."name" IS NOT NULL) AND ("new"."slug" IS NULL))) EXECUTE FUNCTION "public"."set_slug_from_name"();



CREATE OR REPLACE TRIGGER "on_phase_insert" AFTER INSERT ON "public"."integrations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_phase"();



CREATE OR REPLACE TRIGGER "on_proposal_creation" BEFORE INSERT ON "public"."proposals" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_proposal"();



CREATE OR REPLACE TRIGGER "on_ticket_events_update_total_hours" AFTER INSERT OR DELETE OR UPDATE ON "public"."tickets" FOR EACH ROW EXECUTE FUNCTION "public"."update_phase_total_hours"();



CREATE OR REPLACE TRIGGER "veritrig" BEFORE INSERT OR UPDATE ON "public"."versions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_version_increment"();



CREATE OR REPLACE TRIGGER "on_conversation_update" AFTER UPDATE ON "reporting"."conversations" FOR EACH STATEMENT EXECUTE FUNCTION "reporting"."refresh_reporting_views"();

ALTER TABLE "reporting"."conversations" DISABLE TRIGGER "on_conversation_update";



CREATE OR REPLACE TRIGGER "on_deletion_of_task" AFTER DELETE ON "taskrouter"."tasks" FOR EACH ROW EXECUTE FUNCTION "taskrouter"."completethetask"();



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_integrations"
    ADD CONSTRAINT "organization_integrations_integration_fkey" FOREIGN KEY ("integration") REFERENCES "public"."integrations"("id");



ALTER TABLE ONLY "public"."organization_integrations"
    ADD CONSTRAINT "organization_integrations_organization_fkey" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."profile_keys"
    ADD CONSTRAINT "profile_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_organization_fkey" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."proposal_followers"
    ADD CONSTRAINT "proposal_followers_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_followers"
    ADD CONSTRAINT "proposal_followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_organization_fkey" FOREIGN KEY ("organization") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."phases"
    ADD CONSTRAINT "public_phases_version_fkey" FOREIGN KEY ("version") REFERENCES "public"."versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "public_products_2_parent_fkey" FOREIGN KEY ("parent") REFERENCES "public"."products"("unique_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "public_products_section_fkey" FOREIGN KEY ("section") REFERENCES "public"."sections"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "public_products_version_fkey" FOREIGN KEY ("version") REFERENCES "public"."versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "public_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "public_proposals_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "public_proposals_working_version_fkey" FOREIGN KEY ("working_version") REFERENCES "public"."versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sections"
    ADD CONSTRAINT "public_sections_version_fkey" FOREIGN KEY ("version") REFERENCES "public"."versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "public_tickets_phase_fkey" FOREIGN KEY ("phase") REFERENCES "public"."phases"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."versions"
    ADD CONSTRAINT "public_versions_proposal_fkey" FOREIGN KEY ("proposal") REFERENCES "public"."proposals"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_settings"
    ADD CONSTRAINT "settings_proposal_fkey" FOREIGN KEY ("proposal") REFERENCES "public"."proposals"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."proposal_settings"
    ADD CONSTRAINT "settings_version_fkey" FOREIGN KEY ("version") REFERENCES "public"."versions"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_ticket_fkey" FOREIGN KEY ("ticket") REFERENCES "public"."tickets"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "reporting"."engagement_reservations"
    ADD CONSTRAINT "engagement_reservations_enagement_id_fkey" FOREIGN KEY ("enagement_id") REFERENCES "reporting"."engagements"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "reporting"."engagement_reservations"
    ADD CONSTRAINT "engagement_reservations_worker_sid_fkey" FOREIGN KEY ("worker_sid") REFERENCES "public"."profiles"("worker_sid") ON DELETE CASCADE;



ALTER TABLE ONLY "reporting"."engagements"
    ADD CONSTRAINT "engagements_follow_up_engagement_id_fkey" FOREIGN KEY ("follow_up_engagement_id") REFERENCES "reporting"."engagements"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "taskrouter"."blacklisted_phone_numbers"
    ADD CONSTRAINT "blacklisted_phone_numbers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "user_experience"."views"
    ADD CONSTRAINT "custom_view_creator_fkey" FOREIGN KEY ("creator") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "All" ON "livekit"."join_requests" USING (true) WITH CHECK (true);



ALTER TABLE "livekit"."join_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "All" ON "public"."integrations" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."organization_integrations" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."organizations" USING (true) WITH CHECK ("public"."is_organization_member"("id", ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "All" ON "public"."phases" TO "anon", "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."pinned_items" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "All" ON "public"."products" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."proposal_followers" TO "anon", "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."sections" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."tasks" TO "anon", "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."tickets" TO "anon", "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "public"."versions" USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can insert" ON "public"."profile_keys" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can update" ON "public"."profile_keys" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Can only modify your notifications" ON "public"."notifications" USING (( SELECT ("auth"."uid"() = "notifications"."user_id"))) WITH CHECK (( SELECT ("auth"."uid"() = "notifications"."user_id")));



CREATE POLICY "Delete" ON "public"."proposals" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."proposals" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."proposals" FOR SELECT USING (true);



CREATE POLICY "Enable updates for authenticated users only" ON "public"."proposals" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Only Can Select Own Keys" ON "public"."profile_keys" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Only authenticated can update" ON "public"."proposal_settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Public can see only visible rows" ON "public"."phases" FOR SELECT USING (("visible" = true));



CREATE POLICY "Public can see only visible rows" ON "public"."tickets" FOR SELECT USING (("visible" = true));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public user can only see visible columns" ON "public"."tasks" FOR SELECT USING (("visible" = true));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Visible to public roles" ON "public"."proposal_settings" FOR SELECT USING (true);



ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."phases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pinned_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposal_followers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposal_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."versions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "All" ON "reporting"."conversations" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "reporting"."engagement_reservations" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "reporting"."engagements" USING (true) WITH CHECK (true);



ALTER TABLE "reporting"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "reporting"."engagement_reservations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "reporting"."engagements" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "All" ON "system"."microsoft_graph_subscriptions" USING (true) WITH CHECK (true);



ALTER TABLE "system"."microsoft_graph_subscriptions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "All" ON "taskrouter"."blacklisted_phone_numbers" USING (true) WITH CHECK (true);



CREATE POLICY "All" ON "taskrouter"."tasks" USING (true) WITH CHECK (true);



ALTER TABLE "taskrouter"."blacklisted_phone_numbers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "taskrouter"."tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Can View Created Views" ON "user_experience"."views" USING (("auth"."uid"() = "creator")) WITH CHECK (true);



ALTER TABLE "user_experience"."views" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "reporting"."conversations";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "user_experience"."views";









GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "postgres";



GRANT USAGE ON SCHEMA "reporting" TO "anon";
GRANT USAGE ON SCHEMA "reporting" TO "authenticated";
GRANT USAGE ON SCHEMA "reporting" TO "service_role";



GRANT USAGE ON SCHEMA "system" TO "anon";
GRANT USAGE ON SCHEMA "system" TO "authenticated";
GRANT USAGE ON SCHEMA "system" TO "service_role";



GRANT USAGE ON SCHEMA "taskrouter" TO "anon";
GRANT USAGE ON SCHEMA "taskrouter" TO "authenticated";
GRANT USAGE ON SCHEMA "taskrouter" TO "service_role";



GRANT USAGE ON SCHEMA "user_experience" TO "anon";
GRANT USAGE ON SCHEMA "user_experience" TO "authenticated";







































































































































































































































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."convert_to_manage"("proposal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_to_manage"("proposal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_to_manage"("proposal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."copy_version_data"("old_version" "uuid", "new_version" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."copy_version_data"("old_version" "uuid", "new_version" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."copy_version_data"("old_version" "uuid", "new_version" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_manage_opportunity"("proposal_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_manage_opportunity"("proposal_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_manage_opportunity"("proposal_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_manage_project"("opportunity_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_manage_project"("opportunity_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_manage_project"("opportunity_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_phase"("old_phase_id" "uuid", "new_version_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_phase"("old_phase_id" "uuid", "new_version_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_phase"("old_phase_id" "uuid", "new_version_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_product"("old_product_id" "uuid", "new_version" "uuid", "new_section" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_product"("old_product_id" "uuid", "new_version" "uuid", "new_section" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_product"("old_product_id" "uuid", "new_version" "uuid", "new_section" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_task"("old_task_id" "uuid", "new_ticket_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_task"("old_task_id" "uuid", "new_ticket_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_task"("old_task_id" "uuid", "new_ticket_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_new_ticket"("old_ticket_id" "uuid", "new_phase_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_new_ticket"("old_ticket_id" "uuid", "new_phase_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_new_ticket"("old_ticket_id" "uuid", "new_phase_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_opportunity_products"("opportunity_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_opportunity_products"("opportunity_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_opportunity_products"("opportunity_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_opportunity_products"("opportunity_id" integer, "version_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_opportunity_products"("opportunity_id" integer, "version_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_opportunity_products"("opportunity_id" integer, "version_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_phase_ticket"("ticket_id" "uuid", "phase_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_phase_ticket"("ticket_id" "uuid", "phase_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_phase_ticket"("ticket_id" "uuid", "phase_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_project_phase"("phase_id" "uuid", "project_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_project_phase"("phase_id" "uuid", "project_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_project_phase"("phase_id" "uuid", "project_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_ticket_task"("task_id" "uuid", "ticket_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_ticket_task"("task_id" "uuid", "ticket_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_ticket_task"("task_id" "uuid", "ticket_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."duplicate_phases"("old_version" "uuid", "new_version" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."duplicate_phases"("old_version" "uuid", "new_version" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."duplicate_phases"("old_version" "uuid", "new_version" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."duplicate_products"("original_id" "uuid", "new_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."duplicate_products"("original_id" "uuid", "new_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."duplicate_products"("original_id" "uuid", "new_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."duplicate_tasks"("original_id" "uuid", "new_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."duplicate_tasks"("original_id" "uuid", "new_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."duplicate_tasks"("original_id" "uuid", "new_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."duplicate_tickets"("original_id" "uuid", "new_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."duplicate_tickets"("original_id" "uuid", "new_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."duplicate_tickets"("original_id" "uuid", "new_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."duplicate_version_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."duplicate_version_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."duplicate_version_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_member"("email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_member"("email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_member"("email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_opportunity_products"("opportunity_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_opportunity_products"("opportunity_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_opportunity_products"("opportunity_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_organization_from_phase"("phase_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_organization_from_phase"("phase_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_organization_from_phase"("phase_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_phase"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_phase"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_phase"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_proposal"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_proposal"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_proposal"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_version_creation"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_version_creation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_version_creation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_proposal_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_proposal_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_proposal_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_version_increment"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_version_increment"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_version_increment"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_organization_member"("organization_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_organization_member"("organization_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_organization_member"("organization_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_proposal_shared"("proposal_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_proposal_shared"("proposal_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_proposal_shared"("proposal_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."jsonb_diff_val"("val1" "jsonb", "val2" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_followers_when_proposal_signed"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_followers_when_proposal_signed"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_followers_when_proposal_signed"() TO "service_role";



GRANT ALL ON FUNCTION "public"."organization_integrations_encrypt_secret_secret_key"() TO "anon";
GRANT ALL ON FUNCTION "public"."organization_integrations_encrypt_secret_secret_key"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."organization_integrations_encrypt_secret_secret_key"() TO "service_role";



GRANT ALL ON FUNCTION "public"."phase_loop"() TO "anon";
GRANT ALL ON FUNCTION "public"."phase_loop"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."phase_loop"() TO "service_role";



GRANT ALL ON FUNCTION "public"."read_secret"("secret_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."read_secret"("secret_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."read_secret"("secret_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_slug_from_name"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_slug_from_name"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_slug_from_name"() TO "service_role";



GRANT ALL ON FUNCTION "public"."slugify"("value" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."slugify"("value" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."slugify"("value" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "service_role";
GRANT ALL ON FUNCTION "public"."unaccent"("text") TO "postgres";



GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."unaccent"("regdictionary", "text") TO "postgres";



GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "service_role";
GRANT ALL ON FUNCTION "public"."unaccent_init"("internal") TO "postgres";



GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "service_role";
GRANT ALL ON FUNCTION "public"."unaccent_lexize"("internal", "internal", "internal", "internal") TO "postgres";



GRANT ALL ON FUNCTION "public"."update_bundle_price"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_bundle_price"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_bundle_price"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric, "quantity" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric, "quantity" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_manage_product"("o_prod_id" integer, "price" numeric, "cost" numeric, "quantity" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_phase_total_hours"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_phase_total_hours"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_phase_total_hours"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_proposal_labor_hours"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_proposal_labor_hours"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_proposal_labor_hours"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_proposal_product_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_proposal_product_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_proposal_product_total"() TO "service_role";



GRANT ALL ON FUNCTION "reporting"."refresh_reporting_views"() TO "anon";
GRANT ALL ON FUNCTION "reporting"."refresh_reporting_views"() TO "authenticated";
GRANT ALL ON FUNCTION "reporting"."refresh_reporting_views"() TO "service_role";



GRANT ALL ON FUNCTION "reporting"."search_number"("phone_number" "text") TO "anon";
GRANT ALL ON FUNCTION "reporting"."search_number"("phone_number" "text") TO "authenticated";
GRANT ALL ON FUNCTION "reporting"."search_number"("phone_number" "text") TO "service_role";



GRANT ALL ON FUNCTION "taskrouter"."completethetask"() TO "anon";
GRANT ALL ON FUNCTION "taskrouter"."completethetask"() TO "authenticated";
GRANT ALL ON FUNCTION "taskrouter"."completethetask"() TO "service_role";







































GRANT ALL ON TABLE "public"."phases" TO "anon";
GRANT ALL ON TABLE "public"."phases" TO "authenticated";
GRANT ALL ON TABLE "public"."phases" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."proposals" TO "anon";
GRANT ALL ON TABLE "public"."proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."proposals" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."calculate_totals" TO "anon";
GRANT ALL ON TABLE "public"."calculate_totals" TO "authenticated";
GRANT ALL ON TABLE "public"."calculate_totals" TO "service_role";



GRANT ALL ON TABLE "public"."integrations" TO "anon";
GRANT ALL ON TABLE "public"."integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."integrations" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."organization_integrations" TO "anon";
GRANT ALL ON TABLE "public"."organization_integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_integrations" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."pinned_items" TO "anon";
GRANT ALL ON TABLE "public"."pinned_items" TO "authenticated";
GRANT ALL ON TABLE "public"."pinned_items" TO "service_role";



GRANT ALL ON TABLE "public"."profile_keys" TO "anon";
GRANT ALL ON TABLE "public"."profile_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."profile_keys" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_followers" TO "anon";
GRANT ALL ON TABLE "public"."proposal_followers" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_followers" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_settings" TO "anon";
GRANT ALL ON TABLE "public"."proposal_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_settings" TO "service_role";



GRANT ALL ON TABLE "public"."versions" TO "anon";
GRANT ALL ON TABLE "public"."versions" TO "authenticated";
GRANT ALL ON TABLE "public"."versions" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_totals" TO "anon";
GRANT ALL ON TABLE "public"."proposal_totals" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_totals" TO "service_role";



GRANT ALL ON TABLE "public"."sections" TO "anon";
GRANT ALL ON TABLE "public"."sections" TO "authenticated";
GRANT ALL ON TABLE "public"."sections" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "reporting"."conversations" TO "authenticated";
GRANT ALL ON TABLE "reporting"."conversations" TO "anon";
GRANT ALL ON TABLE "reporting"."conversations" TO "service_role";
GRANT ALL ON TABLE "reporting"."conversations" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."abandoned_conversations_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."abandoned_conversations_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."abandoned_conversations_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."abandoned_conversations_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."engagements" TO "anon";
GRANT ALL ON TABLE "reporting"."engagements" TO "authenticated";
GRANT ALL ON TABLE "reporting"."engagements" TO "service_role";



GRANT ALL ON TABLE "reporting"."call_summary_by_period" TO "anon";
GRANT ALL ON TABLE "reporting"."call_summary_by_period" TO "authenticated";
GRANT ALL ON TABLE "reporting"."call_summary_by_period" TO "service_role";



GRANT ALL ON TABLE "reporting"."calls_by_agent" TO "authenticated";
GRANT ALL ON TABLE "reporting"."calls_by_agent" TO "anon";
GRANT ALL ON TABLE "reporting"."calls_by_agent" TO "service_role";
GRANT ALL ON TABLE "reporting"."calls_by_agent" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."calls_by_agent_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."calls_by_agent_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."calls_by_agent_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."calls_by_agent_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."calls_summary_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."calls_summary_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."calls_summary_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."calls_summary_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."conversations_by_agent_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."conversations_by_agent_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."conversations_by_agent_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."conversations_by_agent_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."conversations_summary_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."conversations_summary_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."conversations_summary_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."conversations_summary_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."engagement_reservations" TO "anon";
GRANT ALL ON TABLE "reporting"."engagement_reservations" TO "authenticated";
GRANT ALL ON TABLE "reporting"."engagement_reservations" TO "service_role";



GRANT ALL ON TABLE "reporting"."handle_time_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."handle_time_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."handle_time_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."handle_time_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."handle_time_by_day_test" TO "anon";
GRANT ALL ON TABLE "reporting"."handle_time_by_day_test" TO "authenticated";
GRANT ALL ON TABLE "reporting"."handle_time_by_day_test" TO "service_role";
GRANT ALL ON TABLE "reporting"."handle_time_by_day_test" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."voicemails_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."voicemails_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."voicemails_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."voicemails_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."voicemails_by_month" TO "authenticated";
GRANT ALL ON TABLE "reporting"."voicemails_by_month" TO "anon";
GRANT ALL ON TABLE "reporting"."voicemails_by_month" TO "service_role";
GRANT ALL ON TABLE "reporting"."voicemails_by_month" TO "supabase_admin";



GRANT ALL ON TABLE "reporting"."voicemails_left_by_day" TO "anon";
GRANT ALL ON TABLE "reporting"."voicemails_left_by_day" TO "authenticated";
GRANT ALL ON TABLE "reporting"."voicemails_left_by_day" TO "service_role";
GRANT ALL ON TABLE "reporting"."voicemails_left_by_day" TO "supabase_admin";



GRANT ALL ON TABLE "system"."microsoft_graph_subscriptions" TO "anon";
GRANT ALL ON TABLE "system"."microsoft_graph_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "system"."microsoft_graph_subscriptions" TO "service_role";



GRANT ALL ON TABLE "taskrouter"."blacklisted_phone_numbers" TO "anon";
GRANT ALL ON TABLE "taskrouter"."blacklisted_phone_numbers" TO "authenticated";
GRANT ALL ON TABLE "taskrouter"."blacklisted_phone_numbers" TO "service_role";



GRANT ALL ON TABLE "taskrouter"."tasks" TO "authenticated";
GRANT ALL ON TABLE "taskrouter"."tasks" TO "anon";
GRANT ALL ON TABLE "taskrouter"."tasks" TO "service_role";



GRANT SELECT,INSERT,UPDATE ON TABLE "user_experience"."views" TO "authenticated";
GRANT SELECT,INSERT,UPDATE ON TABLE "user_experience"."views" TO "anon";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "reporting" GRANT ALL ON TABLES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "system" GRANT ALL ON TABLES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "taskrouter" GRANT ALL ON TABLES  TO "service_role";



























RESET ALL;
