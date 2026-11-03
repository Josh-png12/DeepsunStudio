import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import ArticleView from '@/components/site/ArticleView'
import { getPost } from '@/lib/blog'
import { markdownToHtml } from '@/lib/markdownToHtml'

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
  return {
    title: `${post.data.title} | DeepSun Studio Blog`,
    description: post.data.description,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()
  const { data, content } = post
  return (
    <ArticleView
      title={String(data.title ?? '')}
      description={String(data.description ?? '')}
      category={data.category ? String(data.category) : ''}
      readTime={data.readTime ? String(data.readTime) : ''}
      date={data.date ? String(data.date) : ''}
      html={markdownToHtml(content)}
    />
  )
}
