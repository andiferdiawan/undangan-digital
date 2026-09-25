-- =====================================================================
--  Program reseller, pembayaran online (Tripay), buku besar saldo, pencairan
-- =====================================================================
--  Prinsip:
--  * Semua uang dalam rupiah (integer).
--  * Buku besar (ledger_entries) hanya bisa ditambah; saldo = SUM(amount).
--  * Tarif bagi hasil di-snapshot di pesanan saat dibuat.
--  * Perubahan status pembayaran hanya lewat fungsi server_* yang
--    dilindungi secret server (hash disimpan di schema private).
-- =====================================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.secrets (
  name text primary key,
  value_hash bytea not null
);

create or replace function private.assert_server(p_secret text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_secret is null or not exists (
    select 1 from private.secrets
    where name = 'server_rpc' and value_hash = extensions.digest(p_secret, 'sha256')
  ) then
    raise exception 'FORBIDDEN';
  end if;
end;
$$;

-- ---------- Pengaturan global ----------
create table public.app_settings (
  id boolean primary key default true check (id),
  default_reseller_rate numeric(5,2) not null default 30 check (default_reseller_rate between 0 and 90),
  payout_days smallint[] not null default '{5,25}'
    check (cardinality(payout_days) between 1 and 8 and payout_days <@ array[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]::smallint[]),
  min_payout int not null default 50000 check (min_payout >= 10000),
  order_expiry_hours int not null default 24 check (order_expiry_hours between 1 and 72),
  updated_at timestamptz not null default now()
);
insert into public.app_settings default values on conflict do nothing;

alter table public.app_settings enable row level security;
create policy "pengaturan: publik baca" on public.app_settings
  for select to anon, authenticated using (true);
create policy "pengaturan: admin ubah" on public.app_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create trigger app_settings_touch before update on public.app_settings
  for each row execute function public.touch_updated_at();

-- ---------- Reseller ----------
create table public.resellers (
  id uuid primary key references public.profiles (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{4,12}$'),
  business_name text not null check (char_length(btrim(business_name)) between 2 and 60),
  whatsapp text not null check (whatsapp ~ '^62[0-9]{8,14}$'),
  bank_name text not null check (char_length(btrim(bank_name)) between 2 and 40),
  bank_account_number text not null check (bank_account_number ~ '^[0-9]{5,20}$'),
  bank_account_holder text not null check (char_length(btrim(bank_account_holder)) between 2 and 60),
  commission_rate numeric(5,2) check (commission_rate between 0 and 90),
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended', 'rejected')),
  admin_note text,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  updated_at timestamptz not null default now()
);
create trigger resellers_touch before update on public.resellers
  for each row execute function public.touch_updated_at();

alter table public.resellers enable row level security;
create policy "reseller: pemilik atau admin baca" on public.resellers
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "reseller: pemilik ubah" on public.resellers
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.resellers from authenticated;
grant update (business_name, whatsapp, bank_name, bank_account_number, bank_account_holder)
  on public.resellers to authenticated;

-- ---------- Pesanan ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  merchant_ref text not null unique,
  access_key text not null default encode(extensions.gen_random_bytes(16), 'hex'),
  theme_id uuid not null references public.themes (id),
  package_id smallint not null references public.packages (id),
  channel text not null check (channel in ('platform', 'reseller')),
  reseller_id uuid references public.resellers (id) on delete set null,
  created_by uuid references auth.users (id) on delete set null,
  customer_name text not null check (char_length(btrim(customer_name)) between 2 and 80),
  customer_email text not null check (customer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  customer_phone text not null check (customer_phone ~ '^62[0-9]{8,14}$'),
  amount int not null check (amount > 0),
  guest_limit int not null check (guest_limit > 0),
  commission_rate numeric(5,2) not null default 0,
  reseller_share int not null default 0 check (reseller_share >= 0),
  platform_share int not null default 0 check (platform_share >= 0),
  payment_method text,
  payment_name text,
  payment_reference text unique,
  checkout_url text,
  pay_code text,
  qr_url text,
  instructions jsonb,
  fee_customer int not null default 0,
  fee_merchant int not null default 0,
  total_amount int,
  status text not null default 'pending' check (status in ('pending', 'unpaid', 'paid', 'expired', 'failed', 'refunded')),
  expires_at timestamptz,
  paid_at timestamptz,
  token_id uuid unique references public.access_tokens (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (reseller_share + platform_share = amount),
  check ((channel = 'reseller') = (reseller_id is not null) or reseller_id is null)
);
create index orders_reseller_idx on public.orders (reseller_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_theme_idx on public.orders (theme_id);
create index orders_package_idx on public.orders (package_id);
create index orders_created_by_idx on public.orders (created_by);
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;
create policy "pesanan: reseller pemilik atau admin baca" on public.orders
  for select to authenticated
  using (reseller_id = (select auth.uid()) or (select public.is_admin()));

-- ---------- Token: kanal penjualan ----------
alter table public.access_tokens
  add column channel text not null default 'manual' check (channel in ('manual', 'platform', 'reseller')),
  add column reseller_id uuid references public.resellers (id) on delete set null,
  add column order_id uuid unique references public.orders (id) on delete set null;
create index access_tokens_reseller_idx on public.access_tokens (reseller_id);

create policy "token: reseller lihat penjualannya" on public.access_tokens
  for select to authenticated
  using (reseller_id = (select auth.uid()));

-- ---------- Pencairan ----------
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references public.resellers (id) on delete restrict,
  amount int not null check (amount > 0),
  bank_name text not null,
  bank_account_number text not null,
  bank_account_holder text not null,
  status text not null default 'requested' check (status in ('requested', 'paid', 'rejected', 'cancelled')),
  scheduled_for date not null,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users (id) on delete set null,
  transfer_reference text,
  admin_note text
);
create index payouts_reseller_idx on public.payouts (reseller_id, requested_at desc);
create index payouts_schedule_idx on public.payouts (status, scheduled_for);
create index payouts_processed_by_idx on public.payouts (processed_by);

alter table public.payouts enable row level security;
create policy "pencairan: pemilik atau admin baca" on public.payouts
  for select to authenticated
  using (reseller_id = (select auth.uid()) or (select public.is_admin()));

-- ---------- Buku besar (append-only) ----------
create table public.ledger_entries (
  id bigint generated always as identity primary key,
  account text not null check (account in ('platform', 'reseller')),
  reseller_id uuid references public.resellers (id) on delete restrict,
  order_id uuid references public.orders (id) on delete restrict,
  payout_id uuid references public.payouts (id) on delete restrict,
  kind text not null check (kind in ('sale', 'refund', 'payout_hold', 'payout_release', 'adjustment')),
  amount int not null check (amount <> 0),
  description text,
  created_at timestamptz not null default now(),
  check ((account = 'reseller') = (reseller_id is not null))
);
create unique index ledger_once_per_order on public.ledger_entries (order_id, account, kind)
  where kind in ('sale', 'refund');
create unique index ledger_once_per_payout on public.ledger_entries (payout_id, kind)
  where kind in ('payout_hold', 'payout_release');
create index ledger_reseller_idx on public.ledger_entries (reseller_id, created_at desc);

alter table public.ledger_entries enable row level security;
create policy "ledger: pemilik atau admin baca" on public.ledger_entries
  for select to authenticated
  using (reseller_id = (select auth.uid()) or (select public.is_admin()));
revoke insert, update, delete, truncate on public.ledger_entries from anon, authenticated;

-- =====================================================================
--  Fungsi
-- =====================================================================

create or replace function public.next_payout_date(p_from date default (now() at time zone 'Asia/Jakarta')::date)
returns date
language sql
stable
set search_path = ''
as $$
  select min(d)::date
  from (
    select make_date(extract(year from m)::int, extract(month from m)::int, day::int) as d
    from generate_series(date_trunc('month', p_from), date_trunc('month', p_from) + interval '2 months', interval '1 month') as m,
         unnest((select payout_days from public.app_settings)) as day
  ) x
  where d > p_from;
$$;

create or replace function public.reseller_balance(p_reseller uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(amount), 0)::int from public.ledger_entries
  where account = 'reseller' and reseller_id = p_reseller;
$$;
revoke execute on function public.reseller_balance(uuid) from public, anon, authenticated;

-- Pembuat token internal (dipakai admin manual & pembayaran)
create or replace function public.issue_token_internal(
  p_theme_id uuid, p_package_id smallint, p_guest_limit int, p_price int,
  p_channel text, p_reseller uuid, p_order uuid, p_note text, p_created_by uuid, p_valid_days int
)
returns public.access_tokens
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_code text;
  v_bytes bytea;
  v_row public.access_tokens;
begin
  loop
    v_bytes := extensions.gen_random_bytes(6);
    v_code := '';
    for i in 0..5 loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_bytes, i) % length(v_alphabet)) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.access_tokens where code = v_code);
  end loop;

  insert into public.access_tokens (code, theme_id, package_id, guest_limit, price, customer_note,
                                    created_by, expires_at, channel, reseller_id, order_id)
  values (v_code, p_theme_id, p_package_id, p_guest_limit, p_price, nullif(btrim(p_note), ''),
          p_created_by,
          case when p_valid_days is null or p_valid_days <= 0 then null else now() + make_interval(days => p_valid_days) end,
          p_channel, p_reseller, p_order)
  returning * into v_row;
  return v_row;
