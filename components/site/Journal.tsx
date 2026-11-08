'use client'

import Link from 'next/link'
import { useSite, Rich } from '@/lib/site-i18n'
import { JOURNAL, UI } from '@/lib/site-content'
import type { PostMeta } from '@/lib/blog'

export function fmtDate(iso: string, lang: 'es' | 'en') {
  if (!iso) return ''
  const parts = new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((x) => x.type === t)?.value ?? ''
  // "MAR 2026" like the prototype (no "de", no trailing dot)
  return `${get('month').replace('.', '')} ${get('year')}`.toUpperCase()
}

export function ArticleCard({ post }: { post: PostMeta }) {
  const { tr, lang } = useSite()
  return (
    <article className="article">
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized 1200×630 cover generated at build time */}
      <img className="article-thumb" src={post.cover} alt="" width={1200} height={630} loading="lazy" decoding="async" />
      <small><span lang="es">{post.category}</span> / {fmtDate(post.date, lang)}</small>
      <h3 lang="es">{post.title}</h3>
      <p lang="es">{post.description}</p>
      <Link href={`/blog/${post.slug}`}>
        <span>{tr(UI.readArticle)}</span> ↗
      </Link>
    </article>
  )
}

export default function Journal({ posts }: { posts: PostMeta[] }) {
  const { tr, lang } = useSite()
  return (
    <section className="journal" id="blog">
      <div className="wrap">
        <div className="journal-head">
          <div>
            <div className="eyebrow">{tr(JOURNAL.eyebrow)}</div>
            <Rich as="h2" v={JOURNAL.title} />
          </div>
          <p>{tr(JOURNAL.intro)}</p>
        </div>
        {lang === 'en' && <p className="lang-note">{JOURNAL.onlySpanish.en}</p>}
        {posts.length === 0 ? (
          <p className="empty-note">{tr(JOURNAL.empty)}</p>
        ) : (
          <div className="articles">
            {posts.slice(0, 3).map((p) => (
              <ArticleCard key={p.slug} post={p} />
            ))}
          </div>
        )}
        <div className="journal-cta">
          <Link className="btn dark" href="/blog">
            <span>{tr(UI.visitBlog)}</span>
            <span className="arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
