-- ============================================================
-- DeepSun Studio
-- Bootstrap inicial del portal
--
-- Requisitos:
--   - Ambos usuarios ya deben existir en Supabase Auth.
--   - Joshua será el primer platform admin.
--   - Dereck Test será investor.
--
-- IMPORTANTE:
-- Se desactiva temporalmente SOLO el trigger encargado de
-- proteger cambios de roles durante el bootstrap inicial.
-- Se reactiva dentro de la misma transacción.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Permitir bootstrap del primer administrador
-- ------------------------------------------------------------

alter table public.profiles
disable trigger protect_profile_role_trigger;

do $$
declare
  v_admin_email text := 'joshuanavarro933@gmail.com';
  v_investor_email text := 'dereck.test@example.com';

  v_admin_id uuid;
  v_investor_id uuid;
  v_agreement_id uuid;

begin

  -- ----------------------------------------------------------
  -- 2. Resolver usuarios desde Supabase Auth
  -- ----------------------------------------------------------

  select id
  into v_admin_id
  from auth.users
  where lower(email) = lower(v_admin_email)
  limit 1;


  select id
  into v_investor_id
  from auth.users
  where lower(email) = lower(v_investor_email)
  limit 1;


  -- ----------------------------------------------------------
  -- 3. Validaciones
  -- ----------------------------------------------------------

  if v_admin_id is null then
    raise exception
      'No existe el usuario administrador en Supabase Auth: %',
      v_admin_email;
  end if;


  if v_investor_id is null then
    raise exception
      'No existe el usuario inversionista en Supabase Auth: %',
      v_investor_email;
  end if;


  -- ----------------------------------------------------------
  -- 4. Perfil Joshua
  -- ----------------------------------------------------------

  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    v_admin_id,
    'Joshua David Navarro Rad',
    'admin'
  )

  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = 'admin';


  -- ----------------------------------------------------------
  -- 5. Perfil Dereck Test
  -- ----------------------------------------------------------

  insert into public.profiles (
    id,
    full_name,
    role
  )
  values (
    v_investor_id,
    'Dereck Daniel Gamez Deluque',
    'investor'
  )

  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = 'investor';


  -- ----------------------------------------------------------
  -- 6. Buscar acuerdo existente
  -- ----------------------------------------------------------

  select id
  into v_agreement_id
  from public.agreements
  where name = 'Participación económica privada DeepSun'
  limit 1;


  -- ----------------------------------------------------------
  -- 7. Crear acuerdo si todavía no existe
  -- ----------------------------------------------------------

  if v_agreement_id is null then

    insert into public.agreements (
      name,
      status,
      initial_contribution,
      participation_percentage,
      contractual_cap,
      start_date,
      currency,
      description
    )

    values (
      'Participación económica privada DeepSun',
      'active',
      1000000,
      20,
      3000000,
      date '2026-09-11',
      'COP',
      'Acuerdo privado de participación sobre ganancia neta efectivamente recibida.'
    )

    returning id into v_agreement_id;

  end if;


  -- ----------------------------------------------------------
  -- 8. Joshua como admin del acuerdo
  -- ----------------------------------------------------------

  insert into public.agreement_members (
    agreement_id,
    user_id,
    role
  )

  values (
    v_agreement_id,
    v_admin_id,
    'admin'
  )

  on conflict (agreement_id, user_id) do update
  set role = excluded.role;


  -- ----------------------------------------------------------
  -- 9. Dereck Test como investor del acuerdo
  -- ----------------------------------------------------------

  insert into public.agreement_members (
    agreement_id,
    user_id,
    role
  )

  values (
    v_agreement_id,
    v_investor_id,
    'investor'
  )

  on conflict (agreement_id, user_id) do update
  set role = excluded.role;


  -- ----------------------------------------------------------
  -- 10. Resultado
  -- ----------------------------------------------------------

  raise notice '========================================';
  raise notice 'DeepSun bootstrap completado';
  raise notice '========================================';

  raise notice 'Admin: %', v_admin_email;
  raise notice 'Admin UUID: %', v_admin_id;

  raise notice 'Investor: %', v_investor_email;
  raise notice 'Investor UUID: %', v_investor_id;

  raise notice 'Agreement UUID: %', v_agreement_id;

  raise notice '========================================';

end $$;


-- ------------------------------------------------------------
-- 11. Reactivar protección de roles
-- ------------------------------------------------------------

alter table public.profiles
enable trigger protect_profile_role_trigger;

commit;