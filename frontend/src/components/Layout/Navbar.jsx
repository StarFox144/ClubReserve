import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material'
import ComputerIcon from '@mui/icons-material/Computer'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = () => {
    handleMenuClose()
    logout()
    navigate('/')
  }

  const handleProfile = () => {
    handleMenuClose()
    navigate('/profile')
  }

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <ComputerIcon sx={{ mr: 1, color: '#a855f7', filter: 'drop-shadow(0 0 6px #9333ea)' }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #e2e8f0, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '0.5px',
            }}
          >
            ClubReserve
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/clubs"
            sx={{
              color: 'text.secondary',
              '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' },
            }}
          >
            Клуби
          </Button>
          {isAuthenticated && (
            <Button
              component={RouterLink}
              to="/bookings"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' },
              }}
            >
              Мої бронювання
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                {user?.username}
              </Typography>
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 14,
                    background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                    boxShadow: '0 0 10px rgba(147,51,234,0.5)',
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleProfile} sx={{ color: 'text.primary' }}>Профіль</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>Вийти</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' },
                }}
              >
                Увійти
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                size="small"
                sx={{ px: 2 }}
              >
                Реєстрація
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
