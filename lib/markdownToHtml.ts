export function markdownToHtml(md: string): string {
  let html = md
    // Escape <> that aren't already tags
    .replace(/&/g, '&amp;')
    .replace(/<(?![a-zA-Z/])/g, '&lt;')

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

  // Paragraphs: wrap lines that aren't already block elements
  const blockTags = /^(<h[2-6]|<ul|<ol|<li|<hr|<blockquote)/
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
