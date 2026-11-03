'use client'

import { useMemo, useState } from 'react'
import { useSite } from '@/lib/site-i18n'
import { BLOG_PAGE as B, JOURNAL } from '@/lib/site-content'
import type { PostMeta } from '@/lib/blog'
import PageHead from './PageHead'
import { ArticleCard } from './Journal'

export default function BlogView({ posts }: { posts: PostMeta[] }) {
  const { tr, lang } = useSite()
  const [cat, setCat] = useState('all')
  const cats = useMemo(() => Array.from(new Set(posts.map((p) => p.category))), [posts])
  const list = cat === 'all' ? posts : posts.filter((p) => p.category === cat)

  return (
    <>
      <PageHead
        eyebrow={B.eyebrow}
        title={B.title}
        lead={{ es: 'Guías prácticas sobre presencia digital, automatización y desarrollo web para negocios en Colombia.', en: 'Practical guides on digital presence, automation and web development for businesses in Colombia.' }}
      />
      <section className="journal" style={{ paddingTop: 80 }}>
        <div className="wrap">
          <h2 className="sr-only">{tr({ es: 'Artículos', en: 'Articles' })}</h2>
          {lang === 'en' && <p className="lang-note">{JOURNAL.onlySpanish.en}</p>}
          {cats.length > 1 && (
            <div className="blog-cats" role="group" aria-label={tr({ es: 'Categorías', en: 'Categories' })}>
              <button type="button" className={cat === 'all' ? 'active' : ''} aria-pressed={cat === 'all'} onClick={() => setCat('all')}>{tr(B.all)}</button>
              {cats.map((c) => (
                <button key={c} type="button" className={cat === c ? 'active' : ''} aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
          )}
          {list.length === 0 ? (
            <p className="empty-note">{tr(JOURNAL.empty)}</p>
          ) : (
            <div className="articles wide">
              {list.map((p) => <ArticleCard key={p.slug} post={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
