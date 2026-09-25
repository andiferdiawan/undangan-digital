/** Validasi + kompilasi tanpa menyimpan (untuk editor JSON & pratinjau admin). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { definition } = await readBody<{ definition: unknown }>(event)
  const r = await compileTheme(definition)
  return { ok: r.ok, errors: r.errors, warnings: r.warnings, definition: r.definition ?? null, css: r.css }
})
