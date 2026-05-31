'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { personalInfo } from '@/data/portfolio'

type Mode = 'email' | 'whatsapp'
type Status = 'idle' | 'sending' | 'sent' | 'error'

type FormData = {
  name: string
  email: string
  subject: string
  message: string
}

const contactLinks = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: personalInfo.social.email,
    href: `mailto:${personalInfo.social.email}`,
    external: false,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    label: 'WhatsApp',
    value: personalInfo.social.whatsapp,
    href: personalInfo.social.whatsappUrl,
    external: true,
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    label: 'GitHub',
    value: 'Josh-png12',
    href: personalInfo.social.github,
    external: true,
  },
]

const inputClass =
  'w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-200 text-sm'

export default function Contact() {
  const [mode, setMode] = useState<Mode>('email')
  const [form, setForm] = useState<FormData>({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      )
      setStatus('sent')
      setTimeout(() => {
        setStatus('idle')
        setForm({ name: '', email: '', subject: '', message: '' })
      }, 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const handleWhatsApp = (e: React.FormEvent) => {
    e.preventDefault()
    const text = encodeURIComponent(
      `Hola Joshua, te escribo desde tu portafolio.\n\n*Nombre:* ${form.name}\n*Asunto:* ${form.subject}\n\n${form.message}`,
    )
    window.open(`https://wa.me/573197149647?text=${text}`, '_blank')
  }

  const isLoading = status === 'sending'

  const submitLabel = (() => {
    if (mode === 'whatsapp') return 'Abrir WhatsApp'
    if (status === 'sending') return 'Enviando...'
    if (status === 'sent') return '¡Mensaje enviado! ✓'
    if (status === 'error') return 'Error al enviar. Intenta de nuevo.'
    return 'Enviar mensaje'
  })()

  const submitClass = (() => {
    const base = 'w-full py-3.5 rounded-xl font-semibold transition-all duration-200 text-sm min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed'
    if (status === 'sent') return `${base} bg-emerald-600 text-white`
    if (status === 'error') return `${base} bg-red-600/80 text-white`
    if (mode === 'whatsapp') return `${base} bg-emerald-600 hover:bg-emerald-500 text-white`
    return `${base} bg-blue-600 hover:bg-blue-500 text-white hover:shadow-glow-blue-sm`
  })()

  return (
    <section
      id="contacto"
      aria-label="Contacto"
      className="relative py-20 lg:py-28 bg-contact-glow"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-blue-500 text-sm font-mono font-medium mb-4 block"
          >
            // contacto
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading font-bold text-white mb-4"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
          >
            Hablemos
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-neutral-400 max-w-xl text-base sm:text-lg"
          >
            ¿Tienes un proyecto en mente? Escríbeme y lo construimos juntos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* ── Contact links ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {contactLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                aria-label={`Contactar por ${link.label}`}
                className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-blue-500/[0.3] hover:bg-white/[0.05] transition-all duration-200 group min-h-[44px]"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600/[0.12] border border-blue-500/[0.18] flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:bg-blue-600/[0.22] transition-colors duration-200">
                  {link.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-neutral-600 uppercase tracking-widest font-semibold mb-0.5">
                    {link.label}
                  </p>
                  <p className="text-neutral-200 font-medium text-sm truncate">{link.value}</p>
                </div>
                <svg
                  className="w-4 h-4 text-neutral-700 group-hover:text-blue-400 transition-colors duration-200 ml-auto flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/[0.15]">
              <span className="relative flex h-3 w-3 flex-shrink-0" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Disponible ahora</p>
                <p className="text-xs text-neutral-500 mt-0.5">Para proyectos freelance y colaboraciones</p>
              </div>
            </div>
          </motion.div>

          {/* ── Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Mode tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-white/[0.04] border border-white/[0.07] rounded-2xl">
              <button
                type="button"
                onClick={() => { setMode('email'); setStatus('idle') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                  mode === 'email'
                    ? 'bg-blue-600 text-white shadow-glow-blue-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar mensaje
              </button>
              <button
                type="button"
                onClick={() => { setMode('whatsapp'); setStatus('idle') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 min-h-[44px] ${
                  mode === 'whatsapp'
                    ? 'bg-emerald-600 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
            </div>

            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex flex-col items-center justify-center text-center py-16 px-8 rounded-2xl bg-white/[0.03] border border-white/[0.07]"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-500/[0.15] border border-emerald-500/[0.3] flex items-center justify-center mb-5" aria-hidden="true">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-heading font-bold text-white text-xl mb-2">¡Mensaje enviado!</h3>
                  <p className="text-neutral-400 text-sm max-w-xs">
                    Gracias por escribirme. Te responderé en menos de 24 horas.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={mode === 'email' ? handleEmail : handleWhatsApp}
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Nombre */}
                  <div>
                    <label htmlFor="c-name" className="block text-sm text-neutral-400 mb-2 font-medium">
                      Nombre <span className="text-blue-500">*</span>
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Tu nombre"
                      className={inputClass}
                    />
                  </div>

                  {/* Email — solo en modo email */}
                  <AnimatePresence>
                    {mode === 'email' && (
                      <motion.div
                        key="email-field"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <label htmlFor="c-email" className="block text-sm text-neutral-400 mb-2 font-medium">
                          Email <span className="text-blue-500">*</span>
                        </label>
                        <input
                          id="c-email"
                          type="email"
                          required={mode === 'email'}
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="tu@email.com"
                          className={inputClass}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Asunto */}
                  <div>
                    <label htmlFor="c-subject" className="block text-sm text-neutral-400 mb-2 font-medium">
                      Asunto <span className="text-blue-500">*</span>
                    </label>
                    <input
                      id="c-subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => update('subject', e.target.value)}
                      placeholder="¿En qué puedo ayudarte?"
                      className={inputClass}
                    />
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label htmlFor="c-message" className="block text-sm text-neutral-400 mb-2 font-medium">
                      Mensaje <span className="text-blue-500">*</span>
                    </label>
                    <textarea
                      id="c-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      placeholder="Cuéntame sobre tu proyecto..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={submitClass}
                  >
                    {submitLabel}
                  </button>

                  {status === 'error' && (
                    <p className="text-xs text-red-400 text-center">
                      Revisa tu public key de EmailJS o intenta por WhatsApp.
                    </p>
                  )}
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
