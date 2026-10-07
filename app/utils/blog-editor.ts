import type { Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Blockquote from '@tiptap/extension-blockquote'
import { ListItem } from '@tiptap/extension-list'
import Link from '@tiptap/extension-link'
import { Placeholder } from '@tiptap/extensions'
import { isSafeHref } from './markdown'

/**
 * Ekstensi editor artikel blog (TipTap). Skemanya sengaja dibatasi pada format yang bisa ditampilkan
 * renderArticle — paragraf, H2/H3, daftar satu tingkat, kutipan berisi paragraf, tebal, miring, tautan —
 * sehingga konten tempelan dari Word/Google Docs otomatis dirapikan ke format itu.
 */
export function blogEditorExtensions(placeholder = ''): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      blockquote: false,
      listItem: false,
      link: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      strike: false,
      underline: false,
      hardBreak: false,
    }),
    Blockquote.extend({ content: 'paragraph+' }),
    ListItem.extend({ content: 'paragraph' }),
    Link.configure({
      openOnClick: false,
      autolink: false,
      linkOnPaste: true,
      defaultProtocol: 'https',
      HTMLAttributes: { target: null, rel: null },
      isAllowedUri: url => isSafeHref(url),
    }),
    ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
  ]
}

/** Rapikan HTML tempelan: H1 → H2, H4–H6 → H3, baris baru paksa → spasi. */
export const tidyPastedHtml = (html: string) => html
  .replace(/<(\/?)h1\b/gi, '<$1h2')
  .replace(/<(\/?)h[4-6]\b/gi, '<$1h3')
  .replace(/<br\s*\/?>/gi, ' ')
