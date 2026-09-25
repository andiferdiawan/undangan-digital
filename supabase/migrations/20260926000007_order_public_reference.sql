-- Server membutuhkan referensi pembayaran & merchant_ref untuk sinkronisasi status
-- dari halaman pesanan (hanya untuk pemegang access_key).
create or replace function public.get_order_payment_ref(p_order_id uuid, p_key text)
returns table (merchant_ref text, payment_reference text, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select merchant_ref, payment_reference, status from public.orders
  where id = p_order_id and access_key = p_key;
$$;
grant execute on function public.get_order_payment_ref(uuid, text) to anon, authenticated;
