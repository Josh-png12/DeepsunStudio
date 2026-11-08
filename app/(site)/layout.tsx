import { Archivo_Black, DM_Sans, IBM_Plex_Mono, Instrument_Serif } from 'next/font/google'
import { SiteLangProvider } from '@/lib/site-i18n'
import Nav from '@/components/site/Nav'
import Footer from '@/components/site/Footer'
import WhatsAppFab from '@/components/site/WhatsAppFab'
import SkipLink from '@/components/site/SkipLink'
import { JsonLd } from '@/components/JsonLd'
import './ds-base.css'
import './ds-pages.css'
import './ds-motion.css'

const display = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--f-display', display: 'swap' })
const sans = DM_Sans({ subsets: ['latin'], variable: '--f-sans', display: 'swap' })
const mono = IBM_Plex_Mono({ weight: ['400', '500', '600'], subsets: ['latin'], variable: '--f-mono', display: 'swap' })
const serif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--f-serif', display: 'swap' })

// Everything public lives under `.ds` so the editorial theme never reaches /portal.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`ds ${display.variable} ${sans.variable} ${mono.variable} ${serif.variable}`} id="top">
      <JsonLd />
      <SiteLangProvider>
        <SkipLink />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <WhatsAppFab />
      </SiteLangProvider>
    </div>
  )
}
