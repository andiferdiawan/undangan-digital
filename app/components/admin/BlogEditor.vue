<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'

/**
 * Editor artikel visual (seperti Word). Isi tetap disimpan sebagai Markdown sederhana agar artikel lama,
 * generator AI, dan halaman publik (renderArticle) tidak berubah: Markdown → HTML saat dibuka, dokumen → Markdown
 * setiap kali diketik. Toolbar menempel di bawah header situs saat artikel panjang di-scroll.
 */
const props = defineProps<{ modelValue: string, links?: { url: string, title: string }[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

let last = props.modelValue
const mode = ref<'visual' | 'markdown'>('visual')

const editor = useEditor({
  content: renderArticle(props.modelValue).html,
  extensions: blogEditorExtensions('Mulai menulis artikel… Ketik "## " untuk subjudul, "- " untuk daftar, "> " untuk kutipan.'),
  editorProps: {
    attributes: { 'class': 'prose-page px-4 py-5 text-base sm:px-6', 'aria-label': 'Isi artikel', 'spellcheck': 'true' },
    transformPastedHTML: tidyPastedHtml,
    handleKeyDown: (_view, e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { openLink(); return true }
      return false
    },
  },
  onUpdate: ({ editor: ed }) => {
    last = docToMarkdown(ed.getJSON())
    emit('update:modelValue', last)
  },
})

function loadMarkdown(md: string) {
  editor.value?.commands.setContent(renderArticle(md).html, { emitUpdate: false })
  last = md
}
watch(() => props.modelValue, (v) => { if (mode.value === 'visual' && v !== last) loadMarkdown(v) })

function toggleMode() {
  if (mode.value === 'markdown') { loadMarkdown(props.modelValue); mode.value = 'visual' }
  else { linkOpen.value = false; mode.value = 'markdown' }
}

const words = computed(() => props.modelValue.split(/\s+/).filter(Boolean).length)

// ── Gaya paragraf ──
const blockType = computed(() => {
  const e = editor.value
  if (!e) return 'p'
  return e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3' : 'p'
})
function setBlock(ev: Event) {
  const el = ev.target as HTMLSelectElement
  const c = editor.value?.chain().focus()
  if (c) {
    if (el.value === 'p') c.setParagraph().run()
    else c.clearNodes().setHeading({ level: el.value === 'h2' ? 2 : 3 }).run()
  }
  el.value = blockType.value
}

// ── Tautan ──
const linkOpen = ref(false)
const linkUrl = ref('')
const linkText = ref('')
const linkErr = ref('')
const linkNeedsText = ref(false)
const urlInput = ref<HTMLInputElement | null>(null)
function openLink() {
  const e = editor.value
  if (!e || mode.value !== 'visual') return
  linkUrl.value = (e.getAttributes('link').href as string | undefined) ?? ''
  linkNeedsText.value = e.state.selection.empty && !e.isActive('link')
  linkText.value = ''
  linkErr.value = ''
  linkOpen.value = true
  nextTick(() => urlInput.value?.focus())
}
function normalizeUrl(u: string) {
  const s = u.trim()
  if (s && !/^[a-z][a-z0-9+.-]*:|^[/#]/i.test(s) && /^[\w-]+(\.[\w-]+)+/.test(s)) return `https://${s}`
  return s
}
function applyLink() {
  const href = normalizeUrl(linkUrl.value)
  if (!href) return removeLink()
  if (!isSafeHref(href)) { linkErr.value = 'Gunakan alamat https://…, tautan internal /…, mailto: atau tel:'; return }
  const c = editor.value?.chain().focus()
  if (!c) return
  if (linkNeedsText.value) c.insertContent({ type: 'text', text: linkText.value.trim() || href, marks: [{ type: 'link', attrs: { href } }] }).unsetMark('link').run()
  else c.extendMarkRange('link').setLink({ href }).run()
  linkOpen.value = false
}
function removeLink() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  linkOpen.value = false
}
function cancelLink() {
  linkOpen.value = false
  editor.value?.commands.focus()
}

// ── Tombol toolbar ──
type Tool = { key: string, label: string, icon: string, run: () => unknown, active?: () => boolean, disabled?: () => boolean }
const ed = () => editor.value!
const groups: Tool[][] = [
  [
    { key: 'undo', label: 'Urungkan (Ctrl+Z)', icon: 'undo', run: () => ed().chain().focus().undo().run(), disabled: () => !ed().can().undo() },
    { key: 'redo', label: 'Ulangi (Ctrl+Shift+Z)', icon: 'redo', run: () => ed().chain().focus().redo().run(), disabled: () => !ed().can().redo() },
  ],
  [
    { key: 'bold', label: 'Tebal (Ctrl+B)', icon: 'bold', run: () => ed().chain().focus().toggleBold().run(), active: () => ed().isActive('bold') },
    { key: 'italic', label: 'Miring (Ctrl+I)', icon: 'italic', run: () => ed().chain().focus().toggleItalic().run(), active: () => ed().isActive('italic') },
  ],
  [
    { key: 'ul', label: 'Daftar berbutir', icon: 'ul', run: () => ed().chain().focus().toggleBulletList().run(), active: () => ed().isActive('bulletList') },
    { key: 'ol', label: 'Daftar bernomor', icon: 'ol', run: () => ed().chain().focus().toggleOrderedList().run(), active: () => ed().isActive('orderedList') },
    { key: 'quote', label: 'Kutipan / contoh teks', icon: 'quote', run: () => ed().chain().focus().toggleBlockquote().run(), active: () => ed().isActive('blockquote') },
  ],
  [
    { key: 'link', label: 'Sisipkan tautan (Ctrl+K)', icon: 'link', run: openLink, active: () => ed().isActive('link') },
    { key: 'unlink', label: 'Hapus tautan', icon: 'unlink', run: removeLink, disabled: () => !ed().isActive('link') },
    { key: 'clear', label: 'Hapus format', icon: 'clear', run: () => ed().chain().focus().unsetAllMarks().clearNodes().run() },
  ],
]

const ICONS: Record<string, string> = {
  undo: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  redo: 'm15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  bold: 'M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8',
  italic: 'M19 4h-9M14 20H5M15 4 9 20',
  ul: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  ol: 'M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1',
  quote: 'M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zM15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  unlink: 'm18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71M5.17 11.75l-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71M8 2v3M2 8h3M16 19v3M19 16h3',
  clear: 'M4 7V4h16v3M5 20h6M13 4 8 20M15 15l5 5M20 15l-5 5',
  code: 'm16 18 6-6-6-6M8 6l-6 6 6 6',
}
</script>

<template>
  <div class="blog-editor rounded-xl border border-brand-100 bg-white">
    <!-- Toolbar menempel tepat di bawah header situs (tinggi 64px). contain:inline-size: barisan tombol
         yang digeser ke samping di HP tidak ikut melebarkan halaman. -->
    <div class="sticky top-16 z-30 rounded-t-xl [contain:inline-size] border-b border-brand-100 bg-white/95 shadow-[0_6px_12px_-10px_rgb(0_0_0/0.25)] backdrop-blur">
      <div class="flex items-center gap-0.5 overflow-x-auto px-1.5 py-1.5 [scrollbar-width:none]">
        <template v-if="editor && mode === 'visual'">
          <template v-for="(g, gi) in groups" :key="gi">
            <span v-if="gi" class="mx-1 h-6 w-px shrink-0 bg-brand-100" />
            <select
              v-if="gi === 1" :value="blockType" aria-label="Gaya paragraf" title="Gaya paragraf"
              class="mr-1 h-9 shrink-0 rounded-lg border border-brand-100 bg-white px-2 text-sm text-brand-800 outline-none focus:border-brand-400" @change="setBlock"
            >
              <option value="p">Paragraf</option>
              <option value="h2">Subjudul H2</option>
              <option value="h3">Subjudul H3</option>
            </select>
            <button
              v-for="t in g" :key="t.key" type="button" :title="t.label" :aria-label="t.label"
              :aria-pressed="t.active ? t.active() : undefined" :disabled="t.disabled?.()"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition disabled:opacity-30"
              :class="t.active?.() ? 'bg-brand text-white' : 'text-brand-700 hover:bg-brand-50'"
              @mousedown.prevent @click="t.run()"
            >
              <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="ICONS[t.icon]" /></svg>
            </button>
          </template>
        </template>
        <span v-else-if="mode === 'markdown'" class="px-2 text-xs text-brand-600">Mode Markdown — format: ## subjudul, - daftar, **tebal**, *miring*, [teks](url), &gt; kutipan</span>
        <span class="ml-auto shrink-0 pl-2 text-xs tabular-nums text-brand-500">{{ words.toLocaleString('id-ID') }} kata</span>
        <button
          type="button" class="ml-1 flex h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium transition"
          :class="mode === 'markdown' ? 'bg-brand text-white' : 'text-brand-600 hover:bg-brand-50'"
          :title="mode === 'markdown' ? 'Kembali ke editor visual' : 'Lihat/ubah format Markdown'"
          :aria-label="mode === 'markdown' ? 'Kembali ke editor visual' : 'Lihat/ubah format Markdown'" @click="toggleMode"
        >
          <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="ICONS.code" /></svg>
          <span v-if="mode === 'markdown'">Visual</span>
        </button>
      </div>

      <!-- Panel tautan -->
      <div v-if="linkOpen" class="grid gap-2 border-t border-brand-100 px-3 py-2.5 sm:grid-cols-[1fr_auto] sm:items-start">
        <div class="grid gap-2" :class="linkNeedsText && 'sm:grid-cols-2'">
          <input
            v-if="linkNeedsText" v-model="linkText" class="input py-2 text-sm" placeholder="Teks tautan"
            @keydown.enter.prevent="applyLink" @keydown.esc.prevent="cancelLink"
          >
          <input
            ref="urlInput" v-model="linkUrl" class="input py-2 text-sm" list="blog-editor-links" inputmode="url"
            placeholder="https://… atau /katalog/pernikahan" @keydown.enter.prevent="applyLink" @keydown.esc.prevent="cancelLink"
          >
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="btn-primary btn-sm" @click="applyLink">Terapkan</button>
          <button v-if="editor?.isActive('link')" type="button" class="text-xs text-red-600 underline" @click="removeLink">Hapus</button>
          <button type="button" class="text-xs text-brand-600 underline" @click="cancelLink">Batal</button>
        </div>
        <p v-if="linkErr" class="text-xs text-red-600 sm:col-span-2">{{ linkErr }}</p>
        <datalist id="blog-editor-links">
          <option v-for="l in links" :key="l.url" :value="l.url">{{ l.title }}</option>
        </datalist>
      </div>
    </div>

    <EditorContent v-show="mode === 'visual'" :editor="editor" />
    <textarea
      v-if="mode === 'markdown'" :value="modelValue" rows="28" aria-label="Isi artikel (Markdown)"
      class="block w-full resize-y rounded-b-xl bg-white px-4 py-4 font-mono text-[13px] leading-relaxed text-brand-900 outline-none"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<style>
.blog-editor .ProseMirror { min-height: 60vh; outline: none; overflow-wrap: anywhere; }
.blog-editor .ProseMirror > :first-child { margin-top: 0; }
.blog-editor .ProseMirror a { cursor: text; }
.blog-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder); float: left; height: 0; color: #9db0a2; pointer-events: none;
}
</style>
