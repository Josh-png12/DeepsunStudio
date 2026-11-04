// Single source of truth for public contact data. Nothing else in the repo may hardcode a phone number.
import { siteOrigin } from './indexing.js'

/** Official WhatsApp number of DeepSun Studio (confirmed by the owner): +57 324 618 3318. */
const OFFICIAL_WHATSAPP = '573246183318'

// NEXT_PUBLIC_WHATSAPP_NUMBER documents/overrides the value for deployments, but it can never introduce another number:
// anything that differs from the official one is ignored (and reported) so a stale variable cannot reintroduce an old number.
const fromEnv = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')
if (fromEnv && fromEnv !== OFFICIAL_WHATSAPP && typeof window === 'undefined') {
  console.warn('[site] NEXT_PUBLIC_WHATSAPP_NUMBER differs from the official number and is ignored. Set it to', OFFICIAL_WHATSAPP)
}

export const WHATSAPP_NUMBER: string = OFFICIAL_WHATSAPP
/** For humans: "+57 324 618 3318". */
export const WHATSAPP_DISPLAY = '+57 324 618 3318'
/** E.164, for structured data / tel: links. */
export const WHATSAPP_E164 = `+${OFFICIAL_WHATSAPP}`

export const SITE = {
  name: 'DeepSun Studio',
  // Official domain in production; the deployment's own URL elsewhere (see lib/indexing.js).
  url: siteOrigin('https://www.deepsunstudio.com'),
  email: 'joshua@deepsunstudio.com',
  city: 'Riohacha, Colombia',
} as const

/** `https://wa.me/<number>?text=<percent-encoded message>` — the text is always URL-encoded (accents, spaces, line breaks). */
export function whatsappHref(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export const mailtoHref = (subject?: string) =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
