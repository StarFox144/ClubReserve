import { createTheme } from '@mui/material/styles'
import { cr, font, tint } from './design/tokens'

// MUI needs concrete colors for its own alpha/contrast math, so the palette
// mirrors the raw values from src/index.css. Everything rendered by component
// overrides below uses CSS variables, which switch with html[data-theme].
const RAW = {
  dark: {
    bg: '#05050A', paper: '#0B0B16', text: '#EDEDF7', muted: '#9A9AB8', faint: '#6E6E8C',
    primary: '#8B5CF6', primaryLight: '#A855F7', primaryDark: '#7C3AED',
    cyan: '#22D3EE', success: '#4ADE80', warning: '#FACC15', danger: '#F43F5E', divider: 'rgba(168,85,247,0.18)',
  },
  light: {
    bg: '#F5F3FF', paper: '#FFFFFF', text: '#16132B', muted: '#52507A', faint: '#7A779C',
    primary: '#7C3AED', primaryLight: '#9333EA', primaryDark: '#6D28D9',
    cyan: '#0891B2', success: '#15803D', warning: '#A16207', danger: '#BE123C', divider: 'rgba(124,58,237,0.14)',
  },
}

const glassPaper = {
  backgroundColor: cr.glassStrong,
  backgroundImage: 'none',
  backdropFilter: 'blur(18px) saturate(150%)',
  WebkitBackdropFilter: 'blur(18px) saturate(150%)',
  border: `1px solid ${cr.border}`,
}

const focusVisible = { '&.Mui-focusVisible, &:focus-visible': { boxShadow: cr.focusRing, outline: 'none' } }

