-- Deskripsi jenis Acara Umum mencakup kegiatan sekolah & kampus (tema ekskul/UKM)
update public.event_groups
set description = 'Pengajian, halal bihalal, reuni, serta kegiatan sekolah & kampus seperti Pramuka, PMR, dan pentas seni'
where slug = 'acara';