end;
$$;
revoke execute on function public.issue_token_internal(uuid, smallint, int, int, text, uuid, uuid, text, uuid, int) from public, anon, authenticated;

-- Admin manual tetap tersedia (penjualan di luar pembayaran online)
create or replace function public.admin_generate_token(
  p_theme_id uuid, p_package_id smallint, p_customer_note text default null, p_valid_days int default 30
)
returns public.access_tokens
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pkg public.packages;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into v_pkg from public.packages where id = p_package_id and is_active;
  if v_pkg.id is null then raise exception 'PACKAGE_NOT_FOUND'; end if;
  if not exists (select 1 from public.themes where id = p_theme_id and status = 'published') then
    raise exception 'THEME_NOT_PUBLISHED';
  end if;
  return public.issue_token_internal(p_theme_id, v_pkg.id, v_pkg.guest_limit, v_pkg.price, 'manual',
                                     null, null, p_customer_note, (select auth.uid()), p_valid_days);
end;
$$;

-- ---------- Reseller: pendaftaran & data publik ----------
create or replace function public.apply_reseller(
  p_business_name text, p_whatsapp text, p_bank_name text, p_account_number text, p_account_holder text,
  p_code text default null
)
returns public.resellers
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_existing public.resellers;
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_row public.resellers;
begin
  if v_uid is null then raise exception 'NOT_AUTHENTICATED'; end if;

  select * into v_existing from public.resellers where id = v_uid;
  if v_existing.id is not null and v_existing.status <> 'rejected' then
    raise exception 'ALREADY_APPLIED';
  end if;

  if v_code = '' then
    v_code := upper(left(regexp_replace(p_business_name, '[^A-Za-z0-9]', '', 'g'), 6));
    if length(v_code) < 4 then v_code := rpad(v_code, 4, 'X'); end if;
    while exists (select 1 from public.resellers where code = v_code and id <> v_uid) loop
      v_code := left(v_code, 6) || lpad((floor(random() * 1000))::int::text, 3, '0');
    end loop;
  elsif exists (select 1 from public.resellers where code = v_code and id <> v_uid) then
    raise exception 'CODE_TAKEN';
  end if;

  insert into public.resellers (id, code, business_name, whatsapp, bank_name, bank_account_number, bank_account_holder, status)
  values (v_uid, v_code, btrim(p_business_name), p_whatsapp, btrim(p_bank_name), p_account_number, btrim(p_account_holder), 'pending')
  on conflict (id) do update set
    code = excluded.code, business_name = excluded.business_name, whatsapp = excluded.whatsapp,
    bank_name = excluded.bank_name, bank_account_number = excluded.bank_account_number,
    bank_account_holder = excluded.bank_account_holder, status = 'pending', admin_note = null
  returning * into v_row;
  return v_row;
