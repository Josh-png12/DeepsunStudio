import { requireViewer } from '@/lib/portal/auth'
import { PortalShell } from '@/components/portal/PortalShell'
import { PortalRealtime } from '@/components/portal/PortalRealtime'

export default async function ProtectedPortalLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer()
  return (
    <PortalShell fullName={viewer.profile.full_name} email={viewer.user.email ?? ''} isAdmin={viewer.isAdmin}>
      <PortalRealtime agreementIds={viewer.agreements.map((agreement) => agreement.id)} />
      {children}
    </PortalShell>
  )
}