export const createAppTheme = (mode) => {
  const p = RAW[mode] || RAW.dark

  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, light: p.primaryLight, dark: p.primaryDark, contrastText: '#fff' },
      secondary: { main: p.cyan, contrastText: '#05050A' },
      success: { main: p.success },
      warning: { main: p.warning },
      error: { main: p.danger },
      info: { main: p.cyan },
      background: { default: p.bg, paper: p.paper },
      text: { primary: p.text, secondary: p.muted, disabled: p.faint },
      divider: p.divider,
    },
    typography: {
      fontFamily: font.body,
      h1: { fontFamily: font.display, fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontFamily: font.display, fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontFamily: font.display, fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontFamily: font.display, fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontFamily: font.display, fontWeight: 600 },
      h6: { fontFamily: font.display, fontWeight: 600, fontSize: '1.05rem' },
      subtitle1: { fontWeight: 700 },
      subtitle2: { fontWeight: 700 },
      button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
      overline: { fontFamily: font.mono, fontWeight: 600, letterSpacing: '0.2em', lineHeight: 1.6 },
      caption: { letterSpacing: '0.01em' },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: cr.bg, color: cr.text },
        },
      },

      /* ── Buttons ─────────────────────────────────────── */
      MuiButtonBase: { defaultProps: { disableRipple: false } },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
            transition: 'box-shadow 250ms var(--cr-ease), transform 250ms var(--cr-ease), background-color 250ms var(--cr-ease), border-color 250ms var(--cr-ease), color 250ms var(--cr-ease)',
            ...focusVisible,
            '&:active': { transform: 'translateY(1px)' },
          },
          sizeLarge: { padding: '12px 28px', fontSize: '1rem' },
          // Primary — neon gradient + glow + sheen on hover
          containedPrimary: {
            background: cr.gradPrimary,
            color: cr.onPrimary,
            boxShadow: cr.glowSm,
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.38) 50%, transparent 70%)',
              transform: 'translateX(-120%)',
              transition: 'transform 650ms var(--cr-ease)',
              pointerEvents: 'none',
            },
            '&:hover': { background: cr.gradPrimary, boxShadow: cr.glowMd, transform: 'translateY(-1px)' },
            '&:hover::after': { transform: 'translateX(120%)' },
            '&.Mui-disabled': { background: tint(cr.primary, 22), color: tint(cr.text, 45), boxShadow: 'none' },
          },
          // Danger
          containedError: {
            background: cr.danger,
            color: cr.onPrimary,
            boxShadow: `0 0 14px ${tint(cr.danger, 40)}`,
            '&:hover': { background: cr.danger, boxShadow: `0 0 26px ${tint(cr.danger, 55)}` },
          },
          // Secondary — glass outline
          outlined: {
            background: cr.glass,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderColor: cr.borderStrong,
            color: cr.primaryText,
            '&:hover': { borderColor: cr.primary2, background: tint(cr.primary, 10), boxShadow: cr.glowSm },
            '&.Mui-disabled': { borderColor: cr.borderSoft, color: cr.faint },
          },
          outlinedError: {
            borderColor: tint(cr.danger, 50),
            color: cr.dangerText,
            '&:hover': { borderColor: cr.danger, background: tint(cr.danger, 10), boxShadow: `0 0 16px ${tint(cr.danger, 35)}` },
          },
          outlinedSuccess: {
            borderColor: tint(cr.success, 50),
            color: cr.successText,
            '&:hover': { borderColor: cr.success, background: tint(cr.success, 10) },
          },
          // Ghost
          text: {
            color: cr.muted,
            '&:hover': { color: cr.text, background: tint(cr.primary, 10) },
          },
          textError: { color: cr.dangerText, '&:hover': { background: tint(cr.danger, 10), color: cr.dangerText } },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'color 200ms var(--cr-ease), background-color 200ms var(--cr-ease), box-shadow 200ms var(--cr-ease)',
            '&:hover': { backgroundColor: tint(cr.primary, 12), color: cr.primaryText },
            ...focusVisible,
          },
        },
      },

      /* ── Surfaces ────────────────────────────────────── */
      MuiPaper: {
        styleOverrides: {
          root: { ...glassPaper, color: cr.text },
          rounded: { borderRadius: 16 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            ...glassPaper,
            backgroundColor: cr.glass,
            borderRadius: 16,
            boxShadow: 'none',
            transition: 'transform 300ms var(--cr-ease), box-shadow 300ms var(--cr-ease), border-color 300ms var(--cr-ease)',
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: cr.borderSoft } } },

      /* ── Inputs ──────────────────────────────────────── */
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: cr.glass,
            backdropFilter: 'blur(10px)',
            transition: 'box-shadow 250ms var(--cr-ease), background-color 250ms var(--cr-ease)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: cr.border, transition: 'border-color 250ms var(--cr-ease)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: cr.borderStrong },
            '&.Mui-focused': { boxShadow: cr.glowSm, backgroundColor: tint(cr.primary, 6) },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: cr.primary2, borderWidth: 1 },
            '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: cr.danger },
            '&.Mui-error.Mui-focused': { boxShadow: `0 0 14px ${tint(cr.danger, 40)}` },
          },
          input: { '&::placeholder': { color: cr.faint, opacity: 1 } },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: cr.muted,
            '&.Mui-focused': { color: cr.primaryText },
            '&.Mui-error': { color: cr.dangerText },
          },
          shrink: { fontSize: '0.78rem', transform: 'translate(14px, -8px) scale(0.92)' },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            color: cr.faint,
            '&.Mui-error': { color: cr.dangerText, textShadow: `0 0 10px ${tint(cr.danger, 45)}` },
          },
        },
      },
      MuiSelect: { styleOverrides: { icon: { color: cr.primaryText } } },
      MuiInputAdornment: { styleOverrides: { root: { color: cr.muted, '& .MuiIconButton-root': { color: cr.primaryText } } } },
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            '&.Mui-checked': { color: cr.primary2 },
            '&.Mui-checked + .MuiSwitch-track': { backgroundColor: cr.primary, opacity: 0.6 },
          },
          thumb: { boxShadow: cr.glowSm },
        },
      },
      MuiRating: {
        styleOverrides: {
          iconFilled: { color: cr.vip, filter: `drop-shadow(0 0 4px ${tint(cr.vip, 50)})` },
          iconEmpty: { color: tint(cr.vip, 30) },
        },
      },

      /* ── Overlays ────────────────────────────────────── */
      MuiBackdrop: {
        styleOverrides: {
          root: {
            '&:not(.MuiBackdrop-invisible)': {
              backgroundColor: cr.overlay,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: `1px solid ${cr.borderStrong}`,
            boxShadow: cr.glowLg,
            animation: 'cr-scale-in 320ms var(--cr-ease) both',
            margin: 16,
            width: 'calc(100% - 32px)',
          },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontFamily: font.display, fontWeight: 700, fontSize: '1.1rem' } } },
      MuiDrawer: { styleOverrides: { paper: { ...glassPaper, borderRadius: 0 } } },
      MuiPopover: { styleOverrides: { paper: { boxShadow: cr.glowMd, borderRadius: 14 } } },
      MuiMenu: { styleOverrides: { paper: { minWidth: 180 } } },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 6px',
            fontWeight: 600,
            '&:hover': { backgroundColor: tint(cr.primary, 12) },
            '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: tint(cr.primary, 18), color: cr.primaryText },
            '&.Mui-focusVisible': { backgroundColor: tint(cr.primary, 16), boxShadow: `inset 0 0 0 1px ${cr.cyan}` },
          },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: {
            ...glassPaper,
            color: cr.text,
            fontFamily: font.mono,
            fontSize: '0.72rem',
            padding: '8px 10px',
            borderRadius: 10,
            boxShadow: cr.glowSm,
          },
          arrow: { color: cr.elevated, '&::before': { border: `1px solid ${cr.border}` } },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backdropFilter: 'blur(12px)',
            border: '1px solid',
            alignItems: 'center',
            fontWeight: 600,
            position: 'relative',
            overflow: 'hidden',
            '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'currentColor', boxShadow: '0 0 12px currentColor' },
          },
          standardSuccess: { color: cr.successText, backgroundColor: tint(cr.success, 10), borderColor: tint(cr.success, 35), '& .MuiAlert-icon': { color: cr.success } },
          standardError:   { color: cr.dangerText,  backgroundColor: tint(cr.danger, 10),  borderColor: tint(cr.danger, 35),  '& .MuiAlert-icon': { color: cr.danger } },
          standardWarning: { color: cr.warningText, backgroundColor: tint(cr.warning, 10), borderColor: tint(cr.warning, 35), '& .MuiAlert-icon': { color: cr.warning } },
          standardInfo:    { color: cr.cyanText,    backgroundColor: tint(cr.cyan, 10),    borderColor: tint(cr.cyan, 35),    '& .MuiAlert-icon': { color: cr.cyan } },
        },
      },

      /* ── Data display ────────────────────────────────── */
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 700, letterSpacing: '0.02em' },
          outlined: { borderColor: cr.border },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: { ...glassPaper, backgroundColor: cr.glass, borderRadius: 16 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderBottom: `1px solid ${cr.borderSoft}`, padding: '12px 16px' },
          head: {
            fontFamily: font.mono,
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: cr.muted,
            backgroundColor: tint(cr.primary, 7),
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background-color 200ms var(--cr-ease), box-shadow 200ms var(--cr-ease)',
            '&.MuiTableRow-hover:hover': { backgroundColor: tint(cr.primary, 8), boxShadow: `inset 2px 0 0 ${cr.primary2}` },
            '&:last-child td': { borderBottom: 0 },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44, borderBottom: `1px solid ${cr.borderSoft}` },
          indicator: { height: 2, background: cr.gradLine, boxShadow: `0 0 10px ${cr.primary2}, 0 0 2px ${cr.cyan}` },
          scrollButtons: { color: cr.primaryText },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
            minHeight: 44,
            color: cr.muted,
            transition: 'color 200ms var(--cr-ease)',
            '&:hover': { color: cr.text },
            '&.Mui-selected': { color: cr.primaryText, textShadow: `0 0 12px ${tint(cr.primary2, 60)}` },
            ...focusVisible,
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: { fontFamily: font.mono, fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase' },
          separator: { color: cr.faint },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: {
            color: cr.primaryText,
            textDecorationColor: tint(cr.primary2, 40),
            transition: 'color 200ms var(--cr-ease), text-shadow 200ms var(--cr-ease)',
            '&:hover': { color: cr.cyanText, textShadow: `0 0 10px ${tint(cr.cyan, 50)}` },
          },
        },
      },
      MuiAvatar: { styleOverrides: { root: { fontFamily: font.display, fontWeight: 700 } } },
      MuiCircularProgress: { styleOverrides: { root: { color: cr.primary2 } } },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 6, backgroundColor: tint(cr.primary, 15) },
          bar: { borderRadius: 6, background: `linear-gradient(90deg, ${cr.primary}, ${cr.cyan})`, boxShadow: `0 0 10px ${tint(cr.cyan, 60)}` },
        },
      },
      MuiSkeleton: {
        defaultProps: { animation: 'wave' },
        styleOverrides: {
          root: { backgroundColor: tint(cr.primary, 10), borderRadius: 10 },
          wave: {
            '&::after': {
              background: `linear-gradient(90deg, transparent, ${tint(cr.primary2, 22)}, ${tint(cr.cyan, 18)}, transparent)`,
              animation: 'cr-shimmer 1.6s var(--cr-ease) infinite',
            },
          },
        },
      },

      /* ── Date pickers (MUI X) ────────────────────────── */
      MuiPickersDay: {
        styleOverrides: {
          root: {
            fontFamily: font.mono,
            '&.Mui-selected': { background: cr.gradPrimary, color: cr.onPrimary, boxShadow: cr.glowSm },
            '&.MuiPickersDay-today:not(.Mui-selected)': { borderColor: cr.cyan },
          },
        },
      },
      MuiMultiSectionDigitalClockSection: {
        styleOverrides: {
          item: {
            fontFamily: font.mono,
            borderRadius: 8,
            '&.Mui-selected': { background: cr.gradPrimary, color: cr.onPrimary },
          },
        },
      },
      MuiPickersLayout: { styleOverrides: { root: { backgroundColor: 'transparent' } } },
    },
  })
}

export default createAppTheme('dark')
