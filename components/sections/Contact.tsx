"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { MagneticButton } from "@/lib/MagneticButton";

type FormState = "idle" | "sending" | "success" | "error";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconEmail() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#3b82f6", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#22d3ee"];

function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-10" aria-hidden="true">
      {CONFETTI_COLORS.map((color, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-sm"
          style={{ background: color, left: `${8 + i * 15}%`, top: "18%" }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: [0, -20, 180],
            opacity: [1, 1, 0],
            rotate: (i % 2 === 0 ? 1 : -1) * 240,
            x: [(i % 3 === 0 ? 1 : -1) * (8 + i * 4), 0],
          }}
          transition={{ duration: 1.4, delay: i * 0.08, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

// ─── Animated checkmark ───────────────────────────────────────────────────────

function CheckMark() {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <motion.path
        d="M4 10.5l4.5 4.5 7.5-8"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

// ─── Ripple button ────────────────────────────────────────────────────────────

interface RippleEntry { id: number; x: number; y: number }

function RippleButton({
  type,
  disabled,
  children,
  className,
}: {
  type?: "submit" | "button" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const [ripples, setRipples] = useState<RippleEntry[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
  };

  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={handleClick}
      className={`relative overflow-hidden ${className ?? ""}`}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: 220,
            height: 220,
            animation: "ripple-out 0.7s ease-out forwards",
          }}
          aria-hidden="true"
        />
      ))}
      {children}
    </button>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────

function FloatingInput({
  id, name, type = "text", required, label,
}: {
  id: string; name: string; type?: string; required?: boolean; label: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        placeholder=" "
        className="
          peer w-full px-4 pt-6 pb-2 bg-white/[0.04] border border-white/[0.08] rounded-xl
          text-slate-200 placeholder-transparent text-sm
          focus:outline-none focus:border-blue-500/60
          focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
          transition-all min-h-[56px]
        "
      />
      <label
        htmlFor={id}
        className="
          absolute left-4 top-4 text-slate-500 text-sm transition-all duration-200 pointer-events-none select-none
          peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400 peer-focus:font-semibold
          peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px]
          peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold
        "
      >
        {label}
      </label>
    </div>
  );
}

// ─── Avatar stack ─────────────────────────────────────────────────────────────

const AVATAR_CONFIG = [
  { initials: "MR", color: "bg-blue-600"   },
  { initials: "CL", color: "bg-violet-600" },
  { initials: "JP", color: "bg-emerald-600"},
  { initials: "AL", color: "bg-amber-600"  },
];

function AvatarStack() {
  return (
    <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.06]">
      <div className="flex -space-x-2.5">
        {AVATAR_CONFIG.map(({ initials, color }, i) => (
          <motion.div
            key={initials}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className={`w-8 h-8 rounded-full ${color} border-2 border-[#08091a] flex items-center justify-center text-[9px] font-bold text-white select-none flex-shrink-0`}
            title={initials}
          >
            {initials}
          </motion.div>
        ))}
      </div>
      <p className="text-slate-500 text-xs leading-snug">
        Más de 6 negocios ya confían en{" "}
        <span className="text-slate-400 font-medium">Joshua</span>
      </p>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Contact() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [formState, setFormState] = useState<FormState>("idle");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setFormState("sending");

    const data = new FormData(formRef.current);
    void { name: data.get("name"), email: data.get("email"), message: data.get("message") };

    await new Promise((r) => setTimeout(r, 1200));

    try {
      // Uncomment to wire up EmailJS:
      // const emailjs = (await import('@emailjs/browser')).default
      // await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formRef.current!, 'YOUR_PUBLIC_KEY')
      setFormState("success");
      setShowConfetti(true);
      formRef.current.reset();
      setTimeout(() => setShowConfetti(false), 2000);
    } catch {
      setFormState("error");
    }
  };

  const links = [
    {
      label: "WhatsApp",
      sublabel: "+57 397 149 647",
      href: "https://wa.me/57397149647",
      icon: <IconWhatsApp />,
      isWhatsApp: true,
    },
    {
      label: "joshuanavarro933@gmail.com",
      sublabel: "Email",
      href: "mailto:joshuanavarro933@gmail.com",
      icon: <IconEmail />,
      isWhatsApp: false,
    },
    {
      label: "LinkedIn",
      sublabel: "joshua-navarro-rad",
      href: "https://www.linkedin.com/in/joshua-navarro-rad-06ab18258",
      icon: <IconLinkedIn />,
      isWhatsApp: false,
    },
  ];

  return (
    <section id="contact" ref={ref} className="relative py-32 overflow-hidden">
      <div className="section-divider mb-32 -mt-16" />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/[0.05] rounded-full blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24">

          {/* ── Left: Text + Links ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="tag-pill mb-6">{t("contact.tag")}</div>

            <h2
              className="font-heading font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
            >
              {t("contact.title")}
            </h2>
            <p className="text-slate-400 text-[17px] leading-relaxed mb-10 max-w-md">
              {t("contact.subtitle")}
            </p>

            {/* Contact links */}
            <div className="space-y-3">
              {links.map(({ label, sublabel, href, icon, isWhatsApp }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`
                    flex items-center gap-4 p-4 glass-card rounded-xl
                    border transition-all group shine cursor-pointer
                    ${isWhatsApp
                      ? "border-emerald-500/[0.2] hover:border-emerald-500/[0.35] wa-pulse"
                      : "border-white/[0.07] hover:border-white/[0.14]"
                    }
                  `}
                >
                  <div
                    className={`flex-shrink-0 transition-colors ${
                      isWhatsApp
                        ? "text-emerald-400"
                        : "text-slate-500 group-hover:text-blue-400"
                    }`}
                  >
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-300 group-hover:text-white transition-colors text-sm font-medium truncate">
                      {label}
                    </p>
                    {sublabel && label !== sublabel && (
                      <p className="text-slate-600 text-xs mt-0.5">{sublabel}</p>
                    )}
                  </div>
                  <svg
                    className="ml-auto text-slate-700 group-hover:text-slate-400 transition-colors flex-shrink-0"
                    width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              ))}
            </div>

            <AvatarStack />
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-7 space-y-5 relative"
            >
              {/* Confetti overlay */}
              <Confetti show={showConfetti} />

              {/* Floating label inputs */}
              <FloatingInput
                id="contact-name"
                name="name"
                required
                label={t("contact.form.name")}
              />
              <FloatingInput
                id="contact-email"
                name="email"
                type="email"
                required
                label={t("contact.form.email")}
              />

              {/* Textarea with floating label */}
              <div className="relative">
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder=" "
                  className="
                    peer w-full px-4 pt-6 pb-2 bg-white/[0.04] border border-white/[0.08] rounded-xl
                    text-slate-200 placeholder-transparent text-sm
                    focus:outline-none focus:border-blue-500/60
                    focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
                    transition-all resize-none
                  "
                />
                <label
                  htmlFor="contact-message"
                  className="
                    absolute left-4 top-4 text-slate-500 text-sm transition-all duration-200 pointer-events-none select-none
                    peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-blue-400 peer-focus:font-semibold
                    peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px]
                    peer-[:not(:placeholder-shown)]:text-slate-400 peer-[:not(:placeholder-shown)]:font-semibold
                  "
                >
                  {t("contact.form.message")}
                </label>
              </div>

              {/* Placeholder hint */}
              <p className="text-slate-600 text-[11px] -mt-2 px-1">
                {t("contact.form.message.placeholder")}
              </p>

              {/* Status messages */}
              <AnimatePresence mode="wait">
                {formState === "success" && (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-emerald-400 text-sm font-medium flex items-center gap-2"
                  >
                    <CheckMark />
                    {t("contact.form.success")}
                  </motion.p>
                )}
                {formState === "error" && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-rose-400 text-sm font-medium"
                  >
                    {t("contact.form.error")}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Ripple submit button */}
              <RippleButton
                type="submit"
                disabled={formState === "sending" || formState === "success"}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] min-h-[44px]"
              >
                {formState === "sending"
                  ? t("contact.form.sending")
                  : t("contact.form.submit")}
              </RippleButton>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
