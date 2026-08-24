-- =====================================================================
-- RLS verification — Stage 1 self-check
--
-- Paste into the Supabase SQL editor and run AFTER the migration.
-- Everything happens inside a transaction that ends in ROLLBACK, so it
-- writes nothing permanent and leaves no helper function behind.
--
-- Expected output: six rows, every verdict ✅ PASS.
-- =====================================================================

begin;

-- Helper lives in `public` (not pg_temp) so `anon` can reach it without
-- temp-schema privilege games. The ROLLBACK below removes it.
create function public._rls_probe(stmt text) returns text
language plpgsql
as $fn$
declare
  n integer;
begin
  execute stmt;
  get diagnostics n = row_count;
  return 'ALLOWED (' || n || ' rows)';
exception
  when others then
    return 'DENIED';
end;
$fn$;

-- Seed one row as the migration owner so the feedback FK resolves.
insert into public.prototypes (repo, branch, slug, name, path)
values ('__rls_probe__', '__rls_probe__', '__rls_probe__', 'RLS probe', '/__rls_probe__');

-- Everything below this line runs with anon's privileges.
set local role anon;

select
  check_name,
  actual,
  expected,
  case when actual like expected || '%' then '✅ PASS' else '❌ FAIL' end as verdict
from (
  values
    ('anon SELECT prototypes',
     public._rls_probe('select 1 from public.prototypes limit 1'),
     'ALLOWED'),

    ('anon SELECT feedback',
     public._rls_probe('select 1 from public.feedback limit 1'),
     'ALLOWED'),

    ('anon INSERT feedback',
     public._rls_probe($q$insert into public.feedback (prototype_id, body, author_name)
                         select id, 'probe body', 'probe author'
                         from public.prototypes where slug = '__rls_probe__'$q$),
     'ALLOWED (1 rows)'),

    ('anon INSERT prototypes  (must be denied)',
     public._rls_probe($q$insert into public.prototypes (repo, branch, slug, name, path)
                         values ('__x__', '__x__', '__x__', 'nope', '/nope')$q$),
     'DENIED'),

    ('anon UPDATE prototypes  (must be denied)',
     public._rls_probe($q$update public.prototypes set name = 'hacked'$q$),
     'DENIED'),

    ('anon DELETE prototypes  (must be denied)',
     public._rls_probe($q$delete from public.prototypes$q$),
     'DENIED')
) as t(check_name, actual, expected);

reset role;
rollback;
