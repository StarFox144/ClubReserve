import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Avatar, Box, Button, ButtonBase, ClickAwayListener, Dialog, Divider,
  IconButton, InputBase, Menu, MenuItem, Paper, Tooltip, Typography,
} from '@mui/material'
import ComputerIcon from '@mui/icons-material/Computer'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { Link as RouterLink, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useThemeMode } from '../../contexts/ThemeContext'
import { globalSearch } from '../../api/search'
import { cr, font, tint, ease } from '../../design/tokens'
import Logo from './Logo'

const useDebounce = (fn, delay) => {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// Desktop nav link with an active "light line" underneath
const navLinkSx = {
  position: 'relative',
  px: 1.75,
  py: 1,
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '0.92rem',
  color: cr.muted,
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  transition: `color 200ms ${ease}, background-color 200ms ${ease}`,
  '&:hover': { color: cr.text, bgcolor: tint(cr.primary, 10) },
  '&::after': {
    content: '""',
    position: 'absolute',
    left: '50%',
    bottom: -2,
    height: 2,
    width: 0,
    borderRadius: 2,
    background: `linear-gradient(90deg, ${cr.primary2}, ${cr.cyan})`,
    boxShadow: `0 0 10px ${cr.primary2}, 0 0 18px ${tint(cr.cyan, 60)}`,
    transform: 'translateX(-50%)',
    transition: `width 300ms ${ease}`,
  },
  '&.active': { color: cr.text },
  '&.active::after': { width: 'calc(100% - 20px)' },
  '&:focus-visible': { boxShadow: cr.focusRing },
}

const NeonAvatar = ({ name, size = 34 }) => (
  <Box sx={{ p: '2px', borderRadius: '50%', background: `conic-gradient(from 180deg, ${cr.primary2}, ${cr.cyan}, ${cr.magenta}, ${cr.primary2})`, boxShadow: cr.glowSm }}>
    <Avatar sx={{ width: size, height: size, fontSize: size * 0.42, bgcolor: cr.surface, color: cr.text, border: `2px solid ${cr.bg}` }}>
      {name?.charAt(0).toUpperCase() || 'U'}
    </Avatar>
  </Box>
)

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const { mode, toggleTheme } = useThemeMode()
  const navigate = useNavigate()
  const location = useLocation()
  const [anchorEl, setAnchorEl] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

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
  const handleLogout = () => { handleMenuClose(); setMobileOpen(false); logout(); navigate('/') }
  const handleProfile = () => { handleMenuClose(); navigate('/profile') }

  const links = [
    { to: '/clubs', label: 'Клуби', icon: <StorefrontIcon fontSize="small" /> },
    ...(isAuthenticated ? [{ to: '/bookings', label: 'Бронювання', icon: <ComputerIcon fontSize="small" /> }] : []),
    ...(user?.is_admin ? [{ to: '/admin', label: 'Адмін', icon: <AdminPanelSettingsIcon fontSize="small" /> }] : []),
  ]

  const resultRowSx = {
    display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, width: '100%', justifyContent: 'flex-start', textAlign: 'left',
    '&:hover, &.Mui-focusVisible': { bgcolor: tint(cr.primary, 12) },
  }

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        px: { xs: 1.5, sm: 2 },
        pt: scrolled ? 1 : { xs: 1.5, md: 2 },
        transition: `padding 300ms ${ease}`,
        pointerEvents: 'none',
      }}
    >
      <Box
        component="nav"
        aria-label="Головна навігація"
        sx={{
          pointerEvents: 'auto',
          mx: 'auto',
          maxWidth: scrolled ? 1080 : 1200,
          height: scrolled ? 54 : 64,
          px: { xs: 1.5, sm: 2.5 },
          display: 'flex', alignItems: 'center', gap: 1,
          borderRadius: '18px',
          background: scrolled ? cr.glassStrong : cr.glass,
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          border: `1px solid ${scrolled ? cr.borderStrong : cr.border}`,
          boxShadow: scrolled ? cr.glowMd : 'none',
          transition: `all 300ms ${ease}`,
        }}
      >
        {/* Logo */}
        {!searchOpen && <Box sx={{ mr: { xs: 'auto', md: 3 } }}><Logo compact={scrolled} /></Box>}

        {/* Nav links (desktop) */}
        {!searchOpen && (
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
            {links.map((l) => (
              <Box key={l.to} component={NavLink} to={l.to} sx={navLinkSx}>{l.label}</Box>
            ))}
          </Box>
        )}

        {/* Search bar (expanded) */}
        {searchOpen && (
          <ClickAwayListener onClickAway={clearSearch}>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.75, py: 0.6, borderRadius: '12px',
                bgcolor: cr.glass,
                border: `1px solid ${cr.primary2}`,
                boxShadow: cr.glowSm,
              }}>
                <SearchIcon sx={{ color: cr.primaryText, fontSize: 20, flexShrink: 0 }} />
                <InputBase
                  inputRef={searchRef}
                  fullWidth
                  placeholder="Пошук клубів, комп'ютерів..."
                  value={searchQ}
                  onChange={handleSearchChange}
                  inputProps={{ 'aria-label': 'Пошук' }}
                  sx={{ fontSize: '0.95rem', color: cr.text }}
                />
                {searchQ && (
                  <IconButton size="small" onClick={clearSearch} aria-label="Очистити" sx={{ color: cr.muted, p: 0.25 }}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>

              {/* Dropdown */}
              {showDropdown && (
                <Paper sx={{
                  position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0,
                  borderRadius: '14px', zIndex: 1400, maxHeight: 360, overflow: 'auto',
                  boxShadow: cr.glowMd, py: 0.5,
                }}>
                  {searchLoading && (
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography sx={{ fontFamily: font.mono, fontSize: '0.8rem', color: cr.muted }}>Сканування…</Typography>
                    </Box>
                  )}
                  {!searchLoading && !hasResults && (
                    <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: cr.muted }}>Нічого не знайдено</Typography>
                    </Box>
                  )}
                  {!searchLoading && hasResults && (
                    <>
                      {searchResults.clubs.length > 0 && (
                        <>
                          <Typography sx={{ px: 2, pt: 1.25, pb: 0.5, fontFamily: font.mono, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: cr.faint }}>
                            // Клуби
                          </Typography>
                          {searchResults.clubs.map((c) => (
                            <ButtonBase key={c.id} onClick={() => handleResultClick(`/clubs/${c.id}`)} sx={resultRowSx}>
                              <StorefrontIcon sx={{ fontSize: 18, color: cr.primaryText, flexShrink: 0 }} />
                              <Box>
                                <Typography variant="body2" fontWeight={700} sx={{ color: cr.text }}>{c.name}</Typography>
                                {c.address && <Typography variant="caption" sx={{ color: cr.muted }}>{c.address}</Typography>}
                              </Box>
                            </ButtonBase>
                          ))}
                        </>
                      )}
                      {searchResults.computers.length > 0 && (
                        <>
                          {searchResults.clubs.length > 0 && <Divider sx={{ mx: 2, my: 0.5 }} />}
                          <Typography sx={{ px: 2, pt: 1.25, pb: 0.5, fontFamily: font.mono, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: cr.faint }}>
                            // Комп'ютери
                          </Typography>
                          {searchResults.computers.map((c) => (
                            <ButtonBase key={c.id} onClick={() => handleResultClick(`/computers/${c.id}`)} sx={resultRowSx}>
                              <ComputerIcon sx={{ fontSize: 18, color: cr.cyanText, flexShrink: 0 }} />
                              <Typography variant="body2" fontWeight={700} sx={{ fontFamily: font.mono, color: cr.text }}>{c.name}</Typography>
                            </ButtonBase>
                          ))}
                        </>
                      )}
                      <Box sx={{ px: 2, py: 1, mt: 0.5, borderTop: `1px solid ${cr.borderSoft}` }}>
                        <Typography sx={{ fontFamily: font.mono, fontSize: '0.66rem', color: cr.faint }}>ENTER — відкрити · ESC — закрити</Typography>
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
          <Tooltip title={searchOpen ? 'Закрити пошук' : 'Пошук'}>
            <IconButton
              onClick={() => { setSearchOpen((v) => !v); if (searchOpen) clearSearch() }}
              size="small"
              aria-label={searchOpen ? 'Закрити пошук' : 'Пошук'}
              sx={{ color: searchOpen ? cr.primaryText : cr.muted }}
            >
              {searchOpen ? <CloseIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === 'dark' ? 'Світла тема' : 'Темна тема'}>
            <IconButton onClick={toggleTheme} size="small" aria-label={mode === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'} sx={{ color: cr.muted, display: { xs: searchOpen ? 'none' : 'inline-flex' } }}>
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* Desktop auth */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, ml: 0.5 }}>
            {isAuthenticated ? (
              <>
                {!searchOpen && (
                  <Typography sx={{ fontFamily: font.mono, fontSize: '0.8rem', color: cr.muted, display: { xs: 'none', lg: 'block' } }}>
                    {user?.username}
                  </Typography>
                )}
                <IconButton onClick={handleMenuOpen} size="small" aria-label="Меню акаунта" aria-haspopup="menu" sx={{ p: 0.25 }}>
                  <NeonAvatar name={user?.username} size={scrolled ? 30 : 34} />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{ paper: { sx: { mt: 1 } } }}>
                  <MenuItem onClick={handleProfile} sx={{ gap: 1.25 }}><PersonIcon fontSize="small" /> Профіль</MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem onClick={handleLogout} sx={{ gap: 1.25, color: cr.dangerText }}><LogoutIcon fontSize="small" /> Вийти</MenuItem>
                </Menu>
              </>
            ) : (
              !searchOpen && (
                <>
                  <Button component={RouterLink} to="/login">Увійти</Button>
                  <Button variant="contained" component={RouterLink} to="/register" size="small" sx={{ px: 2.25, py: 0.9 }}>
                    Реєстрація
                  </Button>
                </>
              )
            )}
          </Box>

          {/* Burger (mobile) */}
          {!searchOpen && (
            <IconButton onClick={() => setMobileOpen(true)} aria-label="Відкрити меню" aria-expanded={mobileOpen} sx={{ display: { xs: 'inline-flex', md: 'none' }, color: cr.text }}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Fullscreen glass menu (mobile) */}
      <Dialog
        fullScreen
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { background: cr.glassStrong, backdropFilter: 'blur(24px) saturate(160%)', border: 'none', borderRadius: 0, m: 0, width: '100%', animation: 'cr-fade 250ms var(--cr-ease)' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pt: 2.5 }}>
          <Logo onClick={() => setMobileOpen(false)} />
          <IconButton onClick={() => setMobileOpen(false)} aria-label="Закрити меню" sx={{ color: cr.text, border: `1px solid ${cr.border}` }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mx: 2.5, mt: 4, p: 2, borderRadius: '16px', border: `1px solid ${cr.border}`, bgcolor: cr.glass }}>
            <NeonAvatar name={user?.username} size={42} />
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{user?.username}</Typography>
              <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', color: cr.successText }}>● ONLINE</Typography>
            </Box>
          </Box>
        )}

        <Box component="ul" sx={{ listStyle: 'none', m: 0, px: 2.5, pt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[{ to: '/', label: 'Головна' }, ...links, ...(isAuthenticated ? [{ to: '/profile', label: 'Профіль' }] : [])].map((l, i) => (
            <li key={l.to} style={{ animation: `cr-fade-up 400ms var(--cr-ease) ${i * 50}ms both` }}>
              <Box
                component={NavLink}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setMobileOpen(false)}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  py: 2, px: 2, borderRadius: '14px',
                  fontFamily: font.display, fontWeight: 700, fontSize: '1.35rem',
                  color: cr.muted, textDecoration: 'none',
                  border: '1px solid transparent',
                  '&.active': { color: cr.text, borderColor: cr.border, bgcolor: tint(cr.primary, 10), boxShadow: `inset 3px 0 0 ${cr.primary2}` },
                  '&:focus-visible': { boxShadow: cr.focusRing },
                }}
              >
                {l.label}
                <Box component="span" sx={{ fontFamily: font.mono, fontSize: '0.75rem', color: cr.faint }}>{String(i + 1).padStart(2, '0')}</Box>
              </Box>
            </li>
          ))}
        </Box>

        <Box sx={{ mt: 'auto', p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Button variant="outlined" onClick={toggleTheme} startIcon={mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}>
            {mode === 'dark' ? 'Світла тема' : 'Темна тема'}
          </Button>
          {isAuthenticated ? (
            <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutIcon />}>Вийти</Button>
          ) : (
            <>
              <Button variant="contained" size="large" component={RouterLink} to="/register">Реєстрація</Button>
              <Button variant="outlined" size="large" component={RouterLink} to="/login">Увійти</Button>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  )
}

export default Navbar
