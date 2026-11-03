'use client'

import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { FOOTER, UI } from '@/lib/site-content'
import { SITE, mailtoHref } from '@/lib/site'
import { BrandLink } from './Brand'

export default function Footer() {
  const { tr } = useSite()
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-top">
          <BrandLink label={tr(UI.homeLabel)} />
          <Rich as="div" className="footer-note" v={FOOTER.note} />
        </div>
        <nav className="footer-links" aria-label="Footer">
          {FOOTER.links.map((l) => (
            <Link key={l.href} href={l.href}>
              {tr(l.label)}
            </Link>
          ))}
          <a href={mailtoHref()}>{SITE.email}</a>
          <Link href="/portal">{tr(UI.clientPortal)}</Link>
        </nav>
        <div className="footer-word" aria-hidden="true">
          DEEPSUN.
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DEEPSUN STUDIO</span>
          <span>{tr(FOOTER.tag)}</span>
          <a href="#top">{tr(UI.back)}</a>
        </div>
      </div>
    </footer>
  )
}
