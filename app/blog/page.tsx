import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AnimatedSection from '@/components/AnimatedSection'
import BlogCard from '@/components/BlogCard'
import type { BlogPost } from '@/components/BlogCard'

export const metadata: Metadata = {
  title: 'Blog — DeepSun Studio',
  description:
    'Guías y consejos sobre desarrollo web, automatización y presencia digital para negocios en Colombia.',
}

function getPosts(): BlogPost[] {
  const dir = path.join(process.cwd(), 'content', 'blog')
  if (!fs.existsSync(dir)) return []
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'))
  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf8')
      const { data } = matter(raw)
      return {
        slug: filename.replace('.mdx', ''),
        title: data.title ?? filename,
        description: data.description ?? '',
        date: data.date ?? '',
        readTime: data.readTime ?? '5 min',
        category: data.category ?? 'General',
      } satisfies BlogPost
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function BlogPage() {
  const posts = getPosts()

  return (
    <>
      <Navbar />
      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-cyan-600/[0.06] rounded-full blur-[100px] pointer-events-none" aria-hidden="true" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <div className="tag-pill mb-5 inline-flex">Blog</div>
              <h1 className="font-heading font-black text-white mb-4" style={{ fontSize: 'clamp(32px, 5.5vw, 64px)' }}>
                Ideas que hacen crecer negocios.
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
                Guías prácticas sobre presencia digital, automatización y desarrollo web para negocios en Colombia.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Posts grid ── */}
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <AnimatedSection className="text-center py-20">
                <p className="text-slate-500">Próximamente...</p>
              </AnimatedSection>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post, i) => (
                  <BlogCard key={post.slug} post={post} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 border-t border-white/[0.04]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <p className="text-slate-400 mb-2">¿Tienes una pregunta específica para tu negocio?</p>
              <a
                href="https://wa.me/573971496476"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors text-sm"
              >
                Escríbeme directo por WhatsApp →
              </a>
            </AnimatedSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
