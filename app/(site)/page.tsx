import Hero from '@/components/site/Hero'
import Intro from '@/components/site/Intro'
import Work from '@/components/site/Work'
import Reviews from '@/components/site/Reviews'
import ServicesBlock from '@/components/site/ServicesBlock'
import Pricing from '@/components/site/Pricing'
import Method from '@/components/site/Method'
import Journal from '@/components/site/Journal'
import ContactBlock from '@/components/site/ContactBlock'
import { getAllPosts } from '@/lib/blog'
import { getCases } from '@/lib/site-cases'

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Work cases={getCases()} />
      <Reviews />
      <ServicesBlock />
      <Pricing />
      <Method />
      <Journal posts={getAllPosts()} />
      <ContactBlock />
    </>
  )
}
