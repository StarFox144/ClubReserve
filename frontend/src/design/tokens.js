// JS mirror of the CSS design tokens in src/index.css.
// Pages and components must take colors from here (or from the MUI theme),
// never hardcode hex values: every value resolves to a CSS variable, so the
// dark/light switch happens in one place.

const v = (name) => `var(--cr-${name})`

export const cr = {
  bg: v('bg'),
  surface: v('surface'),
  elevated: v('elevated'),
  glass: v('glass'),
  glassStrong: v('glass-strong'),
  overlay: v('overlay'),

  primary: v('primary'),
  primary2: v('primary-2'),
  primaryText: v('primary-text'),
  onPrimary: v('on-primary'),
  cyan: v('cyan'),
  cyanText: v('cyan-text'),
  magenta: v('magenta'),
  magentaText: v('magenta-text'),

  success: v('success'),
  successText: v('success-text'),
  warning: v('warning'),
  warningText: v('warning-text'),
  danger: v('danger'),
  dangerText: v('danger-text'),
  vip: v('vip'),
  vipText: v('vip-text'),

  text: v('text'),
  muted: v('text-muted'),
  faint: v('text-faint'),

  border: v('border'),
  borderSoft: v('border-soft'),
  borderStrong: v('border-strong'),

  gradPrimary: v('grad-primary'),
  gradText: v('grad-text'),
  gradLine: v('grad-line'),
  gradRgb: v('grad-rgb'),

  glowSm: v('glow-sm'),
  glowMd: v('glow-md'),
  glowLg: v('glow-lg'),
  glowCyan: v('glow-cyan'),
  shadowCard: v('shadow-card'),
  focusRing: v('focus-ring'),
}

export const font = {
  display: v('font-display'),
  body: v('font-body'),
  mono: v('font-mono'),
}

export const radius = {
  sm: v('radius-sm'),
  md: v('radius'),
  lg: v('radius-lg'),
}

export const ease = v('ease')
export const dur = { fast: v('dur-fast'), base: v('dur'), slow: v('dur-slow') }

/** Translucent tint of any token: tint(cr.success, 12) → 12% opacity. */
export const tint = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`

/** Colored glow from any token. */
export const glow = (color, size = 18, pct = 45) => `0 0 ${size}px ${tint(color, pct)}`

/** Corner-cut (chamfer) shape for HUD panels. */
export const cut = (size = 14) =>
  `polygon(${size}px 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%, 0 ${size}px)`

/** Shared glass surface recipe. */
export const glassSx = {
  background: cr.glass,
  backdropFilter: 'blur(16px) saturate(140%)',
  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
  border: `1px solid ${cr.border}`,
}

/** Status palette shared by badges, hall map, tickets and tables. */
export const STATUS = {
  online:      { label: 'ONLINE',     color: cr.cyan,    text: cr.cyanText },
  free:        { label: 'Вільно',     color: cr.success, text: cr.successText },
  busy:        { label: 'Зайнято',    color: cr.danger,  text: cr.dangerText },
  maintenance: { label: 'Тех. огляд', color: cr.warning, text: cr.warningText },
  vip:         { label: 'VIP',        color: cr.vip,     text: cr.vipText },
  active:      { label: 'Активне',    color: cr.success, text: cr.successText },
  completed:   { label: 'Завершене',  color: cr.cyan,    text: cr.cyanText },
  cancelled:   { label: 'Скасоване',  color: cr.faint,   text: cr.muted },
  inactive:    { label: 'Неактивний', color: cr.faint,   text: cr.muted },
  admin:       { label: 'ADMIN',      color: cr.magenta, text: cr.magentaText },
}

/** Accent cycle for decorative per-item coloring (features, charts…). */
export const ACCENTS = [cr.primary2, cr.cyan, cr.magenta, cr.success, cr.vip]

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
