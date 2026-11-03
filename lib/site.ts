// Single source of truth for public contact data.
//
// WhatsApp: the repo contains two conflicting numbers (573971496476 in the
// floating button / services / studio vs 573197149647 in portfolio data,
// JSON-LD and the old contact section). Neither is hardcoded here: set
// NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, with country code) once confirmed.
// Until then every WhatsApp link is hidden rather than pointing to a guess.

export const SITE = {
  name: 'DeepSun Studio',
  url: 'https://www.deepsunstudio.com',
  email: 'joshua@deepsunstudio.com',
  city: 'Riohacha, Colombia',
} as const

const digits = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

export const WHATSAPP_NUMBER: string | null = digits.length >= 10 ? digits : null

export function whatsappHref(text: string): string | null {
  if (!WHATSAPP_NUMBER) return null
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}

export const mailtoHref = (subject?: string) =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
