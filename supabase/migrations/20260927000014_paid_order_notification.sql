-- Notifikasi email saat pesanan lunas (admin selalu, reseller bila penjualan lewat reseller).
-- Callback Tripay dan tombol "cek status" bisa memproses pesanan yang sama, jadi
-- pengiriman "diklaim" sekali secara atomik lewat kolom paid_notified_at.

alter table public.orders add column if not exists paid_notified_at timestamptz;

-- Pesanan lunas yang sudah ada tidak perlu dikirimi notifikasi susulan
update public.orders set paid_notified_at = coalesce(paid_at, now())
where status = 'paid' and paid_notified_at is null;

create or replace function public.server_claim_paid_notification(p_secret text, p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  perform private.assert_server(p_secret);

  update public.orders set paid_notified_at = now()
  where id = p_order_id and status = 'paid' and paid_notified_at is null
  returning * into v_order;
  if v_order.id is null then return null; end if;

  return jsonb_build_object(
    'id', v_order.id,
    'merchant_ref', v_order.merchant_ref,
    'channel', v_order.channel,
    'customer_name', v_order.customer_name,
    'customer_email', v_order.customer_email,
    'customer_phone', v_order.customer_phone,
    'amount', v_order.amount,
    'fee_customer', v_order.fee_customer,
    'total_amount', coalesce(v_order.total_amount, v_order.amount),
    'payment_name', v_order.payment_name,
    'paid_at', v_order.paid_at,
    'guest_limit', v_order.guest_limit,
    'commission_rate', v_order.commission_rate,
    'reseller_share', v_order.reseller_share,
    'platform_share', v_order.platform_share,
    'theme', (select jsonb_build_object('name', t.name, 'code', t.code) from public.themes t where t.id = v_order.theme_id),
    'package', (select p.name from public.packages p where p.id = v_order.package_id),
    'token', (select a.code from public.access_tokens a where a.id = v_order.token_id),
    'reseller', (
      select jsonb_build_object('business_name', r.business_name, 'code', r.code, 'email', pr.email)
      from public.resellers r join public.profiles pr on pr.id = r.id
      where r.id = v_order.reseller_id
    )
  );
end;
$$;
revoke execute on function public.server_claim_paid_notification(text, uuid) from public;
grant execute on function public.server_claim_paid_notification(text, uuid) to anon, authenticated;
