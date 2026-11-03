import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import ArticleView from '@/components/site/ArticleView'
import { getPost } from '@/lib/blog'
import { markdownToHtml } from '@/lib/markdownToHtml'
import { pageMeta } from '@/lib/seo'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'content', 'blog')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({ slug: f.replace('.mdx', '') }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return pageMeta({
    title: String(post.data.title),
    description: String(post.data.description ?? ''),
    path: `/blog/${slug}`,
    type: 'article',
    publishedTime: post.data.date ? String(post.data.date) : undefined,
  })
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { data, content } = post
  return (
    <>
      <ArticleJsonLd title={String(data.title ?? '')} description={String(data.description ?? '')} path={`/blog/${slug}`} datePublished={data.date ? String(data.date) : undefined} />
      <BreadcrumbJsonLd items={[{ name: 'Blog', path: '/blog' }, { name: String(data.title ?? ''), path: `/blog/${slug}` }]} />
      <ArticleView
      title={String(data.title ?? '')}
      description={String(data.description ?? '')}
      category={data.category ? String(data.category) : ''}
      readTime={data.readTime ? String(data.readTime) : ''}
      date={data.date ? String(data.date) : ''}
      html={markdownToHtml(content)}
      />
    </>
  )
}
