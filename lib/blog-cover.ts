/**
 * Greedy word wrap for the generated blog covers (Satori has no reliable line clamp): at most `maxLines` lines of
 * at most `maxChars` characters; if the title does not fit, the last line ends with "…".
 */
export function wrapTitle(title: string, maxChars = 22, maxLines = 3): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let i = 0
  while (i < words.length && lines.length < maxLines) {
    let line = words[i].length > maxChars ? words[i].slice(0, maxChars) : words[i]
    i++
    while (i < words.length && line.length + 1 + words[i].length <= maxChars) {
      line += ' ' + words[i]
      i++
    }
    lines.push(line)
  }
  if (i < words.length && lines.length) {
    let last = lines[lines.length - 1]
    // Make room for the ellipsis, dropping whole words where possible.
    while (last.length + 1 > maxChars && last.includes(' ')) last = last.slice(0, last.lastIndexOf(' '))
    if (last.length + 1 > maxChars) last = last.slice(0, maxChars - 1)
    lines[lines.length - 1] = last.replace(/[\s,.;:—-]+$/, '') + '…'
  }
  return lines
}
