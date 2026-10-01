import { redirect } from 'next/navigation'
import { getViewer } from '@/lib/portal/auth'

export default async function PortalPage() {
  const viewer = await getViewer()
  redirect(viewer ? '/portal/dashboard' : '/portal/login')
}

