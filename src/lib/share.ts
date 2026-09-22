import type { PresetId } from '@/content/types'

export interface SharedState {
  t: string
  d?: string
  p?: PresetId
  s?: Record<string, string>
}

const toB64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)))

export const encodeShare = (state: SharedState) => toB64(JSON.stringify(state))

export function decodeShare(hash: string): SharedState | null {
  try {
    const parsed = JSON.parse(fromB64(hash.replace(/^#/, ''))) as SharedState
    return typeof parsed.t === 'string' ? parsed : null
  } catch {
    return null
  }
}
