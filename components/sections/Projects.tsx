"use client";

/*
 * Projects — Hallmark midnight+amber token system
 * Removed: glass-card, grid-bg in visuals, blue/violet accent classnames
 * Added: hm-card, hm-chip, hm-heading, token-referenced colors
 * Kept: TiltCard (good interaction), FeaturedProject split layout, GenericVisual
 */

import { useRef } from "react";
import { motion, useInView, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { projects, type Project, type Lang } from "@/data/portfolio";
import { ProjectMockup } from "@/components/ProjectMockup";
import { CursorCard } from "@/components/CursorCard";
import { staggerContainer, staggerItem, staggerItemReduced, EASE_OUT, DUR } from "@/lib/motion";
import { SectionChip } from "@/components/SectionChip";

// ─── Category labels ──────────────────────────────────────────────────────────

const categoryLabels: Record<string, Record<Lang, string>> = {
  automation: { en: "Automation", es: "Automatización" },
  backend:    { en: "Backend",    es: "Backend"         },
  systems:    { en: "Systems",    es: "Sistemas"        },
  client:     { en: "Client Work",es: "Cliente"         },
  fullstack:  { en: "Full Stack", es: "Full Stack"      },
};

// ─── Fallback visual ──────────────────────────────────────────────────────────

function GenericVisual({ category }: { category: Project["category"] }) {
  const code: Record<string, string[]> = {
    automation: ["$ python run.py --target site", "> Scanning URLs...", "> Export: done ✓"],
    backend:    ["POST /auth/login     200", "GET  /users/:id    200", "PUT  /users/:id    204"],
    systems:    ["→ Init schema", "→ Seed data", "→ Deploy complete"],
    client:     ["lighthouse score: 98", "seo: 100", "performance: 95"],
    fullstack:  ["npm run build", "✓ Compiled successfully", "✓ Deployed"],
  };
  const lines = code[category] ?? code.backend;

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        border: '1px solid var(--color-rule)',
        background: 'var(--color-paper)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', width: '100%' }}>
        {lines.map((line, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              color: i === lines.length - 1 ? 'var(--color-accent)' : 'var(--color-muted)',
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Tilt card (desktop only) ─────────────────────────────────────────────────

function TiltCard({ children }: { children: React.ReactNode }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-6, 6]);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || window.innerWidth < 768) return;
    const mult = window.innerWidth < 1024 ? 0.5 : 1;
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * mult);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * mult);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

// ─── Featured project ─────────────────────────────────────────────────────────

