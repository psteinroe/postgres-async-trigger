create schema async_trigger;
grant usage on schema async_trigger to service_role;
grant all on all tables in schema async_trigger to service_role;
grant all on all routines in schema async_trigger to service_role;
grant all on all sequences in schema async_trigger to service_role;
alter default privileges for role postgres in schema async_trigger grant all on tables to service_role;
alter default privileges for role postgres in schema async_trigger grant all on routines to service_role;
alter default privileges for role postgres in schema async_trigger grant all on sequences to service_role;

create type async_trigger.operation_type as enum (
    'INSERT',
    'UPDATE',
    'DELETE'
);

create table if not exists async_trigger.subscription (
  id uuid not null default gen_random_uuid() primary key,
  app_name text not null,
  name text not null,
  operation async_trigger.operation_type not null,
  schema_name text not null,
  table_name text not null,
  when_clause text,
  column_names text[],
  destination text not null,
  unique (name, operation, schema_name, table_name, app_name)
);

create or replace function async_trigger.sync_trigger()
  returns trigger as
$$
declare
    v_app_name text := coalesce(new.app_name, old.app_name);
    v_table_name text := coalesce(new.table_name, old.table_name);
    v_schema_name text := coalesce(new.schema_name, old.schema_name);

    v_when_clause text;

    v_is_test_app boolean := v_app_name ilike 'test%';

    v_if_blocks text;

    v_test_postfix text := (case when v_is_test_app then '_' || v_app_name else '' end);

    v_op async_trigger.operation_type;
begin
    foreach v_op in array array['INSERT', 'UPDATE', 'DELETE']::async_trigger.operation_type[] loop
        execute format(
            $sql$drop trigger if exists async_trigger_after_%s%s on %I.%I;$sql$,
            lower(v_op::text), v_test_postfix, v_schema_name, v_table_name
        );

        execute format(
            $sql$drop function if exists async_trigger._publish_events_after_%s_on_%s%s;$sql$,
            lower(v_op::text), v_table_name, v_test_postfix
        );

        if exists (select 1 from async_trigger.subscription where table_name = v_table_name and schema_name = v_schema_name and operation = v_op and (v_is_test_app is false or app_name = v_app_name)) then
            -- if there is at least one subscription for v_op operation without a when_clause or with an empty one, we do not add the when clause at all
            v_when_clause := (
                case when exists (
                    select 1
                    from async_trigger.subscription
                    where table_name = v_table_name and schema_name = v_schema_name and operation = v_op and (when_clause is null or when_clause = '') and (v_is_test_app is false or app_name = v_app_name)
                ) then null
                else (
                    select string_agg(when_clause, ') or (')
                    from async_trigger.subscription
                    where table_name = v_table_name and schema_name = v_schema_name and operation = v_op and when_clause is not null and when_clause != '' and (v_is_test_app is false or app_name = v_app_name)
                )
                end
            );

            v_if_blocks := (
                select string_agg(format(
                    $sql$
                    v_begin_subscription := clock_timestamp();
                    if %s then
                        v_jsonb_output := v_jsonb_output || (jsonb_build_object(
                            '__destination', %L,
                            '__duration', extract(microseconds FROM clock_timestamp() - v_begin_subscription),
                            'tg_name', %L,
                            'new', case when tg_op is distinct from 'DELETE' then jsonb_build_object(
                                %s
                            ) else null end,
                            'old', case when tg_op is distinct from 'INSERT' then jsonb_build_object(
                                %s
                            ) else null end
                        ) || v_base_payload);
                    end if;
                    $sql$,
                    coalesce(nullif(subscription.when_clause, ''), 'true'),
                    subscription.destination,
                    subscription.name,
                    (select string_agg(format($s$%L, new.%I$s$, column_name, column_name), ', ') from unnest(subscription.column_names) as column_name),
                    (select string_agg(format($s$%L, old.%I$s$, column_name, column_name), ', ') from unnest(subscription.column_names) as column_name)
                ), e'\n') from async_trigger.subscription where table_name = v_table_name and schema_name = v_schema_name and operation = v_op and (v_is_test_app is false or app_name = v_app_name)
            );

            execute format(
                $sql$
                create or replace function async_trigger._publish_events_after_%s_on_%s ()
                    returns trigger
                    as $inner$
                declare
                    v_jsonb_output jsonb := '[]'::jsonb;

                    v_test_app_name text := tg_argv[0];

                    v_base_payload jsonb := jsonb_build_object(
                        'tg_op', tg_op,
                        'tg_table_name', tg_table_name,
                        'tg_table_schema', tg_table_schema,
                        'auth', jsonb_build_object(
                            'role', auth.role(),
                            'user_id', auth.uid()
                        ),
                        'timestamp', (extract(epoch from now()) * 1000)::bigint
                    );
                begin
                    %s

                    if jsonb_array_length(v_jsonb_output) > 0 then
                        perform private.add_graphile_worker_job(
                            'publish_events' || (case when v_test_app_name is not null then '_' || v_test_app_name else '' end),
                            v_jsonb_output::json,
                            priority := 'high'::private.graphile_worker_priority
                        );
                    end if;

                    if tg_op = 'DELETE' then
                        return old;
                    end if;

                    return new;
                end
                $inner$
                language plpgsql
                security definer;
                $sql$,
                lower(v_op::text),
                case when v_is_test_app is true then v_table_name || '_' || v_app_name else v_table_name end,
                v_if_blocks
            );

            execute format(
                $sql$
                    create trigger async_trigger_after_%s%s
                    after %s on %I.%I
                    for each row
                    %s
                    execute procedure async_trigger._publish_events_after_%s_on_%s%s(%s)
                $sql$,
                lower(v_op::text),
                v_test_postfix,
                lower(v_op::text),
                v_schema_name,
                v_table_name,
                case when v_when_clause is not null and length(v_when_clause) > 0
                     then 'when ((' || v_when_clause || '))'
                     else ''
                end,
                lower(v_op::text),
                v_table_name,
                v_test_postfix,
                case when v_is_test_app is true then v_app_name else null end
            );
        end if;
    end loop;

    return new;