end;
$$;
revoke execute on function public.apply_reseller(text, text, text, text, text, text) from public, anon;
grant execute on function public.apply_reseller(text, text, text, text, text, text) to authenticated;

create or replace function public.get_reseller_public(p_code text)
returns table (code text, business_name text, whatsapp text)
language sql
stable
security definer
set search_path = ''
as $$
  select code, business_name, whatsapp from public.resellers
  where code = upper(btrim(p_code)) and status = 'active';
$$;
grant execute on function public.get_reseller_public(text) to anon, authenticated;

create or replace function public.admin_review_reseller(
  p_reseller uuid, p_status text, p_commission_rate numeric default null, p_use_default_rate boolean default false,
  p_note text default null
)
returns public.resellers
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.resellers;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  if p_status not in ('pending', 'active', 'suspended', 'rejected') then raise exception 'INVALID_STATUS'; end if;

  update public.resellers set
    status = p_status,
    commission_rate = case when p_use_default_rate then null else coalesce(p_commission_rate, commission_rate) end,
    admin_note = coalesce(nullif(btrim(p_note), ''), admin_note),
    approved_at = case when p_status = 'active' and approved_at is null then now() else approved_at end
  where id = p_reseller
  returning * into v_row;
  if v_row.id is null then raise exception 'NOT_FOUND'; end if;
  return v_row;
