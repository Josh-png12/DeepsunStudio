"use client";

/*
 * Skills — renamed to "Stack" (agency framing)
 * Removed: skill-float animation (removed from globals), blue/violet glow shadows,
 *          tag-pill, section-divider, background glow div
 * Added: hm-chip, hm-rule, token-referenced tab styles, amber active state
 * Kept: filter tabs (functional), tooltip on desktop, AnimatePresence transitions
 */

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { skillCategories, projects } from "@/data/portfolio";
import type { Lang } from "@/data/portfolio";
import { SectionChip } from "@/components/SectionChip";

function useSkillProjectMap() {
  return useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach(p => p.stack.forEach(tech => {
      const key = tech.toLowerCase();
      map[key] = (map[key] ?? 0) + 1;
    }));
    return map;
  }, []);
}

type SkillEntry = { skill: string; accent: string; catKey: string };

function useAllSkills(): SkillEntry[] {
  return useMemo(
    () => skillCategories.flatMap(cat =>
      cat.skills.map(skill => ({ skill, accent: cat.accent, catKey: cat.accent }))
    ),
    []
  );
}

const TABS = [
  { key: "all",     label: { en: "All",        es: "Todos"          } },
  { key: "blue",    label: { en: "Frontend",   es: "Frontend"       } },
  { key: "violet",  label: { en: "Backend",    es: "Backend"        } },
  { key: "cyan",    label: { en: "Databases",  es: "Bases de datos" } },
  { key: "emerald", label: { en: "Automation", es: "Automatización" } },
  { key: "amber",   label: { en: "APIs",       es: "APIs"           } },
  { key: "rose",    label: { en: "DevOps",     es: "DevOps"         } },
] as const;

// Map category accent keys to a single restrained display color
const pillColor = (accent: string): React.CSSProperties => ({
  color: 'var(--color-muted)',
  border: '1px solid var(--color-rule)',
  background: 'var(--color-paper-2)',
});

const pillColorActive = (accent: string): React.CSSProperties => ({
  color: 'var(--color-accent)',
  border: '1px solid var(--color-accent-dim)',
  background: 'oklch(76% 0.16 65 / 0.06)',
});

function SkillPill({ entry, idx, projectCount, visible, isMobile }: {
  entry: SkillEntry;
  idx: number;
  projectCount: number;
  visible: boolean;
  isMobile: boolean;
}) {
  return (
    <AnimatePresence mode="popLayout">
      {visible && (
        <motion.div
          key={`${entry.catKey}-${entry.skill}-${idx}`}
          layout
          initial={{ scale: 0.85, opacity: 0, y: 6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{
            duration: 0.22,
            delay: Math.min(idx * 0.018, 0.48), // stagger capped at 480ms
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ position: 'relative' }}
          className="group/pill"
        >
          {/* Usage tooltip — desktop only */}
          {projectCount > 0 && !isMobile && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-paper-3)',
                border: '1px solid var(--color-rule)',
                color: 'var(--color-ink)',
                fontSize: 'var(--text-xs)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                opacity: 0,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 'var(--z-tooltip)',
                boxShadow: '0 4px 12px oklch(0% 0 0 / 0.3)',
              }}
              className="group-hover/pill:opacity-100 transition-opacity duration-150"
            >
              {projectCount === 1 ? `1 proyecto` : `${projectCount} proyectos`}
            </div>
          )}

          <span
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-card)',
              cursor: 'default',
              userSelect: 'none',
              transition: 'color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out)',
              ...pillColor(entry.accent),
            }}
            onMouseEnter={e => {
              Object.assign(e.currentTarget.style, pillColorActive(entry.accent));
            }}
            onMouseLeave={e => {
              Object.assign(e.currentTarget.style, pillColor(entry.accent));
            }}
          >
            {entry.skill}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Skills() {
  const { t, lang } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const allSkills = useAllSkills();
  const projectMap = useSkillProjectMap();

  return (
    <section
      id="skills"
      ref={ref}
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
          style={{ marginBottom: 'var(--space-2xl)' }}
        >
          <SectionChip style={{ marginBottom: 'var(--space-lg)' }}>
            {t("skills.tag")}
          </SectionChip>
          <h2 className="hm-heading">{t("skills.title")}</h2>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.12 }}
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <div
            className="hm-scroll-x"
            style={{ display: 'flex', gap: 'var(--space-xs)', paddingBottom: 4 }}
            role="group"
            aria-label="Filtrar por categoría"
          >
            {TABS.map(tab => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  aria-pressed={isActive}
                  style={{
                    flexShrink: 0,
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-card)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    minHeight: '36px',
                    transition: 'all var(--dur-short) var(--ease-out)',
                    ...(isActive
                      ? { color: 'var(--color-accent)', background: 'oklch(76% 0.16 65 / 0.08)', border: '1px solid var(--color-accent-dim)' }
                      : { color: 'var(--color-faint)', background: 'transparent', border: '1px solid var(--color-rule)' }
                    ),
                  }}
                >
                  {tab.label[lang as Lang]}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Skill cloud */}
        {/* Chips stagger on initial view; AnimatePresence handles filter transitions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.22 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', minHeight: 80 }}
        >
          {allSkills.map((entry, idx) => {
            const visible = activeFilter === "all" || entry.catKey === activeFilter;
            const count = projectMap[entry.skill.toLowerCase()] ?? 0;
            return (
              <SkillPill
                key={`${entry.catKey}-${entry.skill}-${idx}`}
                entry={entry} idx={idx}
                projectCount={count} visible={visible} isMobile={isMobile ?? false}
              />
            );
          })}
        </motion.div>

        {/* Category legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.38 }}
          style={{ marginTop: 'var(--space-xl)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)' }}
        >
          {skillCategories.map(cat => (
            <button
              key={cat.accent}
              onClick={() => setActiveFilter(activeFilter === cat.accent ? "all" : cat.accent)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                color: activeFilter === cat.accent ? 'var(--color-ink)' : 'var(--color-faint)',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                transition: 'color var(--dur-short) var(--ease-out)',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
              onMouseLeave={e => { e.currentTarget.style.color = activeFilter === cat.accent ? 'var(--color-ink)' : 'var(--color-faint)' }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: activeFilter === cat.accent ? 'var(--color-accent)' : 'var(--color-rule)',
                  transition: 'background var(--dur-short) var(--ease-out)',
                  flexShrink: 0,
                }}
              />
              {cat.label[lang as Lang]}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
