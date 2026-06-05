/**
 * SectionChip — the standard section label chip with the DeepSun brand mark.
 * Replaces every `<span className="hm-chip">` in section headers.
 * The brand mark is always the leading element — it's the visual thread
 * that connects all sections to the DeepSun identity.
 */

import { BrandMark } from '@/components/BrandMark'

interface SectionChipProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function SectionChip({ children, style }: SectionChipProps) {
  return (
    <span
      className="hm-chip"
      style={{ display: 'inline-flex', ...style }}
    >
      <BrandMark size="icon" color="var(--color-accent)" />
      {children}
    </span>
  )
}
