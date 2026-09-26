-- Admin boleh membantu pelanggan: ubah undangan, kelola tamu, moderasi RSVP.
-- (Sebelumnya admin hanya bisa membaca, sehingga simpan dari editor ditolak diam-diam.)

drop policy if exists "undangan: admin ubah" on public.invitations;
create policy "undangan: admin ubah" on public.invitations
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "tamu: admin kelola" on public.guests;
create policy "tamu: admin kelola" on public.guests
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "rsvp: admin baca" on public.rsvps;
create policy "rsvp: admin baca" on public.rsvps
  for select to authenticated using ((select public.is_admin()));
drop policy if exists "rsvp: admin ubah" on public.rsvps;
create policy "rsvp: admin ubah" on public.rsvps
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "rsvp: admin hapus" on public.rsvps;
create policy "rsvp: admin hapus" on public.rsvps
  for delete to authenticated using ((select public.is_admin()));
