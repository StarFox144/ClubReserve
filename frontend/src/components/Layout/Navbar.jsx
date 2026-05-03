import { useState, useRef, useEffect, useCallback } from 'react'
import {
  AppBar, Avatar, Box, Button, ClickAwayListener, Divider,
  IconButton, InputBase, Menu, MenuItem, Paper, Toolbar, Tooltip, Typography,
} from '@mui/material'
import ComputerIcon from '@mui/icons-material/Computer'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import { globalSearch } from '../../api/search'

const useDebounce = (fn, delay) => {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setSearchResults(null); return }
    setSearchLoading(true)
    try {
      const data = await globalSearch(q)
      setSearchResults(data)
    } catch { setSearchResults(null) }
    finally { setSearchLoading(false) }
  }, [])

  const debouncedSearch = useDebounce(doSearch, 300)

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchQ(val)
    debouncedSearch(val)
  }

  const clearSearch = () => {
    setSearchQ('')
    setSearchResults(null)
    setSearchOpen(false)
  }

  const handleResultClick = (path) => {
    clearSearch()
    navigate(path)
  }

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') clearSearch() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  const hasResults = searchResults && (searchResults.clubs.length > 0 || searchResults.computers.length > 0)
  const showDropdown = searchOpen && searchQ.length >= 2

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleLogout = () => { handleMenuClose(); logout(); navigate('/') }
  const handleProfile = () => { handleMenuClose(); navigate('/profile') }

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        {/* Logo */}
        {!searchOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 1, md: 4 } }}>
            <ComputerIcon sx={{ mr: 1, color: '#a855f7', filter: 'drop-shadow(0 0 6px #9333ea)' }} />
            <Typography
              variant="h6" component={RouterLink} to="/"
              sx={{ textDecoration: 'none', fontWeight: 800, display: { xs: 'none', sm: 'block' },
                background: 'linear-gradient(135deg,#a855f7,#818cf8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.5px',
              }}
            >
              ClubReserve
            </Typography>
          </Box>
        )}

        {/* Nav links */}
        {!searchOpen && (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 0.5 }}>
            <Button component={RouterLink} to="/clubs"
              sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' } }}>
              Клуби
            </Button>
            {isAuthenticated && (
              <Button component={RouterLink} to="/bookings"
                sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' } }}>
                Бронювання
              </Button>
            )}
            {user?.is_admin && (
              <Button component={RouterLink} to="/admin" startIcon={<AdminPanelSettingsIcon />}
                sx={{ color: '#a855f7', '&:hover': { bgcolor: 'rgba(147,51,234,0.08)' } }}>
                Адмін
              </Button>
            )}
          </Box>
        )}

        {/* Search bar (expanded) */}
        {searchOpen && (
          <ClickAwayListener onClickAway={clearSearch}>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <Box sx={(theme) => ({
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 0.75, borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(147,51,234,0.4)',
              })}>
                <SearchIcon sx={{ color: '#a855f7', fontSize: 20, flexShrink: 0 }} />
                <InputBase
                  inputRef={searchRef}
                  fullWidth
                  placeholder="Пошук клубів, комп'ютерів..."
                  value={searchQ}
                  onChange={handleSearchChange}
                  sx={{ fontSize: '0.95rem' }}
                />
                {searchQ && (
                  <IconButton size="small" onClick={clearSearch} sx={{ color: 'text.secondary', p: 0.25 }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

              {/* Dropdown */}
              {showDropdown && (
                <Paper sx={(theme) => ({
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                  borderRadius: 2, zIndex: 1400, maxHeight: 360, overflow: 'auto',
                  background: theme.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff',
                  border: '1px solid rgba(147,51,234,0.25)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                })}>
                  {searchLoading && (
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Пошук...</Typography>
                    </Box>
                  )}
                  {!searchLoading && !hasResults && (
                    <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Нічого не знайдено</Typography>
                    </Box>
                  )}
                  {!searchLoading && hasResults && (
                    <>
                      {searchResults.clubs.length > 0 && (
                        <>
                          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                              Клуби
                            </Typography>
                          </Box>
                          {searchResults.clubs.map((c) => (
                            <Box key={c.id} onClick={() => handleResultClick(`/clubs/${c.id}`)}
                              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(147,51,234,0.06)' } }}>
                              <StorefrontIcon sx={{ fontSize: 18, color: '#a855f7', flexShrink: 0 }} />
                              <Box>
                                <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                                {c.address && <Typography variant="caption" color="text.secondary">{c.address}</Typography>}
                              </Box>
                            </Box>
                          ))}
                        </>
                      )}
                      {searchResults.computers.length > 0 && (
                        <>
                          {searchResults.clubs.length > 0 && <Divider sx={{ mx: 2 }} />}
                          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                            <Typography variant="caption" color="text.disabled" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                              Комп'ютери
                            </Typography>
                          </Box>
                          {searchResults.computers.map((c) => (
                            <Box key={c.id} onClick={() => handleResultClick(`/computers/${c.id}`)}
                              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(147,51,234,0.06)' } }}>
                              <ComputerIcon sx={{ fontSize: 18, color: '#818cf8', flexShrink: 0 }} />
                              <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                            </Box>
                          ))}
                        </>
                      )}
                      <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(147,51,234,0.1)' }}>
                        <Typography variant="caption" color="text.disabled">Enter — відкрити, Esc — закрити</Typography>
                      </Box>
                    </>
                  )}
                </Paper>
              )}
            </Box>
          </ClickAwayListener>
        )}

        {/* Right actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: searchOpen ? 1 : 0 }}>
          {/* Search toggle */}
          <Tooltip title={searchOpen ? 'Закрити пошук' : 'Пошук'}>
            <IconButton onClick={() => { setSearchOpen((v) => !v); if (searchOpen) clearSearch() }} size="small"
              sx={{ color: searchOpen ? '#a855f7' : 'text.secondary' }}>
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={mode === 'dark' ? 'Світла тема' : 'Темна тема'}>
            <IconButton onClick={toggleTheme} size="small" sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {isAuthenticated ? (
            <>
              {!searchOpen && (
                <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', md: 'block' }, ml: 0.5 }}>
                  {user?.username}
                </Typography>
              )}
              <IconButton onClick={handleMenuOpen} size="small">
                <Avatar sx={{ width: 32, height: 32, fontSize: 14, background: 'linear-gradient(135deg,#7c3aed,#9333ea)', boxShadow: '0 0 10px rgba(147,51,234,0.5)' }}>
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleProfile} sx={{ color: 'text.primary', gap: 1 }}>Профіль</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>Вийти</MenuItem>
              </Menu>
            </>
          ) : (
            !searchOpen && (
              <>
                <Button component={RouterLink} to="/login"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7', bgcolor: 'rgba(147,51,234,0.08)' } }}>
                  Увійти
                </Button>
                <Button variant="contained" component={RouterLink} to="/register" size="small" sx={{ px: 2, borderRadius: 2 }}>
                  Реєстрація
                </Button>
              </>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
