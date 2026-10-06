#!/usr/bin/env bash
# Jalankan SQL ke database Supabase lewat Management API (tanpa SQL Editor).
#
#   scripts/db.sh "select count(*) from public.blog_posts"   # query langsung
#   scripts/db.sh -f berkas.sql                               # jalankan isi berkas
#   scripts/db.sh -m supabase/migrations/2026..._nama.sql     # terapkan migrasi + catat di riwayat
#
# Butuh env SUPABASE_ACCESS_TOKEN (personal access token dari
# https://supabase.com/dashboard/account/tokens). SUPABASE_PROJECT_REF opsional.
set -euo pipefail

REF="${SUPABASE_PROJECT_REF:-cyyjwhcmetldnxhaqife}"

usage() { sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }

[[ $# -ge 1 ]] || usage
case "$1" in
  -f)
    [[ $# -eq 2 && -f "$2" ]] || usage
    sql="$(cat "$2")"
    ;;
  -m)
    [[ $# -eq 2 && -f "$2" ]] || usage
    base="$(basename "$2" .sql)"
    version="${base%%_*}"
    name="${base#*_}"
    [[ "$version" =~ ^[0-9]{14}$ && -n "$name" && "$name" != "$base" ]] || { echo "Nama berkas migrasi harus <14 digit>_<nama>.sql" >&2; exit 2; }
    # Dicatat di akhir agar hanya tersimpan bila seluruh migrasi berhasil.
    sql="$(cat "$2")
;
insert into supabase_migrations.schema_migrations (version, name) values ('$version', '$name') on conflict (version) do nothing;"
    ;;
  -h|--help) usage ;;
  *)
    [[ $# -eq 1 ]] || usage
    sql="$1"
    ;;
esac

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN belum diset (buat di https://supabase.com/dashboard/account/tokens)." >&2
  exit 1
fi

jq -n --arg q "$sql" '{query: $q}' |
  curl -sS --fail-with-body -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary @- |
  jq .
