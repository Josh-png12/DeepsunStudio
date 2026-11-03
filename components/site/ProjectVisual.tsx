'use client'

import { useSite } from '@/lib/site-i18n'
import type { CaseMeta } from '@/lib/site-content'

const BARS = [42, 65, 58, 88, 71, 96, 79]

/** Conceptual CSS compositions — never screenshots of delivered products. */
export default function ProjectVisual({ visual, label, tall = false }: { visual: CaseMeta['visual']; label: string; tall?: boolean }) {
  const { lang } = useSite()
  const es = lang === 'es'
  const cls = tall ? ' tall' : ''

  if (visual === 'lufe')
    return (
      <div className={`project-visual proj-lufe${cls}`} role="img" aria-label={label}>
        <div className="chrome"><span>LUFE® / TATTOO STUDIO</span><div className="dots"><i /><i /><i /></div><span>MENU ⊕</span></div>
        <div className="lufe-lines" /><div className="lufe-arc" />
        <div className="lufe-center"><small>INK / ART / EXPRESSION</small><strong>LUFE</strong><span>{es ? 'El arte vive en la piel.' : 'Art lives on the skin.'}</span></div>
        <div className="lufe-badge">{es ? 'EXPERIENCIA' : 'WEB'}<br />{es ? 'WEB · 2024' : 'EXPERIENCE · 2024'}</div>
      </div>
    )

  if (visual === 'fund')
    return (
      <div className={`project-visual proj-fund${cls}`} role="img" aria-label={label}>
        <div className="chrome"><span>VIDA AMOR Y SALUD</span><span>{es ? 'COMPARTIR ES CUIDAR ↗' : 'SHARING IS CARING ↗'}</span></div>
        <div className="fund-oval" />
        <div className="fund-title">{es ? 'Cada gesto' : 'Every gesture'}<em>{es ? 'transforma vidas.' : 'changes lives.'}</em></div>
        <span className="fund-pill">{es ? 'Conoce nuestra misión ↗' : 'Discover our mission ↗'}</span>
        <div className="fund-flower" aria-hidden="true"><span /><span /><span /><span /><span /><i /></div>
      </div>
    )

  if (visual === 'siepa')
    return (
      <div className={`project-visual proj-siepa${cls}`} role="img" aria-label={label}>
        <div className="dash">
          <div className="dash-sidebar"><strong>SIEPA /</strong><span className="active">▦ {es ? 'Panel' : 'Panel'}</span><span>◯ {es ? 'Personas' : 'People'}</span><span>▤ {es ? 'Reportes' : 'Reports'}</span><span>⌁ {es ? 'Ajustes' : 'Settings'}</span></div>
          <div className="dash-content">
            <div className="dash-top"><span>{es ? 'PANEL DE CONTROL' : 'CONTROL PANEL'}</span><span>● {es ? 'Sistema activo' : 'System active'}</span></div>
            <div className="dash-greeting">{es ? 'Todo bajo control.' : 'Everything under control.'}</div>
            <div className="dash-chart">{BARS.map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
            <div className="dash-cards"><span /><span /><span /></div>
          </div>
        </div>
      </div>
    )

  if (visual === 'cima')
    return (
      <div className={`project-visual proj-cima${cls}`} role="img" aria-label={label}>
        <div className="chrome"><span>PREMIOS LA CIMA</span><span>GALA / 2026</span></div>
        <div className="cima-circle" />
        <div className="cima-title">LA<br />CIMA</div>
        <div className="cima-sub">{es ? 'RECONOCER LO EXTRAORDINARIO' : 'RECOGNIZING THE EXTRAORDINARY'}</div>
      </div>
    )

  if (visual === 'scraper')
    return (
      <div className={`project-visual proj-scraper${cls}`} role="img" aria-label={label}>
        <div className="chrome"><span>SCRAPER / {es ? 'EJECUCIÓN' : 'RUN'} 014</span><div className="dots"><i /><i /><i /></div><span>● {es ? 'LISTO' : 'READY'}</span></div>
        <div className="scr-grid">
          {Array.from({ length: 7 }).map((_, r) => (
            <div key={r} className="scr-row"><i style={{ width: `${18 + ((r * 13) % 22)}%` }} /><i style={{ width: `${30 + ((r * 17) % 30)}%` }} /><i style={{ width: `${10 + ((r * 7) % 16)}%` }} /></div>
          ))}
        </div>
        <div className="scr-export"><b>CSV</b><b>JSON</b><b>XLSX</b></div>
        <div className="scr-big">{es ? <>Datos,<br />sin copiar.</> : <>Data,<br />no copy-paste.</>}</div>
      </div>
    )

  return (
    <div className={`project-visual proj-users${cls}`} role="img" aria-label={label}>
      <div className="chrome"><span>MS-USUARIOS / ACCESS</span><span>{es ? 'PERMISOS' : 'PERMISSIONS'}</span></div>
      <div className="usr-ring one" /><div className="usr-ring two" />
      <div className="usr-core">✳</div>
      <div className="usr-roles"><b>ADMIN</b><b>EDITOR</b><b>VIEWER</b></div>
      <div className="usr-title">{es ? <>Cada quien,<br />lo suyo.</> : <>Everyone,<br />their own.</>}</div>
    </div>
  )
}
