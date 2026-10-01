'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/portal/actions'
import { Icon, type PortalIconName } from './Icon'
import { initials } from '@/lib/portal/format'

interface NavItem { label: string; href: string; icon: PortalIconName }

const investorNav: NavItem[] = [
  { label: 'Resumen', href: '/portal/dashboard', icon: 'home' },
  { label: 'Proyectos', href: '/portal/proyectos', icon: 'projects' },
  { label: 'Movimientos', href: '/portal/movimientos', icon: 'ledger' },
  { label: 'Pagos', href: '/portal/pagos', icon: 'payments' },
  { label: 'Documentos', href: '/portal/documentos', icon: 'documents' },
  { label: 'Novedades', href: '/portal/novedades', icon: 'updates' },
  { label: 'Herramientas', href: '/portal/herramientas', icon: 'tools' },
  { label: 'Perfil', href: '/portal/perfil', icon: 'profile' },
]

const adminNav: NavItem[] = [
  { label: 'Resumen', href: '/portal/admin', icon: 'home' },
  { label: 'Acuerdos', href: '/portal/admin/acuerdos', icon: 'agreements' },
  { label: 'Proyectos', href: '/portal/admin/proyectos', icon: 'projects' },
  { label: 'Movimientos', href: '/portal/admin/movimientos', icon: 'ledger' },
  { label: 'Pagos', href: '/portal/admin/pagos', icon: 'payments' },
  { label: 'Documentos', href: '/portal/admin/documentos', icon: 'documents' },
  { label: 'Novedades', href: '/portal/admin/novedades', icon: 'updates' },
  { label: 'Reportes', href: '/portal/admin/reportes', icon: 'reports' },
  { label: 'Usuarios', href: '/portal/admin/usuarios', icon: 'users' },
  { label: 'Auditoría', href: '/portal/admin/auditoria', icon: 'audit' },
]

export function PortalShell({
  fullName,
  email,
  isAdmin,
  children,
}: {
  fullName: string
  email: string
  isAdmin: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const inAdmin = pathname.startsWith('/portal/admin')
  const items = inAdmin ? adminNav : investorNav

  const navigation = (
    <>
      <div className="portal-brand">
        <span className="portal-brand-mark">DS</span>
        <span><strong>DeepSun</strong><small>Portal privado</small></span>
      </div>
      <nav className="portal-nav" aria-label={inAdmin ? 'Administración' : 'Portal'}>
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/portal/admin' && pathname.startsWith(`${item.href}/`))
          return (
            <Link key={item.href} href={item.href} className="portal-nav-link" data-active={active || undefined} onClick={() => setOpen(false)}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="portal-rail-footer">
        {isAdmin && (
          <Link className="portal-mode-switch" href={inAdmin ? '/portal/dashboard' : '/portal/admin'}>
            {inAdmin ? 'Ver portal de miembro' : 'Abrir administración'}
            <Icon name="arrow" />
          </Link>
        )}
        <div className="portal-user-compact">
          <span className="portal-avatar">{initials(fullName)}</span>
          <span><strong>{fullName}</strong><small>{email}</small></span>
        </div>
        <form action={logoutAction}>
          <button className="portal-logout" type="submit"><Icon name="logout" />Cerrar sesión</button>
        </form>
      </div>
    </>
  )

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">{navigation}</aside>
      <header className="portal-mobile-header">
        <Link href="/portal/dashboard" className="portal-mobile-brand">DeepSun</Link>
        <button type="button" className="portal-icon-button" onClick={() => setOpen(true)} aria-label="Abrir navegación" aria-expanded={open}>
          <Icon name="menu" />
        </button>
      </header>
      {open && (
        <div className="portal-drawer-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <aside className="portal-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label="Navegación móvil">
            <button type="button" className="portal-icon-button portal-drawer-close" onClick={() => setOpen(false)} aria-label="Cerrar navegación"><Icon name="close" /></button>
            {navigation}
          </aside>
        </div>
      )}
      <main id="portal-main" className="portal-main">{children}</main>
      <nav className="portal-bottom-nav" aria-label="Accesos principales">
        {(inAdmin ? adminNav.slice(0, 5) : investorNav.slice(0, 5)).map((item) => (
          <Link key={item.href} href={item.href} data-active={(pathname === item.href || pathname.startsWith(`${item.href}/`)) || undefined}>
            <Icon name={item.icon} /><span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

