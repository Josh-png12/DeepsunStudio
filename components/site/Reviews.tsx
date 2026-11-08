'use client'

import dynamic from 'next/dynamic'
import { FORMS_ENABLED } from '@/lib/launch'

// Testimonials are part of the forms feature (visitors submit them, they live in Supabase). The section is loaded lazily and only when the
// feature is on, so the Supabase client is not part of the public JavaScript while forms are off (lib/launch.ts).
const ReviewsSection = dynamic(() => import('./ReviewsSection'))

export default function Reviews() {
  return FORMS_ENABLED ? <ReviewsSection /> : null
}
