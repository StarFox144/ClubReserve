import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9333ea',
      light: '#a855f7',
      dark: '#7c3aed',
    },
    secondary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    background: {
      default: '#0a0a0f',
      paper: '#12121a',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(147, 51, 234, 0.2)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0a0a0f',
          backgroundImage:
            'radial-gradient(ellipse at 20% 50%, rgba(124, 58, 237, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99, 102, 241, 0.06) 0%, transparent 50%)',
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d0d15',
          borderBottom: '1px solid rgba(147, 51, 234, 0.3)',
          boxShadow: '0 1px 20px rgba(147, 51, 234, 0.15)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
          boxShadow: '0 0 15px rgba(147, 51, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)',
            boxShadow: '0 0 25px rgba(147, 51, 234, 0.6)',
          },
        },
        outlinedPrimary: {
          borderColor: '#9333ea',
          '&:hover': {
            borderColor: '#a855f7',
            boxShadow: '0 0 12px rgba(147, 51, 234, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#12121a',
          border: '1px solid rgba(147, 51, 234, 0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          transition: 'border-color 0.3s, box-shadow 0.3s',
          '&:hover': {
            borderColor: 'rgba(147, 51, 234, 0.6)',
            boxShadow: '0 4px 30px rgba(147, 51, 234, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#12121a',
          backgroundImage: 'none',
          border: '1px solid rgba(147, 51, 234, 0.15)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9333ea',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9333ea',
              boxShadow: '0 0 8px rgba(147, 51, 234, 0.3)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(147, 51, 234, 0.2)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(147, 51, 234, 0.4)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(147, 51, 234, 0.3)',
          boxShadow: '0 8px 32px rgba(147, 51, 234, 0.2)',
        },
      },
    },
  },
})

export default theme
