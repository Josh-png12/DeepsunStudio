"use client";

/*
 * Contact — token-consistent, Hallmark midnight+amber
 * Removed: AvatarStack (fake initials), glass-card, blue accent classes
 * Added: amber accent on WhatsApp border, hm-card surfaces, btn-primary submit
 * Copy: specific verbs, no startup clichés
 */

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { staggerContainer, staggerItem, staggerItemReduced, EASE_OUT, DUR } from "@/lib/motion";
import { CursorCard } from "@/components/CursorCard";
import { SectionChip } from "@/components/SectionChip";

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

// ─── Animated checkmark ───────────────────────────────────────────────────────

function CheckMark() {
  return (
    <motion.svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0" aria-hidden="true">
      <motion.path
        d="M4 10.5l4.5 4.5 7.5-8"
        stroke="oklch(72% 0.15 150)"
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

function RippleSubmit({ disabled, children, sending }: {
  disabled?: boolean;
  children: React.ReactNode;
  sending?: boolean;
}) {
  const [ripples, setRipples] = useState<RippleEntry[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  };

  return (
    <button
      type="submit"
      disabled={disabled}
      onClick={handleClick}
      className="btn-primary"
      style={{
        width: '100%',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: 'none',
      }}
    >
      {ripples.map(r => (
        <span
          key={r.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: r.x, top: r.y,
            width: 220, height: 220,
            background: 'oklch(100% 0 0 / 0.15)',
            animation: 'ripple-out 0.7s ease-out forwards',
            transform: 'translate(-50%, -50%)',
          }}
          aria-hidden="true"
        />
      ))}
      {children}
    </button>
  );
}

// ─── Floating label input ─────────────────────────────────────────────────────

function FloatingInput({ id, name, type = "text", required, label }: {
  id: string; name: string; type?: string; required?: boolean; label: string;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={type}
        name={name}
        required={required}
        placeholder=" "
        style={{
          width: '100%',
          padding: '24px 16px 8px',
          background: 'var(--color-paper)',
          border: '1px solid var(--color-rule)',
          borderRadius: 'var(--radius-card)',
          color: 'var(--color-ink)',
          fontSize: 'var(--text-base)',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          minHeight: '56px',
          transition: 'border-color var(--dur-short) var(--ease-out)',
          boxSizing: 'border-box',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}
        className="peer"
      />
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          left: 16,
          top: 16,
          color: 'var(--color-faint)',
          fontSize: 'var(--text-base)',
          pointerEvents: 'none',
          transition: 'top 0.15s, font-size 0.15s, color 0.15s',
          userSelect: 'none',
        }}
        className="peer-focus:top-[6px] peer-focus:text-[10px] peer-focus:[color:var(--color-accent)] peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:[color:var(--color-muted)]"
      >
        {label}
      </label>
    </div>
  );
}

// ─── Contact links ────────────────────────────────────────────────────────────

