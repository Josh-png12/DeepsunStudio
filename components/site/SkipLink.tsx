'use client'

import { useSite } from '@/lib/site-i18n'
import { UI } from '@/lib/site-content'

export default function SkipLink() {
  const { tr } = useSite()
  return (
    <a className="skip" href="#main">
      {tr(UI.skip)}
    </a>
  )
}
