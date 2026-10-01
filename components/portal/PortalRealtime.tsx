'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const realtimeTables = ['transactions', 'payments', 'documents', 'updates', 'project_updates', 'project_milestones'] as const

export function PortalRealtime({ agreementIds }: { agreementIds: string[] }) {
  const router = useRouter()

  useEffect(() => {
    if (!agreementIds.length) return
    const supabase = createClient()
    const channels = agreementIds.map((agreementId) => {
      let channel = supabase.channel(`portal:${agreementId}`)
      for (const table of realtimeTables) {
        channel = channel.on(
          'postgres_changes',
          { event: '*', schema: 'public', table, filter: `agreement_id=eq.${agreementId}` },
          () => router.refresh(),
        )
      }
      return channel.subscribe()
    })
    return () => { channels.forEach((channel) => { void supabase.removeChannel(channel) }) }
  }, [agreementIds, router])

  return null
}
