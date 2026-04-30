import { createTheme } from '@mui/material/styles'

export const createAppTheme = (mode) => {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: '#9333ea', light: '#a855f7', dark: '#7c3aed' },
      secondary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
      background: {
        default: isDark ? '#0a0a0f' : '#f5f0ff',
        paper:   isDark ? '#12121a' : '#ffffff',
      },
      text: {
        primary:   isDark ? '#e2e8f0' : '#1e1b2e',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      divider: isDark ? 'rgba(147,51,234,0.2)' : 'rgba(147,51,234,0.15)',
    },
    typography: {
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
    },
    shape: { borderRadius: 10 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? '#0a0a0f' : '#f5f0ff',
            backgroundImage: isDark
              ? 'radial-gradient(ellipse at 20% 50%,rgba(124,58,237,.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,.06) 0%,transparent 50%)'
              : 'radial-gradient(ellipse at 20% 50%,rgba(147,51,234,.04) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,.04) 0%,transparent 50%)',
            minHeight: '100vh',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0d0d15' : 'rgba(255,255,255,0.92)',
            borderBottom: `1px solid ${isDark ? 'rgba(147,51,234,0.3)' : 'rgba(147,51,234,0.2)'}`,
            boxShadow: '0 1px 20px rgba(147,51,234,0.1)',
            backdropFilter: isDark ? 'none' : 'blur(10px)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
          containedPrimary: {
            background: 'linear-gradient(135deg,#7c3aed 0%,#9333ea 100%)',
            boxShadow: '0 0 15px rgba(147,51,234,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg,#6d28d9 0%,#7c3aed 100%)',
              boxShadow: '0 0 25px rgba(147,51,234,0.6)',
            },
          },
          outlinedPrimary: {
            borderColor: '#9333ea',
            '&:hover': { borderColor: '#a855f7', boxShadow: '0 0 12px rgba(147,51,234,0.35)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#12121a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(147,51,234,0.2)' : 'rgba(147,51,234,0.12)'}`,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(147,51,234,0.07)',
            transition: 'border-color 0.3s,box-shadow 0.3s',
            '&:hover': {
              borderColor: isDark ? 'rgba(147,51,234,0.6)' : 'rgba(147,51,234,0.35)',
              boxShadow: isDark ? '0 4px 30px rgba(147,51,234,0.2)' : '0 4px 30px rgba(147,51,234,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#12121a' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(147,51,234,0.15)' : 'rgba(147,51,234,0.1)'}`,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9333ea' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9333ea',
                boxShadow: '0 0 8px rgba(147,51,234,0.3)',
              },
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(147,51,234,0.2)' : 'rgba(147,51,234,0.15)' },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderColor: isDark ? 'rgba(147,51,234,0.4)' : 'rgba(147,51,234,0.3)' },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(147,51,234,0.3)' : 'rgba(147,51,234,0.2)'}`,
            boxShadow: '0 8px 32px rgba(147,51,234,0.2)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? '#0d0d15' : '#f0e9ff',
              fontWeight: 700,
            },
          },
        },
      },
    },
  })
}

export default createAppTheme('dark')
