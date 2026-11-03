import type { Metadata } from 'next'
import BlogView from '@/components/site/BlogView'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Guías y consejos sobre desarrollo web, automatización y presencia digital para negocios en Colombia.',
}

export default function BlogPage() {
  return <BlogView posts={getAllPosts()} />
}
