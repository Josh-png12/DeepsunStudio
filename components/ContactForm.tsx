'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  businessType: string
  needs: string[]
  budget: string
  timeline: string
  name: string
  email: string
  whatsapp: string
  message: string
}

const EMPTY: FormData = {
  businessType: '',
  needs: [],
  budget: '',
  timeline: '',
  name: '',
  email: '',
  whatsapp: '',
  message: '',
}

// ─── Step data ────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: 'hotel', label: 'Hotel / Turismo', icon: '🏨' },
  { value: 'salud', label: 'Salud / Clínica', icon: '🏥' },
  { value: 'restaurante', label: 'Restaurante / Comida', icon: '🍽️' },
  { value: 'consultorio', label: 'Firma / Consultorio', icon: '⚖️' },
  { value: 'educacion', label: 'Educación', icon: '🏫' },
  { value: 'empresa', label: 'Empresa / Startup', icon: '🏢' },
  { value: 'comercio', label: 'Comercio / Tienda', icon: '🛍️' },
  { value: 'otro', label: 'Otro', icon: '🔧' },
]

const NEEDS = [
  { value: 'sitio_nuevo', label: 'Sitio web nuevo' },
  { value: 'mejorar', label: 'Mejorar sitio existente' },
  { value: 'whatsapp_bot', label: 'WhatsApp bot' },
  { value: 'sistema', label: 'Sistema a medida' },
  { value: 'seo', label: 'SEO / Posicionamiento' },
  { value: 'asesoria', label: 'Asesoría digital' },
]

const BUDGETS = [
  { value: 'menos_500', label: 'Menos de $500 USD' },
  { value: '500_1500', label: '$500 – $1.500 USD' },
  { value: '1500_3000', label: '$1.500 – $3.000 USD' },
  { value: 'mas_3000', label: 'Más de $3.000 USD' },
  { value: 'no_se', label: 'No lo sé todavía' },
]

const TIMELINES = [
  { value: 'asap', label: 'Lo antes posible' },
  { value: 'mes', label: 'En el próximo mes' },
  { value: '2_3_meses', label: 'En 2–3 meses' },
  { value: 'explorando', label: 'Estoy explorando opciones' },
]

// ─── Subcomponents ────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-slate-500 text-xs font-medium">Paso {step} de 5</span>
        <span className="text-slate-500 text-xs">{Math.round((step / 5) * 100)}%</span>
      </div>
      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
          animate={{ width: `${(step / 5) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium min-h-[44px] ${
        selected
          ? 'bg-blue-600/20 border-blue-500/50 text-white shadow-[0_0_16px_-4px_rgba(59,130,246,0.3)]'
          : 'glass-card border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
      }`}
    >
      {children}
    </button>
  )
}

