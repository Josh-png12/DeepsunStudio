"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { experience } from "@/data/portfolio";
import type { Lang } from "@/data/portfolio";

const typeColors: Record<string, string> = {
  freelance: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  contract:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  personal:  "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

const typeBorderHover: Record<string, string> = {
  freelance: "hover:border-l-emerald-400/50",
  contract:  "hover:border-l-blue-400/50",
  personal:  "hover:border-l-violet-400/50",
};

// ─── Pulse dot ────────────────────────────────────────────────────────────────

function PulseDot({ triggered }: { triggered: boolean }) {
  return (
    <div className="absolute left-0 top-6 w-[30px] h-[30px] rounded-full glass-card border border-white/[0.1] items-center justify-center hidden md:flex z-10">
      <div className="relative flex items-center justify-center">
        {triggered && (
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-blue-400/40"
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}
        <div className="w-2 h-2 rounded-full bg-blue-400 relative" />
      </div>
    </div>
  );
}

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
      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
      animate={triggered ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      className="md:pl-12 relative"
    >
      <PulseDot triggered={triggered} />

      <div
        onClick={() => setExpanded((prev) => !prev)}
        className={`
          glass-card rounded-2xl p-6 shine cursor-pointer
          border-l-2 border-l-white/[0.07] transition-all duration-300
          hover:translate-x-1 ${typeBorderHover[item.type] ?? ""}
        `}
        style={{ transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease" }}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((p) => !p)}
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-white mb-1">
              {item.role[lang as Lang]}
            </h3>
            <p className="text-blue-400 font-medium text-sm">
              {item.company[lang as Lang]}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${typeColors[item.type] ?? ""}`}>
              {t(`experience.${item.type}`)}
            </span>
            <span className="text-slate-600 text-xs font-mono">{item.period}</span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-600 text-xs ml-1"
              aria-hidden="true"
            >
              ↓
            </motion.span>
          </div>
        </div>

        {/* Description — always visible */}
        <p className="text-slate-400 text-sm leading-relaxed mb-3">
          {item.description[lang as Lang]}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2">
          {item.highlights.map((h) => (
            <span key={h} className="px-2.5 py-1 text-xs font-medium text-slate-400 border border-white/[0.07] rounded-lg bg-white/[0.025]">
              {h}
            </span>
          ))}
        </div>

        {/* Accordion — extra detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <p className="text-[11px] text-slate-600 uppercase tracking-widest font-bold mb-2">
                  Tecnologías usadas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.highlights.map((h, i) => (
                    <motion.span
                      key={h}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-2 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-400/20 rounded-md bg-blue-400/5"
                    >
                      {h}
                    </motion.span>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-3">
                  Haz clic en{" "}
                  <a href="#contact" className="text-blue-400 hover:underline">
                    Contacto
                  </a>{" "}
                  para hablar sobre proyectos similares.
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
    <section id="experience" ref={sectionRef} className="relative py-32">
      <div className="section-divider mb-32 -mt-16" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.55 }}
          className="mb-16"
        >
          <div className="tag-pill mb-6">{t("experience.tag")}</div>
          <h2
            className="font-heading font-bold text-white leading-tight tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
          >
            {t("experience.title")}
          </h2>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Animated vertical line */}
          <motion.div
            className="absolute left-[15px] top-2 w-px bg-gradient-to-b from-blue-500/60 via-violet-500/30 to-transparent hidden md:block"
            initial={{ scaleY: 0 }}
            animate={lineInView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.8, ease: [0.25, 0.4, 0.25, 1] }}
            style={{ height: "calc(100% - 16px)", transformOrigin: "top" }}
            aria-hidden="true"
          />

          <div className="space-y-6">
            {experience.map((item, i) => (
              <ExperienceCard
                key={i}
                item={item}
                index={i}
                globalInView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
