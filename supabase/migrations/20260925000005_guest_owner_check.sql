-- Trigger kuota berjalan sebelum RLS; cek kepemilikan dulu agar pihak lain
-- tidak bisa mengunci baris undangan orang lain atau mengetahui status kuotanya.
create or replace function public.enforce_guest_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_limit int;
  v_owner uuid;
  v_count int;
begin
  select owner_id, guest_limit into v_owner, v_limit
  from public.invitations where id = new.invitation_id;

  if (select auth.uid()) is not null
     and v_owner is distinct from (select auth.uid())
     and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  -- Kunci baris undangan agar insert paralel tidak bisa melewati batas
  perform 1 from public.invitations where id = new.invitation_id for update;

  select count(*) into v_count
  from public.guests where invitation_id = new.invitation_id;

  if v_count >= v_limit then
    raise exception 'GUEST_LIMIT_REACHED'
      using hint = format('Kuota paket Anda %s tamu sudah penuh.', v_limit);
  end if;

  new.name := btrim(new.name);
  return new;
end;
$$;
