export interface Testimonial {
  id: string
  created_at: string
  name: string
  company: string | null
  role: string | null
  message: string
  rating: number
  avatar_url: string | null
  result_image_url: string | null
  video_url: string | null
  approved: boolean
  featured: boolean
}
