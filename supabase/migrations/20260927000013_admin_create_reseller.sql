-- Admin bisa menambahkan reseller langsung (tanpa formulir pendaftaran).
-- Data rekening boleh kosong dulu; reseller melengkapinya sendiri sebelum mencairkan saldo.

alter table public.resellers
  alter column bank_name drop not null,
  alter column bank_account_number drop not null,
  alter column bank_account_holder drop not null;

create or replace function public.request_payout(p_amount int)
returns public.payouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reseller public.resellers;
  v_balance int;
  v_min int;
  v_row public.payouts;
begin
  -- Kunci baris reseller agar dua permintaan bersamaan tidak melebihi saldo
  select * into v_reseller from public.resellers where id = v_uid for update;
  if v_reseller.id is null or v_reseller.status <> 'active' then raise exception 'RESELLER_INACTIVE'; end if;
  if v_reseller.bank_name is null or v_reseller.bank_account_number is null or v_reseller.bank_account_holder is null then
    raise exception 'BANK_MISSING' using hint = 'Lengkapi data rekening di dashboard reseller terlebih dahulu.';
  end if;

  select min_payout into v_min from public.app_settings;
  v_balance := public.reseller_balance(v_uid);
  if p_amount is null or p_amount < v_min then
    raise exception 'BELOW_MINIMUM' using hint = format('Minimal pencairan Rp%s.', v_min);
  end if;
  if p_amount > v_balance then
    raise exception 'INSUFFICIENT_BALANCE' using hint = format('Saldo tersedia Rp%s.', v_balance);
  end if;

  insert into public.payouts (reseller_id, amount, bank_name, bank_account_number, bank_account_holder, scheduled_for)
  values (v_uid, p_amount, v_reseller.bank_name, v_reseller.bank_account_number, v_reseller.bank_account_holder,
          public.next_payout_date())
  returning * into v_row;

  insert into public.ledger_entries (account, reseller_id, payout_id, kind, amount, description)
  values ('reseller', v_uid, v_row.id, 'payout_hold', -p_amount, 'Pengajuan pencairan · jadwal ' || v_row.scheduled_for);
  return v_row;
end;
$$;
revoke execute on function public.request_payout(int) from public, anon;
grant execute on function public.request_payout(int) to authenticated;

create or replace function public.admin_create_reseller(
  p_user uuid, p_business_name text, p_whatsapp text, p_code text default null,
  p_bank_name text default null, p_account_number text default null, p_account_holder text default null,
  p_commission_rate numeric default null, p_note text default null
)
returns public.resellers
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.resellers;
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_row public.resellers;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if not exists (select 1 from public.profiles where id = p_user) then raise exception 'USER_NOT_FOUND'; end if;

  select * into v_existing from public.resellers where id = p_user;
  if v_existing.id is not null and v_existing.status <> 'rejected' then raise exception 'ALREADY_RESELLER'; end if;

  if v_code = '' then
    v_code := upper(left(regexp_replace(p_business_name, '[^A-Za-z0-9]', '', 'g'), 6));
    if length(v_code) < 4 then v_code := rpad(v_code, 4, 'X'); end if;
    while exists (select 1 from public.resellers where code = v_code and id <> p_user) loop
      v_code := left(v_code, 6) || lpad((floor(random() * 1000))::int::text, 3, '0');
    end loop;
  elsif exists (select 1 from public.resellers where code = v_code and id <> p_user) then
    raise exception 'CODE_TAKEN';
  end if;

  insert into public.resellers (id, code, business_name, whatsapp, bank_name, bank_account_number, bank_account_holder,
                                commission_rate, status, admin_note, approved_at)
  values (p_user, v_code, btrim(p_business_name), p_whatsapp, nullif(btrim(p_bank_name), ''), nullif(p_account_number, ''),
          nullif(btrim(p_account_holder), ''), p_commission_rate, 'active', nullif(btrim(p_note), ''), now())
  on conflict (id) do update set
    code = excluded.code, business_name = excluded.business_name, whatsapp = excluded.whatsapp,
    bank_name = excluded.bank_name, bank_account_number = excluded.bank_account_number,
    bank_account_holder = excluded.bank_account_holder, commission_rate = excluded.commission_rate,
    status = 'active', admin_note = excluded.admin_note, approved_at = now()
  returning * into v_row;
  return v_row;
end;
$$;
revoke execute on function public.admin_create_reseller(uuid, text, text, text, text, text, text, numeric, text) from public, anon;
grant execute on function public.admin_create_reseller(uuid, text, text, text, text, text, text, numeric, text) to authenticated;
