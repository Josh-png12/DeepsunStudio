'use client'

import Link from 'next/link'
import { useSite } from '@/lib/site-i18n'
import { JOURNAL as J, UI } from '@/lib/site-content'

interface Props {
  title: string
  description: string
  category: string
  readTime: string
  date: string
  /** Same-site cover path (see resolveCover in lib/blog). */
  cover: string
  /** Trusted: generated at build time from our own MDX files by lib/markdownToHtml. */
  html: string
}

export default function ArticleView({ title, description, category, readTime, date, cover, html }: Props) {
  const { tr, lang } = useSite()
  const formatted = date
    ? new Date(date).toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) // fixed zone: server (UTC) and browser must render the same day
    : ''
  return (
    <>
      <header className="article-head">
        <div className="page-head-inner">
          <nav className="eyebrow" aria-label="Breadcrumb">
            <Link href="/blog">Blog</Link>
          </nav>
          <h1 className="article-title">{title}</h1>
          <div className="article-meta">
            {category && <span className="badge">{category}</span>}
            {readTime && <span>{readTime} {tr(J.min)}</span>}
            {formatted && <time dateTime={date}>{formatted}</time>}
            <span>{tr(J.shareNote)}</span>
          </div>
          {description && <p className="article-desc" lang="es">{description}</p>}
        </div>
      </header>
      <div className="prose-wrap">
        <figure className="article-cover-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized 1200×630 PNG generated at build time; next/image adds nothing here */}
          <img className="article-cover" src={cover} alt={title} width={1200} height={630} decoding="async" />
        </figure>
        <article className="ds-prose" lang="es" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <section className="final-cta">
        <div className="wrap">
          <h2 className="h2-big">{tr(J.ctaTitle)}</h2>
          <p>{tr(J.ctaBody)}</p>
          <div className="btns">
            <Link className="btn" href="/contacto"><span>{tr(UI.start)}</span><span className="arrow" aria-hidden="true">↗</span></Link>
            <Link className="btn light outline" href="/blog"><span>{tr(J.backToBlog)}</span></Link>
          </div>
        </div>
      </section>
    </>
  )
}
