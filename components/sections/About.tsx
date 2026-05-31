"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { stats } from "@/data/portfolio";

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

  return (
    <section id="about" ref={ref} className="relative py-32 overflow-hidden">
      {/* Divider */}
      <div className="section-divider mb-32 -mt-16" />

      {/* Background glow */}
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-blue-600/[0.04] rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-start">

          {/* ── Left: Text ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
          >
            <div className="tag-pill mb-6">{t("about.tag")}</div>

            <h2
              className="font-heading font-bold text-white leading-tight tracking-tight mb-8"
              style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
            >
              {t("about.title")}
            </h2>

            <div className="space-y-5">
              <p className="text-slate-400 text-[17px] leading-relaxed">
                {t("about.p1")}
              </p>
              <p className="text-slate-300 text-[17px] leading-relaxed pl-4 border-l-2 border-blue-500/40">
                {t("about.p2")}
              </p>
            </div>

            {/* Services mini-list */}
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                { label: "Sitios web para negocios", color: "text-blue-400" },
                { label: "Automatización & WhatsApp", color: "text-violet-400" },
                { label: "Sistemas a medida", color: "text-cyan-400" },
                { label: "SEO & Posicionamiento", color: "text-emerald-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className={`flex-shrink-0 ${item.color}`}>
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-slate-400 text-sm">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Tech stack mini-list */}
            <div className="mt-8 flex flex-wrap gap-2">
              {["Next.js", "Node.js", "Python", "TypeScript", "PostgreSQL", "REST APIs"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 border border-white/[0.08] rounded-lg bg-white/[0.025]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ── Right: Stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.25, 0.4, 0.25, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            {statItems.map(({ key, value, suffix }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="glass-card rounded-2xl p-6 shine"
              >
                <p className="font-heading text-4xl font-bold text-white mb-1 gradient-text-blue">
                  <AnimatedCounter target={value} suffix={suffix} />
                </p>
                <p className="text-slate-500 text-sm font-medium">{t(key)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
