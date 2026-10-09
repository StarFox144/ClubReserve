import { cr } from '../../design/tokens'

/** Splits "Intel i9 · RTX 4070 · 32 GB RAM · 240 Гц" into typed spec items. */
export const parseSpecs = (desc) => {
  if (!desc) return []
  return desc.split(' · ').map((s) => {
    const t = s.trim()
    if (/intel|ryzen|amd/i.test(t) && !/rx\s/i.test(t)) return { kind: 'CPU', label: t, color: cr.cyan, text: cr.cyanText }
    if (/rtx|gtx|rx\s|arc/i.test(t)) return { kind: 'GPU', label: t, color: cr.success, text: cr.successText }
    if (/gb ram/i.test(t))            return { kind: 'RAM', label: t, color: cr.warning, text: cr.warningText }
    if (/гц|hz/i.test(t))             return { kind: 'Hz',  label: t, color: cr.magenta, text: cr.magentaText }
    return { kind: 'INFO', label: t, color: cr.faint, text: cr.muted }
  })
}

/** VIP seat: marked "VIP" by the club, or flagship GPU. */
export const isVip = (pc) => /vip/i.test(`${pc?.name || ''} ${pc?.description || ''}`) || /4090/.test(pc?.description || '')

/** City from "вул. Хрещатик, 10, Київ" (last segment without digits). */
export const cityOf = (club) => {
  if (club?.city) return club.city
  const parts = (club?.address || '').split(',').map((s) => s.trim()).filter(Boolean)
  return [...parts].reverse().find((p) => !/\d/.test(p) && !/^(вул|просп|пр|пл|бул|пров)\.?\s/i.test(p)) || null
}

/** Most frequent spec value of a kind across a club's PCs (for the HUD specs block). */
export const topSpec = (computers, kind) => {
  const counts = {}
  computers.forEach((c) => parseSpecs(c.description).filter((s) => s.kind === kind).forEach((s) => { counts[s.label] = (counts[s.label] || 0) + 1 }))
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
}
