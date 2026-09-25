-- Pemilik undangan tetap bisa membaca temanya walau tema ditarik dari katalog (draft/arsip)
create policy "tema: pemilik undangan baca" on public.themes
  for select to authenticated
  using (exists (
    select 1 from public.invitations i
    where i.theme_id = themes.id and i.owner_id = (select auth.uid())
  ));
