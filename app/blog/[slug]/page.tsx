import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import { markdownToHtml } from '@/lib/markdownToHtml'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

function getPost(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return { data, content }
}

export async function generateStaticParams() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace('.mdx', '') }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.data.title} | DeepSun Studio Blog`,
    description: post.data.description,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  const { data, content } = post
  const html = markdownToHtml(content)
  const formatted = data.date
    ? new Date(data.date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
                <Link href="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
                <span aria-hidden="true">/</span>
                <span className="text-slate-400 truncate max-w-[200px] sm:max-w-none">{data.title}</span>
              </nav>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                {data.category && <span className="tag-pill">{data.category}</span>}
                {data.readTime && <span className="text-slate-500 text-sm">{data.readTime} de lectura</span>}
                {formatted && <time className="text-slate-600 text-sm">{formatted}</time>}
              </div>

              <h1
                className="font-heading font-black text-white leading-tight mb-6"
                style={{ fontSize: 'clamp(26px, 4.5vw, 52px)' }}
              >
                {data.title}
              </h1>
              {data.description && (
                <p className="text-slate-400 text-lg leading-relaxed border-l-2 border-blue-500/40 pl-4">
                  {data.description}
                </p>
              )}
            </AnimatedSection>
          </div>
        </section>

        {/* ── Content ── */}
        <article className="py-10 pb-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div
                className="blog-prose"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </AnimatedSection>
          </div>
        </article>

        {/* ── CTA ── */}
        <section className="py-16 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="glass-card rounded-2xl p-8 border border-blue-500/20 text-center">
                <h3 className="font-heading font-bold text-white text-xl mb-2">
                  ¿Necesitas esto para tu negocio?
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                  Cuéntanos qué necesitas y te respondemos con una propuesta concreta en menos de 24 horas.
                </p>
                <Link
                  href="/contacto"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 text-sm min-h-[44px] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Hablemos →
                </Link>
              </div>
            </AnimatedSection>
            <div className="mt-8 text-center">
              <Link href="/blog" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                ← Volver al blog
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
