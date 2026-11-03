'use client'

import { useId, useRef, useState, useEffect } from 'react'
import { useSite, Rich } from '@/lib/site-i18n'
import { REVIEW_FORM as F } from '@/lib/site-content'
import { createClient } from '@/lib/supabase/client'
import Modal from './Modal'

const MAX = { avatar: 2, result: 5, video: 50 } as const
const TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
}

const okFile = (f: File | null, mb: number, types: string[]) => !f || (f.size <= mb * 1024 * 1024 && types.includes(f.type))

async function upload(file: File, bucket: string): Promise<string> {
  const supabase = createClient()
  const ext = (file.name.split('.').pop() ?? 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
}

/** Same flow as before: files to the existing buckets, then an unapproved row in `testimonials` (moderated). */
export default function ReviewForm({ onClose }: { onClose: () => void }) {
  const { tr } = useSite()
  const uid = useId()
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')
  const [rating, setRating] = useState(5)
  const openedAt = useRef(0)
  useEffect(() => { openedAt.current = Date.now() }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (fd.get('website') || Date.now() - openedAt.current < 3000) return
    const name = String(fd.get('name') ?? '').trim()
    const message = String(fd.get('message') ?? '').trim()
    const get = (k: string) => {
      const v = fd.get(k)
      return v instanceof File && v.size > 0 ? v : null
    }
    const avatar = get('avatar'), result = get('result'), video = get('video')
    if (!name) return setError(tr(F.eName))
    if (message.length < 20) return setError(tr(F.eMsg))
    if (!okFile(avatar, MAX.avatar, TYPES.image) || !okFile(result, MAX.result, TYPES.image) || !okFile(video, MAX.video, TYPES.video)) return setError(tr(F.eFile))

    setError('')
    setState('sending')
    try {
      const avatar_url = avatar ? await upload(avatar, 'testimonial-avatars') : null
      const result_image_url = result ? await upload(result, 'testimonial-results') : null
      const video_url = video ? await upload(video, 'testimonial-videos') : null
      const { error: err } = await createClient().from('testimonials').insert({
        name,
        company: String(fd.get('company') ?? '').trim() || null,
        role: String(fd.get('role') ?? '').trim() || null,
        message,
        rating,
        avatar_url,
        result_image_url,
        video_url,
        approved: false,
      })
      if (err) throw err
      setState('done')
    } catch (err) {
      console.error('[reviews] submit failed', err)
      setError(tr(err instanceof Error && /storage|bucket|upload/i.test(err.message) ? F.eUpload : F.eSend))
      setState('idle')
    }
  }

  const titleId = `${uid}-t`
  return (
    <Modal onClose={onClose} labelledBy={titleId}>
      <div className="eyebrow">{tr(F.eyebrow)}</div>
      {state === 'done' ? (
        <>
          <h3 id={titleId}>{tr(F.doneTitle)}</h3>
          <p>{tr(F.doneBody)}</p>
          <button className="btn dark" type="button" onClick={onClose}><span>{tr(F.close)}</span> ↗</button>
        </>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <Rich as="h3" className="modal-title" v={F.title} />
          <span id={titleId} hidden>{tr(F.title)}</span>
          <p>{tr(F.intro)}</p>
          <label htmlFor={`${uid}-n`}>{tr(F.name)}</label>
          <input id={`${uid}-n`} name="name" required maxLength={120} autoComplete="name" />
          <label htmlFor={`${uid}-c`}>{tr(F.company)}</label>
          <input id={`${uid}-c`} name="company" maxLength={120} autoComplete="organization" />
          <label htmlFor={`${uid}-r`}>{tr(F.role)}</label>
          <input id={`${uid}-r`} name="role" maxLength={120} autoComplete="organization-title" />
          <label htmlFor={`${uid}-s`}>{tr(F.rating)}</label>
          <select id={`${uid}-s`} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} — {n}/5</option>
            ))}
          </select>
          <label htmlFor={`${uid}-m`}>{tr(F.message)}</label>
          <textarea id={`${uid}-m`} name="message" rows={4} minLength={20} maxLength={2000} required />
          <label htmlFor={`${uid}-a`}>{tr(F.avatar)}</label>
          <input id={`${uid}-a`} name="avatar" type="file" accept={TYPES.image.join(',')} />
          <label htmlFor={`${uid}-i`}>{tr(F.result)}</label>
          <input id={`${uid}-i`} name="result" type="file" accept={TYPES.image.join(',')} />
          <label htmlFor={`${uid}-v`}>{tr(F.video)}</label>
          <input id={`${uid}-v`} name="video" type="file" accept={TYPES.video.join(',')} />
          <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {error && <p className="form-note bad" role="alert">{error}</p>}
          <button className="btn dark" type="submit" disabled={state === 'sending'}>
            <span>{tr(state === 'sending' ? F.sending : F.submit)}</span> ↗
          </button>
        </form>
      )}
    </Modal>
  )
}