function FloatingInput({
  id, name, type = 'text', required, label, value, onChange,
}: {
  id: string
  name: keyof FormData
  type?: string
  required?: boolean
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=" "
        className="peer w-full px-4 pt-6 pb-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-transparent text-sm focus:outline-none focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all min-h-[56px]"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-4 text-slate-500 text-sm transition-all duration-200 pointer-events-none select-none peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold"
      >
        {label}
        {required && <span className="text-blue-400 ml-0.5">*</span>}
      </label>
    </div>
  )
}

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const [step, setStep] = useState<Step>(1)
  const [dir, setDir] = useState(1)
  const [data, setData] = useState<FormData>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const goTo = (next: Step) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const toggleNeed = (v: string) => {
    setData((d) => ({
      ...d,
      needs: d.needs.includes(v) ? d.needs.filter((n) => n !== v) : [...d.needs, v],
    }))
  }

  const canNext = () => {
    if (step === 1) return !!data.businessType
    if (step === 2) return data.needs.length > 0
    if (step === 3) return !!data.budget
    if (step === 4) return !!data.timeline
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.name || !data.email) return
    setStatus('sending')
    try {
      const { error } = await supabase.from('leads').insert({
        business_type: data.businessType,
        needs: data.needs,
        budget: data.budget,
        timeline: data.timeline,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp || null,
        message: data.message || null,
      })
      if (error) throw error
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl p-8 border border-emerald-500/20 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-heading font-bold text-white text-xl mb-2">¡Recibido!</h3>
        <p className="text-slate-400 text-sm leading-relaxed">
          Te respondo antes de las próximas <span className="text-white font-semibold">24 horas</span> con una propuesta inicial para tu proyecto.
        </p>
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <p className="text-slate-600 text-xs">¿Necesitas respuesta urgente?</p>
          <a
            href="https://wa.me/573971496476?text=Hola%20Joshua%2C%20acabo%20de%20enviar%20el%20formulario%20de%20contacto"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-2 text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Escribir por WhatsApp
          </a>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-7 border border-white/[0.07]">
      <ProgressBar step={step} />

      <div className="overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Step 1 */}
            {step === 1 && (
              <div>
                <h3 className="font-heading font-bold text-white text-lg mb-1">¿Qué tipo de negocio tienes?</h3>
                <p className="text-slate-500 text-sm mb-5">Selecciona el que más se acerca.</p>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map(({ value, label, icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setData((d) => ({ ...d, businessType: value }))}
                      className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border transition-all duration-200 text-sm font-medium min-h-[48px] ${
                        data.businessType === value
                          ? 'bg-blue-600/20 border-blue-500/50 text-white scale-[1.02] shadow-[0_0_16px_-4px_rgba(59,130,246,0.3)]'
                          : 'glass-card border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/[0.15]'
                      }`}
                    >
                      <span className="text-lg leading-none" role="img" aria-label={label}>{icon}</span>
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h3 className="font-heading font-bold text-white text-lg mb-1">¿Qué necesitas?</h3>
                <p className="text-slate-500 text-sm mb-5">Puedes seleccionar varias opciones.</p>
                <div className="space-y-2">
                  {NEEDS.map(({ value, label }) => (
                    <OptionButton
                      key={value}
                      selected={data.needs.includes(value)}
                      onClick={() => toggleNeed(value)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${data.needs.includes(value) ? 'bg-blue-500 border-blue-500' : 'border-white/20'}`}>
                          {data.needs.includes(value) && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {label}
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h3 className="font-heading font-bold text-white text-lg mb-1">¿Cuál es tu presupuesto aproximado?</h3>
                <p className="text-slate-500 text-sm mb-5">Sin compromiso. Nos ayuda a ofrecerte la mejor solución.</p>
                <div className="space-y-2">
                  {BUDGETS.map(({ value, label }) => (
                    <OptionButton
                      key={value}
                      selected={data.budget === value}
                      onClick={() => setData((d) => ({ ...d, budget: value }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${data.budget === value ? 'border-blue-500' : 'border-white/20'}`}>
                          {data.budget === value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        {label}
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div>
                <h3 className="font-heading font-bold text-white text-lg mb-1">¿Para cuándo lo necesitas?</h3>
                <p className="text-slate-500 text-sm mb-5">Nos permite planificar mejor tu proyecto.</p>
                <div className="space-y-2">
                  {TIMELINES.map(({ value, label }) => (
                    <OptionButton
                      key={value}
                      selected={data.timeline === value}
                      onClick={() => setData((d) => ({ ...d, timeline: value }))}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${data.timeline === value ? 'border-blue-500' : 'border-white/20'}`}>
                          {data.timeline === value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        {label}
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-heading font-bold text-white text-lg mb-1">Tus datos</h3>
                  <p className="text-slate-500 text-sm mb-5">Solo te pedimos lo esencial.</p>
                </div>
                <FloatingInput
                  id="cf-name" name="name" required label="Nombre completo"
                  value={data.name} onChange={(v) => setData((d) => ({ ...d, name: v }))}
                />
                <FloatingInput
                  id="cf-email" name="email" type="email" required label="Correo electrónico"
                  value={data.email} onChange={(v) => setData((d) => ({ ...d, email: v }))}
                />
                <FloatingInput
                  id="cf-wa" name="whatsapp" type="tel" label="WhatsApp (opcional)"
                  value={data.whatsapp} onChange={(v) => setData((d) => ({ ...d, whatsapp: v }))}
                />
                <div className="relative">
                  <textarea
                    id="cf-msg" name="message" rows={4} placeholder=" "
                    value={data.message} onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
                    className="peer w-full px-4 pt-6 pb-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-slate-200 placeholder-transparent text-sm focus:outline-none focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all resize-none"
                  />
                  <label htmlFor="cf-msg" className="absolute left-4 top-4 text-slate-500 text-sm transition-all duration-200 pointer-events-none select-none peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold">
                    Cuéntame más sobre tu proyecto
                  </label>
                </div>

                {status === 'error' && (
                  <p className="text-rose-400 text-sm">Algo salió mal. Intenta de nuevo o escríbeme directo por WhatsApp.</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending' || !data.name || !data.email}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] min-h-[44px]"
                >
                  {status === 'sending' ? 'Enviando...' : 'Enviar solicitud →'}
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex justify-between mt-6 pt-5 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => step > 1 && goTo((step - 1) as Step)}
            disabled={step === 1}
            className="px-4 py-2 text-sm text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-colors min-h-[40px]"
          >
            ← Atrás
          </button>
          <button
            type="button"
            onClick={() => canNext() && goTo((step + 1) as Step)}
            disabled={!canNext()}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 min-h-[40px]"
          >
            Continuar →
          </button>
        </div>
      )}
    </div>
  )
}
