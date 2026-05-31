"use client";

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { skillCategories, projects } from "@/data/portfolio";
import type { Lang } from "@/data/portfolio";

// ─── Skill → project count ────────────────────────────────────────────────────

function useSkillProjectMap() {
  return useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => {
      p.stack.forEach((tech) => {
        const key = tech.toLowerCase();
        map[key] = (map[key] ?? 0) + 1;
      });
    });
    return map;
  }, []);
}

// ─── Accent colours ───────────────────────────────────────────────────────────

const accentMap: Record<string, {
  text: string; border: string; bg: string;
  hoverBg: string; shadow: string; dot: string;
}> = {
  blue:    { text: "text-blue-400",    border: "border-blue-400/25",    bg: "bg-blue-400/[0.06]",    hoverBg: "hover:bg-blue-400/15",    shadow: "hover:shadow-[0_0_14px_rgba(96,165,250,0.28)]",    dot: "bg-blue-400"    },
  violet:  { text: "text-violet-400",  border: "border-violet-400/25",  bg: "bg-violet-400/[0.06]",  hoverBg: "hover:bg-violet-400/15",  shadow: "hover:shadow-[0_0_14px_rgba(167,139,250,0.28)]",  dot: "bg-violet-400"  },
  cyan:    { text: "text-cyan-400",    border: "border-cyan-400/25",    bg: "bg-cyan-400/[0.06]",    hoverBg: "hover:bg-cyan-400/15",    shadow: "hover:shadow-[0_0_14px_rgba(103,232,249,0.28)]",    dot: "bg-cyan-400"    },
  emerald: { text: "text-emerald-400", border: "border-emerald-400/25", bg: "bg-emerald-400/[0.06]", hoverBg: "hover:bg-emerald-400/15", shadow: "hover:shadow-[0_0_14px_rgba(52,211,153,0.28)]", dot: "bg-emerald-400" },
  amber:   { text: "text-amber-400",   border: "border-amber-400/25",   bg: "bg-amber-400/[0.06]",   hoverBg: "hover:bg-amber-400/15",   shadow: "hover:shadow-[0_0_14px_rgba(251,191,36,0.28)]",   dot: "bg-amber-400"   },
  rose:    { text: "text-rose-400",    border: "border-rose-400/25",    bg: "bg-rose-400/[0.06]",    hoverBg: "hover:bg-rose-400/15",    shadow: "hover:shadow-[0_0_14px_rgba(251,113,133,0.28)]",    dot: "bg-rose-400"    },
};

type SkillEntry = { skill: string; accent: string; catKey: string };

