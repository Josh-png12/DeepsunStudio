import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/portal/login', request.url))
  const { data: document } = await supabase.from('documents').select('*').eq('id', id).maybeSingle()
  if (!document) return NextResponse.json({ error: 'Documento no disponible.' }, { status: 404 })
  const { data, error } = await supabase.storage.from('agreement-documents').createSignedUrl(document.storage_path, 60, { download: document.name })
  if (error || !data) return NextResponse.json({ error: 'No se pudo generar el acceso temporal.' }, { status: 500 })
  return NextResponse.redirect(data.signedUrl)
}

