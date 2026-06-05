"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { stats } from "@/data/portfolio";
import { CursorCard } from "@/components/CursorCard";
import { staggerContainer, staggerItem, staggerItemReduced, EASE_OUT, DUR } from "@/lib/motion";
import { BrandMark } from "@/components/BrandMark";

// ─── Animated counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) { setVal(target); return; }
    const start = performance.now();
    const dur = 1500;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, prefersReduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}{suffix}
    </span>
  );
}

// ─── Stat items ───────────────────────────────────────────────────────────────

const statItems = [
  { key: "about.stat.projects", value: stats.projectsBuilt, suffix: "+" },
  { key: "about.stat.clients",  value: stats.realClients,   suffix: "+" },
  { key: "about.stat.years",    value: stats.yearsExperience, suffix: "+" },
  { key: "about.stat.tech",     value: stats.technologies,  suffix: "+" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export default function About() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();

  return (
    <section id="about" ref={ref} style={{
      paddingBlock: 'var(--space-4xl)',
      paddingInline: 'var(--page-gutter)',
      background: 'var(--color-paper)',
    }}>
      <div className="hm-rule" style={{ marginBottom: 'var(--space-4xl)' }} />

      <div style={{ maxWidth: 'var(--page-max)', margin: '0 auto' }}>
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">

          {/* ── Left: Text ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <span className="hm-chip" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex' }}>
              <BrandMark size="icon" color="var(--color-accent)" />
              {t("about.tag")}
            </span>

            <h2 className="hm-heading" style={{ marginBottom: 'var(--space-xl)' }}>
              {t("about.title")}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-md)', lineHeight: 1.65 }}>
                {t("about.p1")}
              </p>
              <p style={{
                color: 'var(--color-ink)',
                fontSize: 'var(--text-md)',
                lineHeight: 1.65,
                paddingLeft: 'var(--space-md)',
                borderLeft: '2px solid var(--color-accent)',
              }}>
                {t("about.p2")}
              </p>
              <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-base)', lineHeight: 1.65 }}>
                {t("about.p3")}
              </p>
            </div>

            {/* Services list */}
            <div className="about-services-grid" style={{ marginTop: 'var(--space-2xl)' }}>
              {[
                "Sitios web para negocios",
                "Automatización & WhatsApp",
                "Sistemas a medida",
                "SEO & Posicionamiento",
              ].map((label) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                  <span className="hm-accent-mark" />
                  <span style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Tech stack */}
            <div style={{ marginTop: 'var(--space-xl)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
              {["Next.js", "Node.js", "Python", "TypeScript", "PostgreSQL", "REST APIs"].map((tech) => (
                <span
                  key={tech}
                  style={{
                    padding: '4px 10px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--color-muted)',
                    border: '1px solid var(--color-rule)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-paper-2)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Stats — stagger + hover lift + cursor spotlight ── */}
          <motion.div
            variants={prefersReduced ? undefined : staggerContainer(0.18)}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="about-stats-grid"
          >
            {statItems.map(({ key, value, suffix }, i) => (
              <motion.div
                key={key}
                variants={prefersReduced ? staggerItemReduced : staggerItem}
                whileHover={prefersReduced ? undefined : { y: -3 }}
                transition={{ duration: DUR.short, ease: EASE_OUT }}
              >
                <CursorCard
                  className="hm-card"
                  style={{ padding: 'var(--space-xl)', height: '100%' }}
                >
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 800,
                  color: 'var(--color-ink)',
                  lineHeight: 1,
                  marginBottom: 'var(--space-2xs)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  <AnimatedCounter target={value} suffix={suffix} />
                </p>
                <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                  {t(key)}
                </p>
                </CursorCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
