// `![alt](/blog/<slug>/<file>.webp "optional caption")`. Runs BEFORE the link rule (same bracket syntax).
const IMAGE_RE = /!\[([^\]\n]*)\]\(\s*([^\s)]*)(?:\s+"([^"\n]*)")?\s*\)/g
// Only our own files: /blog/… with a conservative charset (no quotes, spaces, "//", backslashes or "..").
const SAFE_SRC = /^\/blog\/[A-Za-z0-9_\-./]+$/
const isSafeSrc = (src: string) => SAFE_SRC.test(src) && !src.includes('..') && !src.includes('//')
// The source already went through the initial `&` escape, so `&` is not escaped twice here.
const escAttr = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const FIG_MARK = '\u0000FIG'
const FIG_RE = /\u0000FIG(\d+)\u0000/g

/**
 * Standalone image lines become <figure class="ds-fig">. They are swapped for placeholders while the inline rules
 * run (so `**` or `[..](..)` inside an alt text can never inject markup) and restored before paragraphs are built.
 * An image that is not alone on its line, or whose src is not a local /blog/ path, is dropped (never a link).
 */
function extractFigures(text: string): { text: string; figures: string[] } {
  const figures: string[] = []
  const out = text
    .split('\n')
    .map((line) =>
      line.replace(IMAGE_RE, (match: string, alt: string, src: string, caption: string | undefined) => {
        if (line.trim() !== match || !isSafeSrc(src)) return ''
        const cap = caption?.trim() ? `<figcaption>${escAttr(caption.trim())}</figcaption>` : ''
        figures.push(`<figure class="ds-fig"><img src="${src}" alt="${escAttr(alt.trim())}" loading="lazy" decoding="async" />${cap}</figure>`)
        return `${FIG_MARK}${figures.length - 1}\u0000`
      }),
    )
    .join('\n')
  return { text: out, figures }
}

export function markdownToHtml(md: string): string {
  let html = md
    // Escape <> that aren't already tags
    .replace(/&/g, '&amp;')
    .replace(/<(?![a-zA-Z/])/g, '&lt;')

  // Images — before links: standalone lines become placeholders, restored as <figure> below
  const { text, figures } = extractFigures(html)
  html = text

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // H2, H3
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Links — handle before italic to avoid conflicts
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Unordered lists — group consecutive - lines into <ul>
  html = html.replace(/(^- .+$(\n^- .+$)*)/gm, (block) => {
    const items = block
      .split('\n')
      .map((line) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('')
    return `<ul>${items}</ul>`
  })

  // Numbered lists
  html = html.replace(/(^\d+\. .+$(\n^\d+\. .+$)*)/gm, (block) => {
    const items = block
      .split('\n')
      .map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`)
      .join('')
    return `<ol>${items}</ol>`
  })

  // Figures back in, each as a block of its own (never inside a <p>)
  html = html.replace(FIG_RE, (_, i: string) => `\n\n${figures[Number(i)]}\n\n`)

  // Paragraphs: wrap lines that aren't already block elements
  const blockTags = /^(<h[2-6]|<ul|<ol|<li|<hr|<blockquote|<figure)/
  html = html
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (blockTags.test(trimmed)) return trimmed
      return `<p>${trimmed.replace(/\n/g, ' ')}</p>`
    })
    .filter(Boolean)
    .join('\n')

  return html
}