end
$$ language plpgsql security definer;

create or replace function public.set_subscriptions(
    app text,
    subscriptions async_trigger.subscription[]
)
returns void as $$
begin
    -- Use a temporary table to stage incoming subscriptions
    create temporary table temp_subscriptions as
    select *
    from unnest(subscriptions) as subscription;

    -- MERGE to handle inserts, updates, and deletes efficiently
    merge into async_trigger.subscription as target
    using temp_subscriptions as source
    on (
        target.name = source.name
        and target.operation = source.operation
        and target.schema_name = source.schema_name
        and target.table_name = source.table_name
        and target.app_name = app
    )
    when matched and (
        target.when_clause is distinct from source.when_clause or
        target.column_names is distinct from source.column_names or
        target.destination is distinct from source.destination
    ) then
        update set
            when_clause = source.when_clause,
            column_names = source.column_names,
            destination = source.destination
    when not matched then
        insert (name, operation, schema_name, table_name, when_clause, column_names, destination, app_name)
        values (source.name, source.operation, source.schema_name, source.table_name, source.when_clause, source.column_names, source.destination, app);

    -- Remove rows not present in the input
    delete from async_trigger.subscription
    where app_name = app
      and not exists (
          select 1
          from temp_subscriptions
          where async_trigger.subscription.name = temp_subscriptions.name
            and async_trigger.subscription.operation = temp_subscriptions.operation
            and async_trigger.subscription.schema_name = temp_subscriptions.schema_name
            and async_trigger.subscription.table_name = temp_subscriptions.table_name
      );

    -- Drop the temporary table
    drop table temp_subscriptions;
end
$$ language plpgsql volatile set search_path = '' security definer;

revoke execute on function set_subscriptions from public;
revoke execute on function set_subscriptions from authenticated;
grant execute on function set_subscriptions to service_role;



