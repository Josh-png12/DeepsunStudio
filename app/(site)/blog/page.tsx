import { pageMeta } from '@/lib/seo'
import BlogView from '@/components/site/BlogView'
import { getAllPosts } from '@/lib/blog'

export const metadata = pageMeta({
  title: 'Blog',
  description:
    'Guías y consejos sobre desarrollo web, automatización y presencia digital para negocios en Colombia.',
  path: '/blog',
})

export default function BlogPage() {
  return <BlogView posts={getAllPosts()} />
}
