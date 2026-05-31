import dynamic from 'next/dynamic'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Projects from '@/components/sections/Projects'

// Below-the-fold sections: code-split for faster initial load.
// Testimonials uses ssr:false because it fetches from Supabase client-side anyway.
// Experience, Skills, Contact keep SSR so Google indexes their static content.
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), {
  ssr: false,
})
const Experience = dynamic(() => import('@/components/sections/Experience'))
const Skills     = dynamic(() => import('@/components/sections/Skills'))
const Contact    = dynamic(() => import('@/components/sections/Contact'))

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Testimonials />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
