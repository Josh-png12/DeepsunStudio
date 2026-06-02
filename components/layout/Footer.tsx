'use client'

import { useLanguage } from '@/lib/i18n'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] pt-10 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_14px_rgba(59,130,246,0.4)]">
              <span className="text-white font-black text-[11px] font-heading tracking-tight">DS</span>
            </div>
            <span className="text-slate-400 text-sm font-medium">DeepSun Studio</span>
          </div>

          {/* Copyright */}
          <p className="text-slate-600 text-xs text-center order-last sm:order-none">
            {t('footer.built')} · © {year} · {t('footer.rights')}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Josh-png12"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-300 transition-colors"
              aria-label="GitHub de Joshua Navarro"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/joshua-navarro-rad-06ab18258"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-300 transition-colors"
              aria-label="LinkedIn de Joshua Navarro"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="mailto:joshua@deepsunstudio.com"
              className="text-slate-600 hover:text-slate-300 transition-colors"
              aria-label="Correo de DeepSun Studio"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>

        {/* SEO keywords — visualmente sutiles, semánticamente útiles */}
        <p className="mt-6 text-center text-slate-700 text-[11px] leading-relaxed select-none">
          Desarrollo web Colombia · Diseño web Riohacha · Automatización WhatsApp ·
          Sistemas a medida · Desarrollo web La Guajira · Agencia web Colombia
        </p>
      </div>
    </footer>
  )
}
