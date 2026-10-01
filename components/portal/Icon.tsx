import type { SVGProps } from 'react'

export type PortalIconName =
  | 'home' | 'projects' | 'ledger' | 'payments' | 'documents' | 'updates'
  | 'tools' | 'profile' | 'security' | 'agreements' | 'reports' | 'users'
  | 'audit' | 'menu' | 'close' | 'logout' | 'arrow' | 'download' | 'plus'

const paths: Record<PortalIconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9.5 20v-6h5v6"/></>,
  projects: <><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M8 5V3h8v2M3 10h18"/></>,
  ledger: <><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
  payments: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></>,
  documents: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></>,
  updates: <><path d="M12 21a9 9 0 1 0-9-9"/><path d="M3 5v7h7M12 7v5l3 2"/></>,
  tools: <><path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.3 2.3-3-3z"/></>,
  profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  security: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/></>,
  agreements: <><path d="M7 3h10v4H7zM5 7h14v14H5z"/><path d="M8 11h8M8 15h8M8 18h5"/></>,
  reports: <><path d="M5 3h14v18H5z"/><path d="M9 17v-4M12 17V9M15 17v-6"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5"/></>,
  audit: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M4 4l2 2"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10"/></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
}

export function Icon({ name, ...props }: { name: PortalIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  )
}