end;
$$;
revoke execute on function public.admin_review_reseller(uuid, text, numeric, boolean, text) from public, anon;
grant execute on function public.admin_review_reseller(uuid, text, numeric, boolean, text) to authenticated;

-- ---------- Pesanan (dipanggil server Nuxt dengan secret) ----------
create or replace function public.server_create_order(
  p_secret text,
  p_theme_id uuid, p_package_id smallint,
  p_customer_name text, p_customer_email text, p_customer_phone text,
  p_reseller_code text default null, p_reseller_user uuid default null, p_created_by uuid default null
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_pkg public.packages;
  v_settings public.app_settings;
  v_reseller public.resellers;
  v_rate numeric(5,2) := 0;
  v_share int := 0;
  v_ref text;
  v_row public.orders;
begin
  perform private.assert_server(p_secret);

  select * into v_pkg from public.packages where id = p_package_id and is_active;
  if v_pkg.id is null then raise exception 'PACKAGE_NOT_FOUND'; end if;
  if not exists (select 1 from public.themes where id = p_theme_id and status = 'published') then
    raise exception 'THEME_NOT_PUBLISHED';
  end if;
  select * into v_settings from public.app_settings;

  -- Reseller: dibuat langsung oleh reseller, atau lewat kode referral
  if p_reseller_user is not null then
    select * into v_reseller from public.resellers where id = p_reseller_user and status = 'active';
    if v_reseller.id is null then raise exception 'RESELLER_INACTIVE'; end if;
  elsif nullif(btrim(p_reseller_code), '') is not null then
    select * into v_reseller from public.resellers where code = upper(btrim(p_reseller_code)) and status = 'active';
  end if;

  if v_reseller.id is not null then
    v_rate := coalesce(v_reseller.commission_rate, v_settings.default_reseller_rate);
    v_share := floor(v_pkg.price * v_rate / 100)::int;
  end if;

  loop
    v_ref := 'UDG-' || to_char(now() at time zone 'Asia/Jakarta', 'YYMMDD') || '-'
             || upper(encode(extensions.gen_random_bytes(4), 'hex'));
    exit when not exists (select 1 from public.orders where merchant_ref = v_ref);
  end loop;

  insert into public.orders (merchant_ref, theme_id, package_id, channel, reseller_id, created_by,
                             customer_name, customer_email, customer_phone, amount, guest_limit,
                             commission_rate, reseller_share, platform_share, expires_at)
  values (v_ref, p_theme_id, v_pkg.id,
          case when v_reseller.id is null then 'platform' else 'reseller' end,
          v_reseller.id, p_created_by,
          btrim(p_customer_name), lower(btrim(p_customer_email)), p_customer_phone,
          v_pkg.price, v_pkg.guest_limit, v_rate, v_share, v_pkg.price - v_share,
          now() + make_interval(hours => v_settings.order_expiry_hours))
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.server_attach_payment(
  p_secret text, p_order_id uuid,
  p_method text, p_name text, p_reference text, p_checkout_url text, p_pay_code text, p_qr_url text,
  p_instructions jsonb, p_fee_customer int, p_fee_merchant int, p_total_amount int, p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_server(p_secret);
  update public.orders set
    payment_method = p_method, payment_name = p_name, payment_reference = p_reference,
    checkout_url = p_checkout_url, pay_code = p_pay_code, qr_url = p_qr_url, instructions = p_instructions,
    fee_customer = coalesce(p_fee_customer, 0), fee_merchant = coalesce(p_fee_merchant, 0),
    total_amount = p_total_amount, expires_at = coalesce(p_expires_at, expires_at), status = 'unpaid'
  where id = p_order_id and status = 'pending';
  if not found then raise exception 'ORDER_NOT_PENDING'; end if;
end;
$$;

create or replace function public.server_fail_order(p_secret text, p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.assert_server(p_secret);
  update public.orders set status = 'failed' where id = p_order_id and status = 'pending';
end;
$$;

-- Idempotent: aman dipanggil berkali-kali untuk callback/sinkronisasi yang sama
create or replace function public.server_process_payment(
  p_secret text, p_merchant_ref text, p_reference text, p_status text, p_total_amount int, p_paid_at timestamptz
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
  v_token public.access_tokens;
  v_status text := upper(p_status);
begin
  perform private.assert_server(p_secret);

  select * into v_order from public.orders where merchant_ref = p_merchant_ref for update;
  if v_order.id is null then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.payment_reference is distinct from p_reference then raise exception 'REFERENCE_MISMATCH'; end if;

  if v_status in ('PAID', 'SETTLED') then
    if v_order.status = 'paid' then return v_order; end if;
    if v_order.status = 'refunded' then raise exception 'ORDER_REFUNDED'; end if;
    if v_order.total_amount is not null and p_total_amount is distinct from v_order.total_amount then
      raise exception 'AMOUNT_MISMATCH';
    end if;

    v_token := public.issue_token_internal(
      v_order.theme_id, v_order.package_id, v_order.guest_limit, v_order.amount,
      v_order.channel, v_order.reseller_id, v_order.id,
      v_order.customer_name || ' · ' || v_order.customer_phone, v_order.created_by, 90);

    update public.orders set status = 'paid', paid_at = coalesce(p_paid_at, now()), token_id = v_token.id
    where id = v_order.id
    returning * into v_order;

    insert into public.ledger_entries (account, order_id, kind, amount, description)
    values ('platform', v_order.id, 'sale', v_order.platform_share, 'Penjualan ' || v_order.merchant_ref);
    if v_order.reseller_id is not null and v_order.reseller_share > 0 then
      insert into public.ledger_entries (account, reseller_id, order_id, kind, amount, description)
      values ('reseller', v_order.reseller_id, v_order.id, 'sale', v_order.reseller_share,
              'Komisi ' || v_order.commission_rate || '% · ' || v_order.merchant_ref);
    end if;

  elsif v_status = 'REFUND' then
    if v_order.status = 'paid' then
      update public.orders set status = 'refunded' where id = v_order.id returning * into v_order;
      insert into public.ledger_entries (account, order_id, kind, amount, description)
      values ('platform', v_order.id, 'refund', -v_order.platform_share, 'Refund ' || v_order.merchant_ref);
      if v_order.reseller_id is not null and v_order.reseller_share > 0 then
        insert into public.ledger_entries (account, reseller_id, order_id, kind, amount, description)
        values ('reseller', v_order.reseller_id, v_order.id, 'refund', -v_order.reseller_share,
                'Refund ' || v_order.merchant_ref);
      end if;
      -- Token yang belum dipakai tidak bisa diaktifkan lagi
      update public.access_tokens set expires_at = now()
      where id = v_order.token_id and redeemed_at is null;
    end if;

  elsif v_status in ('EXPIRED', 'FAILED') then
    if v_order.status in ('pending', 'unpaid') then
      update public.orders set status = lower(v_status) where id = v_order.id returning * into v_order;
    end if;
  end if;

  return v_order;
end;
$$;

do $$
declare f text;
begin
  foreach f in array array[
    'public.server_create_order(text, uuid, smallint, text, text, text, text, uuid, uuid)',
    'public.server_attach_payment(text, uuid, text, text, text, text, text, text, jsonb, int, int, int, timestamptz)',
    'public.server_fail_order(text, uuid)',
    'public.server_process_payment(text, text, text, text, int, timestamptz)'
  ] loop
    execute format('revoke execute on function %s from public', f);
    execute format('grant execute on function %s to anon, authenticated', f);
  end loop;
end $$;

-- Halaman status pesanan untuk pelanggan (butuh access_key dari link)
create or replace function public.get_order_public(p_order_id uuid, p_key text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'id', o.id, 'merchant_ref', o.merchant_ref, 'status', o.status, 'channel', o.channel,
    'customer_name', o.customer_name, 'amount', o.amount, 'fee_customer', o.fee_customer,
    'total_amount', o.total_amount, 'payment_method', o.payment_method, 'payment_name', o.payment_name,
    'checkout_url', o.checkout_url, 'pay_code', o.pay_code, 'qr_url', o.qr_url, 'instructions', o.instructions,
    'expires_at', o.expires_at, 'paid_at', o.paid_at, 'created_at', o.created_at,
    'theme', jsonb_build_object('name', t.name, 'code', t.code, 'slug', t.slug),
    'package', jsonb_build_object('name', p.name, 'guest_limit', o.guest_limit),
    'reseller', case when r.id is null then null else jsonb_build_object('business_name', r.business_name, 'whatsapp', r.whatsapp) end,
    'token', case when o.status = 'paid' then a.code end,
    'token_redeemed', a.redeemed_at is not null
  )
  from public.orders o
  join public.themes t on t.id = o.theme_id
  join public.packages p on p.id = o.package_id
  left join public.resellers r on r.id = o.reseller_id
  left join public.access_tokens a on a.id = o.token_id
  where o.id = p_order_id and o.access_key = p_key;
$$;
grant execute on function public.get_order_public(uuid, text) to anon, authenticated;

-- ---------- Pencairan saldo reseller ----------
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

create or replace function public.cancel_payout(p_payout uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.payouts;
begin
  select * into v_row from public.payouts
  where id = p_payout and reseller_id = (select auth.uid()) for update;
  if v_row.id is null then raise exception 'NOT_FOUND'; end if;
  if v_row.status <> 'requested' then raise exception 'NOT_CANCELLABLE'; end if;

  update public.payouts set status = 'cancelled', processed_at = now() where id = v_row.id;
  insert into public.ledger_entries (account, reseller_id, payout_id, kind, amount, description)
  values ('reseller', v_row.reseller_id, v_row.id, 'payout_release', v_row.amount, 'Pengajuan pencairan dibatalkan');
end;
$$;
revoke execute on function public.cancel_payout(uuid) from public, anon;
grant execute on function public.cancel_payout(uuid) to authenticated;

create or replace function public.admin_process_payout(p_payout uuid, p_action text, p_reference text default null, p_note text default null)
returns public.payouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.payouts;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into v_row from public.payouts where id = p_payout for update;
  if v_row.id is null then raise exception 'NOT_FOUND'; end if;
  if v_row.status <> 'requested' then raise exception 'ALREADY_PROCESSED'; end if;

  if p_action = 'paid' then
    if nullif(btrim(p_reference), '') is null then raise exception 'REFERENCE_REQUIRED'; end if;
    update public.payouts set status = 'paid', processed_at = now(), processed_by = (select auth.uid()),
      transfer_reference = btrim(p_reference), admin_note = nullif(btrim(p_note), '')
    where id = v_row.id returning * into v_row;
  elsif p_action = 'rejected' then
    update public.payouts set status = 'rejected', processed_at = now(), processed_by = (select auth.uid()),
      admin_note = nullif(btrim(p_note), '')
    where id = v_row.id returning * into v_row;
    insert into public.ledger_entries (account, reseller_id, payout_id, kind, amount, description)
    values ('reseller', v_row.reseller_id, v_row.id, 'payout_release', v_row.amount, 'Pencairan ditolak, saldo dikembalikan');
  else
    raise exception 'INVALID_ACTION';
  end if;
  return v_row;
end;
$$;
revoke execute on function public.admin_process_payout(uuid, text, text, text) from public, anon;
grant execute on function public.admin_process_payout(uuid, text, text, text) to authenticated;

-- ---------- Ringkasan ----------
create or replace function public.reseller_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reseller public.resellers;
  v_settings public.app_settings;
begin
  select * into v_reseller from public.resellers where id = v_uid;
  if v_reseller.id is null then return null; end if;
  select * into v_settings from public.app_settings;

  return jsonb_build_object(
    'reseller', to_jsonb(v_reseller),
    'effective_rate', coalesce(v_reseller.commission_rate, v_settings.default_reseller_rate),
    'balance', public.reseller_balance(v_uid),
    'pending_payout', (select coalesce(sum(amount), 0) from public.payouts where reseller_id = v_uid and status = 'requested'),
    'paid_out', (select coalesce(sum(amount), 0) from public.payouts where reseller_id = v_uid and status = 'paid'),
    'commission_total', (select coalesce(sum(amount), 0) from public.ledger_entries
                         where reseller_id = v_uid and kind in ('sale', 'refund')),
    'sales_count', (select count(*) from public.orders where reseller_id = v_uid and status = 'paid'),
    'sales_amount', (select coalesce(sum(amount), 0) from public.orders where reseller_id = v_uid and status = 'paid'),
    'min_payout', v_settings.min_payout,
    'payout_days', v_settings.payout_days,
    'next_payout_date', public.next_payout_date()
  );
end;
$$;
revoke execute on function public.reseller_summary() from public, anon;
grant execute on function public.reseller_summary() to authenticated;

create or replace function public.admin_resellers()
returns table (
  id uuid, code text, business_name text, email text, whatsapp text, status text,
  commission_rate numeric, effective_rate numeric, bank_name text, bank_account_number text, bank_account_holder text,
  sales_count bigint, sales_amount bigint, commission_total bigint, balance int, pending_payout bigint, paid_out bigint,
  created_at timestamptz, approved_at timestamptz, admin_note text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;
  return query
  select r.id, r.code, r.business_name, p.email, r.whatsapp, r.status,
         r.commission_rate, coalesce(r.commission_rate, s.default_reseller_rate),
         r.bank_name, r.bank_account_number, r.bank_account_holder,
         (select count(*) from public.orders o where o.reseller_id = r.id and o.status = 'paid'),
         (select coalesce(sum(o.amount), 0) from public.orders o where o.reseller_id = r.id and o.status = 'paid')::bigint,
         (select coalesce(sum(l.amount), 0) from public.ledger_entries l where l.reseller_id = r.id and l.kind in ('sale', 'refund'))::bigint,
         public.reseller_balance(r.id),
         (select coalesce(sum(x.amount), 0) from public.payouts x where x.reseller_id = r.id and x.status = 'requested')::bigint,
         (select coalesce(sum(x.amount), 0) from public.payouts x where x.reseller_id = r.id and x.status = 'paid')::bigint,
         r.created_at, r.approved_at, r.admin_note
  from public.resellers r
  join public.profiles p on p.id = r.id
  cross join public.app_settings s
  order by (r.status = 'pending') desc, r.created_at desc;
end;
$$;
revoke execute on function public.admin_resellers() from public, anon;
grant execute on function public.admin_resellers() to authenticated;

-- Statistik admin: pisahkan kanal platform, reseller, dan manual
create or replace function public.admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v jsonb;
begin
  if not public.is_admin() then raise exception 'FORBIDDEN'; end if;

  select jsonb_build_object(
    'revenue_total', (select coalesce(sum(price), 0) from public.access_tokens),
    'tokens_generated', (select count(*) from public.access_tokens),
    'tokens_redeemed', (select count(*) from public.access_tokens where redeemed_at is not null),
    'users_total', (select count(*) from public.profiles where role = 'user'),
    'users_active', (select count(distinct owner_id) from public.invitations where updated_at > now() - interval '30 days'),
    'invitations_total', (select count(*) from public.invitations),
    'guests_total', (select count(*) from public.guests),
    'rsvps_total', (select count(*) from public.rsvps),
    'platform_share_total', (select coalesce(sum(amount), 0) from public.ledger_entries where account = 'platform'),
    'reseller_commission_total', (select coalesce(sum(amount), 0) from public.ledger_entries where account = 'reseller' and kind in ('sale', 'refund')),
    'reseller_balance_total', (select coalesce(sum(amount), 0) from public.ledger_entries where account = 'reseller'),
    'payouts_pending', (select coalesce(sum(amount), 0) from public.payouts where status = 'requested'),
    'orders_unpaid', (select count(*) from public.orders where status = 'unpaid'),
    'channels', (
      select coalesce(jsonb_object_agg(channel, jsonb_build_object('count', n, 'revenue', rev)), '{}'::jsonb)
      from (select channel, count(*) n, coalesce(sum(price), 0) rev from public.access_tokens group by channel) c
    ),
    'monthly', (
      select coalesce(jsonb_agg(m order by m ->> 'month'), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'month', to_char(g.month, 'YYYY-MM'),
          'revenue', coalesce(sum(a.price), 0),
          'revenue_platform', coalesce(sum(a.price) filter (where a.channel = 'platform'), 0),
          'revenue_reseller', coalesce(sum(a.price) filter (where a.channel = 'reseller'), 0),
          'revenue_manual', coalesce(sum(a.price) filter (where a.channel = 'manual'), 0),
          'tokens', count(a.id),
          'redeemed', count(a.redeemed_at),
          'new_users', (select count(*) from public.profiles p where p.role = 'user' and date_trunc('month', p.created_at) = g.month)
        ) as m
        from generate_series(date_trunc('month', now()) - interval '11 months', date_trunc('month', now()), interval '1 month') as g(month)
        left join public.access_tokens a on date_trunc('month', a.created_at) = g.month
        group by g.month
      ) s
    ),
    'leaderboard', (
      select coalesce(jsonb_agg(l order by (l ->> 'sold')::int desc, (l ->> 'revenue')::int desc), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'theme_id', t.id, 'code', t.code, 'name', t.name, 'category', c.name,
          'sold', count(a.id), 'redeemed', count(a.redeemed_at), 'revenue', coalesce(sum(a.price), 0)
        ) as l
        from public.themes t
        left join public.categories c on c.id = t.category_id
        left join public.access_tokens a on a.theme_id = t.id
        group by t.id, c.name
      ) s
    ),
    'resellers', (
      select coalesce(jsonb_agg(x order by (x ->> 'revenue')::bigint desc), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'id', r.id, 'code', r.code, 'business_name', r.business_name,
          'sold', count(o.id), 'revenue', coalesce(sum(o.amount), 0),
          'commission', coalesce(sum(o.reseller_share), 0),
          'balance', public.reseller_balance(r.id)
        ) as x
        from public.resellers r
        left join public.orders o on o.reseller_id = r.id and o.status = 'paid'
        where r.status in ('active', 'suspended')
        group by r.id
      ) s
    )
  ) into v;
  return v;
end;
$$;

-- Slug undangan tidak boleh bentrok dengan rute baru
create or replace function public.is_reserved_slug(p_slug text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_slug = any (array[
    'admin', 'dashboard', 'daftar', 'masuk', 'keluar', 'login', 'register',
    'api', 'tema', 'preview', 'katalog', 'harga', 'bantuan', 'auth', 'confirm',
    'reset-password', 'lupa-password', 'undangan', 'assets', 'static', 'public', 'nuxt',
    'checkout', 'pesanan', 'reseller', 'r', 'bayar', 'pembayaran'
  ]);
$$;