function FeaturedProject({ project, index }: { project: Project; index: number }) {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const prefersReduced = useReducedMotion();
  const isEven = index % 2 === 0;
  const hasMockup = ['lufe-art-tattoo', 'fundacion-vida-amor-salud', 'premios-la-cima', 'siepa'].includes(project.slug);

  return (
    <CursorCard style={{ overflow: 'hidden', borderRadius: 'var(--radius-card)' }}>
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08, ease: EASE_OUT }}
      className="hm-card"
      style={{ overflow: 'hidden' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        }}
      >
        {/* Visual */}
        <div
          style={{
            padding: 'var(--space-xl)',
            display: 'flex',
            alignItems: 'center',
            order: isEven ? 1 : 2,
            borderBottom: '1px solid var(--color-rule)',
          }}
          className="lg:border-b-0"
        >
          {hasMockup
            ? <ProjectMockup slug={project.slug} />
            : <GenericVisual category={project.category} />
          }
        </div>

        {/* Content */}
        <div
          style={{
            padding: 'var(--space-2xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            order: isEven ? 2 : 1,
            borderLeft: isEven ? '1px solid var(--color-rule)' : undefined,
            borderRight: !isEven ? '1px solid var(--color-rule)' : undefined,
          }}
          className="lg:border-l lg:border-r-0"
        >
          {/* Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
            <span className="hm-chip">
              {categoryLabels[project.category]?.[lang] ?? project.category}
            </span>
            {project.realClient && (
              <span
                style={{
                  padding: '2px 10px',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  background: 'oklch(76% 0.16 65 / 0.08)',
                  border: '1px solid var(--color-accent-dim)',
                  borderRadius: 'var(--radius-pill)',
                  whiteSpace: 'nowrap',
                }}
              >
                ✓ {t("projects.realClient")}
              </span>
            )}
            <span style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)', marginLeft: 'auto' }}>
              {project.year}
            </span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-ink)',
              marginBottom: 'var(--space-xs)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
            }}
          >
            {project.title}
          </h3>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: 'var(--space-xl)' }}>
            {project.tagline[lang]}
          </p>

          {/* Problem / Solution / Impact */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {([
              ["projects.problem", project.problem[lang]],
              ["projects.solution", project.solution[lang]],
              ["projects.impact", project.impact[lang]],
            ] as [string, string][]).map(([labelKey, text]) => (
              <div key={labelKey}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-faint)', marginBottom: '2px' }}>
                  {t(labelKey)}
                </p>
                <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>

          {/* Tech stack */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-xl)' }}>
            {project.stack.map(tech => (
              <span
                key={tech}
                style={{
                  padding: '3px 8px',
                  fontSize: 'var(--text-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  color: 'var(--color-muted)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-paper)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', minHeight: '40px', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t("projects.code")}
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', minHeight: '40px', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', textDecoration: 'none' }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1v-3M10 2h4m0 0v4m0-4L8 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("projects.demo")}
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
    </CursorCard>
  );
}

// ─── Compact card ─────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: Project }) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReduced = useReducedMotion();

  return (
    <TiltCard>
      <CursorCard style={{ height: '100%', borderRadius: 'var(--radius-card)', display: 'flex', flexDirection: 'column' }}>
      <motion.article
        ref={ref}
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="hm-card"
        style={{ padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <span className="hm-chip">{categoryLabels[project.category]?.[lang] ?? project.category}</span>
          <span style={{ color: 'var(--color-faint)', fontSize: 'var(--text-xs)' }}>{project.year}</span>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-ink)',
            marginBottom: 'var(--space-xs)',
            letterSpacing: '-0.02em',
          }}
        >
          {project.title}
        </h3>
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-md)', flex: 1 }}>
          {project.tagline[lang]}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2xs)', marginBottom: 'var(--space-md)' }}>
          {project.stack.slice(0, 4).map(tech => (
            <span
              key={tech}
              style={{
                padding: '2px 8px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-faint)',
                border: '1px solid var(--color-rule)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span style={{ padding: '2px 6px', fontSize: 'var(--text-xs)', color: 'var(--color-faint)' }}>
              +{project.stack.length - 4}
            </span>
          )}
        </div>

        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--color-muted)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--font-body)',
              textDecoration: 'none',
              transition: 'color var(--dur-short) var(--ease-out)',
              minHeight: '44px',
              marginTop: 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-ink)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            Ver código
          </a>
        )}
      </motion.article>
      </CursorCard>
    </TiltCard>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Projects() {
  const { t } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReduced = useReducedMotion();

  const featured = projects.filter(p => p.featured);
  const others   = projects.filter(p => !p.featured);

  return (
    <section
      id="projects"
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
          style={{ marginBottom: 'var(--space-3xl)' }}
        >
          <SectionChip style={{ marginBottom: 'var(--space-lg)' }}>
            {t("projects.tag")}
          </SectionChip>
          <h2 className="hm-heading" style={{ marginBottom: 'var(--space-sm)', maxWidth: '22ch' }}>
            {t("projects.title")}
          </h2>
          <p className="hm-lead" style={{ maxWidth: '52ch' }}>{t("projects.subtitle")}</p>
        </motion.div>

        {/* Featured */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginBottom: 'var(--space-3xl)' }}>
          {featured.map((project, i) => (
            <FeaturedProject key={project.slug} project={project} index={i} />
          ))}
        </div>

        {/* Other projects */}
        {others.length > 0 && (
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                fontWeight: 600,
                color: 'var(--color-muted)',
                marginBottom: 'var(--space-xl)',
                letterSpacing: '-0.01em',
              }}
            >
              {t("projects.more")}
            </h3>
            <motion.div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'var(--space-md)',
              }}
              variants={prefersReduced ? undefined : staggerContainer(0.05)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {others.map(project => (
                <motion.div
                  key={project.slug}
                  variants={prefersReduced ? staggerItemReduced : staggerItem}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}
