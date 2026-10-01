export class PortalValidationError extends Error {}

export function requiredText(formData: FormData, key: string, label: string, max = 500) {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) throw new PortalValidationError(`${label} es obligatorio.`)
  if (value.length > max) throw new PortalValidationError(`${label} supera el máximo permitido.`)
  return value
}

export function optionalText(formData: FormData, key: string, max = 500) {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) return null
  if (value.length > max) throw new PortalValidationError(`${key} supera el máximo permitido.`)
  return value
}

export function positiveNumber(formData: FormData, key: string, label: string) {
  const value = Number(formData.get(key))
  if (!Number.isFinite(value) || value <= 0) {
    throw new PortalValidationError(`${label} debe ser mayor que cero.`)
  }
  return Math.round(value * 100) / 100
}

export function signedNumber(formData: FormData, key: string, label: string) {
  const value = Number(formData.get(key))
  if (!Number.isFinite(value) || value === 0) {
    throw new PortalValidationError(`${label} debe ser distinto de cero.`)
  }
  return Math.round(value * 100) / 100
}

export function boundedInteger(formData: FormData, key: string, label: string, min: number, max: number, optional = false) {
  const raw = String(formData.get(key) ?? '').trim()
  if (optional && !raw) return null
  const value = Number(raw)
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new PortalValidationError(`${label} debe estar entre ${min} y ${max}.`)
  }
  return value
}

export function optionalIsoDate(formData: FormData, key: string, label: string) {
  const value = optionalText(formData, key, 10)
  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new PortalValidationError(`${label} no es válida.`)
  return value
}

export function uuid(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? '')
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new PortalValidationError('Identificador inválido.')
  }
  return value
}

export function isoDate(formData: FormData, key: string, label: string) {
  const value = requiredText(formData, key, label, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new PortalValidationError(`${label} no es válida.`)
  return value
}

export function safePortalPath(value: FormDataEntryValue | null, fallback = '/portal/dashboard') {
  const candidate = String(value ?? '')
  return candidate.startsWith('/portal/') && !candidate.startsWith('//') ? candidate : fallback
}
