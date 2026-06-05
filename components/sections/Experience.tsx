"use client";

/*
 * Experience — reframed as "Proceso" (client-facing process steps)
 * Removed: glass-card, blue/violet accent classes, résumé framing
 * Added: hm-card, amber accent on timeline + dots, agency voice copy
 * The section now reads as "how we work" not "Joshua's CV"
 */

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { experience } from "@/data/portfolio";
import type { Lang } from "@/data/portfolio";
import { SectionChip } from "@/components/SectionChip";

// ─── Dot ─────────────────────────────────────────────────────────────────────

function TimelineDot({ triggered }: { triggered: boolean }) {
  return (
    <div
      className="hidden md:flex"
      style={{
        position: 'absolute',
        left: 0,
        top: 24,
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'var(--color-paper-2)',
        border: '1px solid var(--color-rule)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {triggered && (
          <motion.div
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              opacity: 0.4,
            }}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: triggered ? 'var(--color-accent)' : 'var(--color-rule)',
            transition: 'background 0.3s',
          }}
        />
      </div>
    </div>
  );
}

// ─── Type badge color ─────────────────────────────────────────────────────────

const typeBadgeStyle = (type: string): React.CSSProperties => {
  if (type === 'freelance') return { color: 'var(--color-accent)', background: 'oklch(76% 0.16 65 / 0.08)', border: '1px solid var(--color-accent-dim)' };
  if (type === 'contract')  return { color: 'var(--color-ink)',    background: 'var(--color-paper-2)',        border: '1px solid var(--color-rule)' };
  return                           { color: 'var(--color-muted)',  background: 'var(--color-paper-2)',        border: '1px solid var(--color-rule)' };
};

// ─── Experience card ──────────────────────────────────────────────────────────

function ExperienceCard({ item, index, globalInView }: {
  item: typeof experience[number];
  index: number;
  globalInView: boolean;
}) {
  const { t, lang } = useLanguage();
  const cardRef = useRef<HTMLElement>(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-60px" });
  const [expanded, setExpanded] = useState(false);
  const triggered = globalInView && cardInView;

  return (
    <motion.article
      ref={cardRef}
      initial={{ opacity: 0, x: -16 }}
      animate={triggered ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 0.4, 0.25, 1] }}
      style={{ paddingLeft: '0' }}
      className="md:pl-12 relative"
    >
      <TimelineDot triggered={triggered} />

      <div
        onClick={() => setExpanded(p => !p)}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && setExpanded(p => !p)}
        className="hm-card"
        style={{
          padding: 'var(--space-xl)',
          cursor: 'pointer',
          borderLeft: expanded ? '2px solid var(--color-accent)' : '2px solid var(--color-rule)',
          transition: 'border-color var(--dur-med) var(--ease-out)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = 'var(--color-accent-dim)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderLeftColor = expanded ? 'var(--color-accent)' : 'var(--color-rule)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--color-ink)',
                marginBottom: '2px',
                letterSpacing: '-0.015em',
              }}
            >
              {item.role[lang as Lang]}
            </h3>
            <p style={{ color: 'var(--color-accent)', fontWeight: 500, fontSize: 'var(--text-sm)', fontFamily: 'var(--font-body)' }}>
              {item.company[lang as Lang]}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexShrink: 0 }}>
            <span
              style={{
                padding: '2px 10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                borderRadius: 'var(--radius-pill)',
                fontFamily: 'var(--font-body)',
                ...typeBadgeStyle(item.type),
              }}
            >
              {t(`experience.${item.type}`)}
            </span>
            <span style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
              {item.period}
            </span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)' }}
              aria-hidden="true"
            >
              ↓
            </motion.span>
          </div>
        </div>

        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.65, marginBottom: 'var(--space-sm)' }}>
          {item.description[lang as Lang]}
        </p>

        {/* Highlights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
          {item.highlights.map(h => (
            <span
              key={h}
              style={{
                padding: '3px 10px',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                fontFamily: 'var(--font-body)',
                color: 'var(--color-muted)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-paper)',
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Accordion */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.4, 0.25, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  paddingTop: 'var(--space-md)',
                  marginTop: 'var(--space-md)',
                  borderTop: '1px solid var(--color-rule)',
                }}
              >
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>
                  Tecnologías
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                  {item.highlights.map((h, i) => (
                    <motion.span
                      key={h}
                      initial={{ opacity: 0, scale: 0.88 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      style={{
                        padding: '2px 8px',
                        fontSize: 'var(--text-xs)',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        background: 'oklch(76% 0.16 65 / 0.06)',
                        border: '1px solid var(--color-accent-dim)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {h}
                    </motion.span>
                  ))}
                </div>
                <p style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)' }}>
                  ¿Te interesa un proyecto similar?{' '}
                  <a href="#contact" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                    Hablemos.
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Experience() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });
  const lineInView = useInView(timelineRef, { once: true, margin: "-100px" });

  return (
    <section
      id="experience"
      ref={sectionRef}
      style={{
        paddingBlock: 'var(--space-4xl)',
        paddingInline: 'var(--page-gutter)',
        background: 'var(--color-paper)',
      }}
    >
      <div className="hm-rule" style={{ marginBottom: 'var(--space-4xl)' }} />
      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
          style={{ marginBottom: 'var(--space-3xl)' }}
        >
          <SectionChip style={{ marginBottom: 'var(--space-lg)' }}>
            {t("experience.tag")}
          </SectionChip>
          <h2 className="hm-heading">
            {t("experience.title")}
          </h2>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} style={{ position: 'relative' }}>
          {/* Animated vertical line — amber */}
          <motion.div
            className="hidden md:block"
            style={{
              position: 'absolute',
              left: 15,
              top: 8,
              width: 1,
              background: `linear-gradient(to bottom, var(--color-accent), var(--color-rule), transparent)`,
              height: 'calc(100% - 16px)',
              transformOrigin: 'top',
              scaleY: 0,
            }}
            animate={lineInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.6, ease: [0.25, 0.4, 0.25, 1] }}
            aria-hidden="true"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {experience.map((item, i) => (
              <ExperienceCard key={i} item={item} index={i} globalInView={inView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