const CONTACT_LINKS = [
  {
    label: "WhatsApp",
    sublabel: "+57 319 714 9647",
    href: "https://wa.me/573197149647",
    icon: <IconWhatsApp />,
    accentColor: 'oklch(72% 0.15 150)',  // green
    isWhatsApp: true,
  },
  {
    label: "joshua@deepsunstudio.com",
    sublabel: "Correo",
    href: "mailto:joshua@deepsunstudio.com",
    icon: <IconEmail />,
    accentColor: 'var(--color-accent)',
    isWhatsApp: false,
  },
  {
    label: "LinkedIn",
    sublabel: "joshua-navarro-rad",
    href: "https://www.linkedin.com/in/joshua-navarro-rad-06ab18258",
    icon: <IconLinkedIn />,
    accentColor: 'var(--color-accent)',
    isWhatsApp: false,
  },
];

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Contact() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [formState, setFormState] = useState<FormState>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setFormState("sending");
    await new Promise(r => setTimeout(r, 1200));
    try {
      // Wire up EmailJS here when ready:
      // const emailjs = (await import('@emailjs/browser')).default
      // await emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', formRef.current!, 'PUBLIC_KEY')
      setFormState("success");
      formRef.current.reset();
    } catch {
      setFormState("error");
    }
  };

  const prefersReduced = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: prefersReduced ? 0 : 16 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: {
      duration: prefersReduced ? 0.01 : 0.45,
      delay: prefersReduced ? 0 : delay,
      ease: EASE_OUT as unknown as string,
    },
  });

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        paddingBlock: 'var(--space-4xl)',
        paddingInline: 'var(--page-gutter)',
        background: 'var(--color-paper)',
      }}
    >
      <div className="hm-rule" style={{ marginBottom: 'var(--space-4xl)' }} />

      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'var(--space-3xl)',
          }}
        >

          {/* ── Left: copy + contact methods ── */}
          <motion.div {...fadeUp(0)}>
            <SectionChip style={{ marginBottom: 'var(--space-xl)' }}>
              {t("contact.tag")}
            </SectionChip>

            <h2 className="hm-heading" style={{ marginBottom: 'var(--space-md)' }}>
              {t("contact.title")}
            </h2>
            <p
              className="hm-lead"
              style={{ marginBottom: 'var(--space-2xl)', maxWidth: '44ch' }}
            >
              {t("contact.subtitle")}
            </p>

            {/* Contact links — stagger + cursor spotlight */}
            <motion.div
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
              variants={prefersReduced ? undefined : staggerContainer(0.12)}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
            >
              {CONTACT_LINKS.map(({ label, sublabel, href, icon, accentColor, isWhatsApp }) => (
                <motion.div
                  key={label}
                  variants={prefersReduced ? staggerItemReduced : staggerItem}
                  whileHover={prefersReduced ? undefined : { y: -2 }}
                  transition={{ duration: DUR.short, ease: EASE_OUT }}
                >
                <CursorCard style={{ borderRadius: 'var(--radius-card)' }}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: 'var(--color-surface)',
                    border: `1px solid var(--color-rule)`,
                    borderRadius: 'var(--radius-card)',
                    textDecoration: 'none',
                    transition: 'border-color var(--dur-short) var(--ease-out)',
                    cursor: 'pointer',
                    minHeight: '64px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = isWhatsApp
                      ? 'oklch(72% 0.15 150 / 0.4)'
                      : 'var(--color-accent-dim)'
                  }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}
                >
                  <span style={{ color: accentColor, flexShrink: 0 }}>
                    {icon}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      color: 'var(--color-ink)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      fontFamily: 'var(--font-body)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </p>
                    {sublabel && label !== sublabel && (
                      <p style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)' }}>
                        {sublabel}
                      </p>
                    )}
                  </div>
                  <svg
                    style={{ marginLeft: 'auto', color: 'var(--color-faint)', flexShrink: 0 }}
                    width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                </CursorCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: form ── */}
          <motion.div {...fadeUp(0.12)}>
            <CursorCard style={{ borderRadius: 'var(--radius-card)' }}>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="hm-card"
              style={{ padding: 'var(--space-2xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', position: 'relative', overflow: 'hidden' }}
            >
              <FloatingInput id="contact-name"    name="name"    required label={t("contact.form.name")} />
              <FloatingInput id="contact-email"   name="email"   type="email" required label={t("contact.form.email")} />

              {/* Textarea */}
              <div style={{ position: 'relative' }}>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder=" "
                  style={{
                    width: '100%',
                    padding: '24px 16px 8px',
                    background: 'var(--color-paper)',
                    border: '1px solid var(--color-rule)',
                    borderRadius: 'var(--radius-card)',
                    color: 'var(--color-ink)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    resize: 'none',
                    transition: 'border-color var(--dur-short) var(--ease-out)',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-rule)' }}
                  className="peer"
                />
                <label
                  htmlFor="contact-message"
                  style={{
                    position: 'absolute',
                    left: 16, top: 16,
                    color: 'var(--color-faint)',
                    fontSize: 'var(--text-base)',
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                  className="peer-focus:top-[6px] peer-focus:text-[10px] peer-focus:[color:var(--color-accent)] peer-[:not(:placeholder-shown)]:top-[6px] peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:[color:var(--color-muted)]"
                >
                  {t("contact.form.message")}
                </label>
              </div>

              <p style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)', marginTop: 'calc(var(--space-xs) * -1)' }}>
                {t("contact.form.message.placeholder")}
              </p>

              {/* Status */}
              <AnimatePresence mode="wait">
                {formState === "success" && (
                  <motion.p
                    key="success"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: 'oklch(72% 0.15 150)', fontSize: 'var(--text-sm)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}
                  >
                    <CheckMark />
                    {t("contact.form.success")}
                  </motion.p>
                )}
                {formState === "error" && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
                  >
                    {t("contact.form.error")}
                  </motion.p>
                )}
              </AnimatePresence>

              <RippleSubmit disabled={formState === "sending" || formState === "success"} sending={formState === "sending"}>
                {formState === "sending" ? t("contact.form.sending") : t("contact.form.submit")}
              </RippleSubmit>
            </form>
            </CursorCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
