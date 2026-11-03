import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((filename) => {
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8'))
      return {
        slug: filename.replace('.mdx', ''),
        title: data.title ?? filename,
        description: data.description ?? '',
        date: data.date ?? '',
        readTime: data.readTime ?? '5 min',
        category: data.category ?? 'General',
      } satisfies PostMeta
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPost(slug: string) {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'))
  return { data, content }
}