function useAllSkills(): SkillEntry[] {
  return useMemo(
    () =>
      skillCategories.flatMap((cat) =>
        cat.skills.map((skill) => ({ skill, accent: cat.accent, catKey: cat.accent }))
      ),
    []
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const TABS = [
  { key: "all",     label: { en: "All",        es: "Todos"          } },
  { key: "blue",    label: { en: "Frontend",   es: "Frontend"       } },
  { key: "violet",  label: { en: "Backend",    es: "Backend"        } },
  { key: "cyan",    label: { en: "Databases",  es: "Bases de datos" } },
  { key: "emerald", label: { en: "Automation", es: "Automatización" } },
  { key: "amber",   label: { en: "APIs",       es: "APIs"           } },
  { key: "rose",    label: { en: "DevOps",     es: "DevOps"         } },
] as const;

// ─── Single pill ──────────────────────────────────────────────────────────────

function SkillPill({
  entry, idx, projectCount, visible, prefersReduced, isMobile,
}: {
  entry: SkillEntry;
  idx: number;
  projectCount: number;
  visible: boolean;
  prefersReduced: boolean | null;
  isMobile: boolean;
}) {
  const a = accentMap[entry.accent] ?? accentMap.blue;
  const floatDur = 2.4 + (idx % 7) * 0.35;
  const floatDelay = (idx * 0.18) % 2.2;
  const shouldFloat = !prefersReduced && !isMobile;

  return (
    <AnimatePresence mode="popLayout">
      {visible && (
        <motion.div
          key={`${entry.catKey}-${entry.skill}-${idx}`}
          layout
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.75, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="relative group/pill"
        >
          {/* Tooltip — desktop/tablet only */}
          {projectCount > 0 && !isMobile && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/[0.1] text-white text-[9px] px-2 py-1 rounded-md opacity-0 group-hover/pill:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-30 shadow-lg">
              {projectCount === 1 ? "usado en 1 proyecto" : `usado en ${projectCount} proyectos`}
            </div>
          )}

          <span
            className={`
              inline-block px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 cursor-default select-none
              ${a.text} ${a.border} ${a.bg}
              ${isMobile ? '' : `${a.hoverBg} ${a.shadow}`}
              ${shouldFloat ? "skill-float" : ""}
            `}
            style={
              shouldFloat
                ? { animationDuration: `${floatDur}s`, animationDelay: `${floatDelay}s` }
                : undefined
            }
          >
            {entry.skill}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Skills() {
  const { t, lang } = useLanguage();
  const prefersReduced = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const allSkills = useAllSkills();
  const projectMap = useSkillProjectMap();

  const handleTabClick = (key: string) => {
    setActiveFilter(key);
    // On mobile: brief flash feedback (via CSS active state — no extra JS needed)
  };

  return (
    <section id="skills" ref={ref} className="relative py-32 overflow-hidden">
      <div className="section-divider mb-32 -mt-16" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/[0.04] rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.55 }}
          className="mb-10"
        >
          <div className="tag-pill mb-6">{t("skills.tag")}</div>
          <h2
            className="font-heading font-bold text-white leading-tight tracking-tight"
            style={{ fontSize: "clamp(28px, 4vw, 52px)" }}
          >
            {t("skills.title")}
          </h2>
        </motion.div>

        {/* Filter tabs — scrollable on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10"
        >
          <div
            className="skills-tabs-scroll flex gap-2 pb-1"
            role="group"
            aria-label="Filtrar habilidades por categoría"
          >
            {TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              const accent = tab.key !== "all" ? accentMap[tab.key] : null;

              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`
                    flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[36px]
                    active:scale-95
                    ${isActive
                      ? accent
                        ? `${accent.text} ${accent.bg} ${accent.border} border`
                        : "text-white bg-white/[0.08] border border-white/[0.15]"
                      : "text-slate-500 hover:text-slate-300 border border-white/[0.07] hover:border-white/[0.12]"
                    }
                  `}
                  aria-pressed={isActive}
                >
                  {tab.label[lang as Lang]}
                  {isActive && (
                    <motion.span
                      layoutId="skill-tab-indicator"
                      className="inline-block w-1 h-1 rounded-full bg-current ml-2 align-middle"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Skill cloud */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap gap-2.5 min-h-[80px]"
        >
          {allSkills.map((entry, idx) => {
            const visible = activeFilter === "all" || entry.catKey === activeFilter;
            const count = projectMap[entry.skill.toLowerCase()] ?? 0;

            return (
              <SkillPill
                key={`${entry.catKey}-${entry.skill}-${idx}`}
                entry={entry}
                idx={idx}
                projectCount={count}
                visible={visible}
                prefersReduced={prefersReduced}
                isMobile={isMobile}
              />
            );
          })}
        </motion.div>

        {/* Category legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          {skillCategories.map((cat) => {
            const a = accentMap[cat.accent] ?? accentMap.blue;
            return (
              <button
                key={cat.accent}
                onClick={() => setActiveFilter(activeFilter === cat.accent ? "all" : cat.accent)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group"
              >
                <div className={`w-2 h-2 rounded-full ${a.dot} group-hover:scale-125 transition-transform`} />
                {cat.label[lang as Lang]}
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
