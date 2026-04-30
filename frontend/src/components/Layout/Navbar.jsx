import { useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import ComputerIcon from '@mui/icons-material/Computer'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useThemeMode } from '../../contexts/ThemeContext'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleLogout = () => { handleMenuClose(); logout(); navigate('/') }
  const handleProfile = () => { handleMenuClose(); navigate('/profile') }

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
              background: 'linear-gradient(135deg,#a855f7,#818cf8)',
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
            sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' } }}
          >
            Клуби
          </Button>
          {isAuthenticated && (
            <Button
              component={RouterLink}
              to="/bookings"
              sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' } }}
            >
              Мої бронювання
            </Button>
          )}
          {user?.is_admin && (
            <Button
              component={RouterLink}
              to="/admin"
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ color: '#a855f7', '&:hover': { bgcolor: 'rgba(147,51,234,0.08)' } }}
            >
              Адмін
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={mode === 'dark' ? 'Світла тема' : 'Темна тема'}>
            <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                {user?.username}
              </Typography>
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar
                  sx={{
                    width: 32, height: 32, fontSize: 14,
                    background: 'linear-gradient(135deg,#7c3aed,#9333ea)',
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
                sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' } }}
              >
                Увійти
              </Button>
              <Button variant="contained" component={RouterLink} to="/register" size="small" sx={{ px: 2 }}>
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
