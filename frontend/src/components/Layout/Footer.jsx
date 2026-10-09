import { Box, Container, IconButton, Link, Tooltip, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import TelegramIcon from '@mui/icons-material/Telegram'
import InstagramIcon from '@mui/icons-material/Instagram'
import YouTubeIcon from '@mui/icons-material/YouTube'
import GitHubIcon from '@mui/icons-material/GitHub'
import { cr, font, tint } from '../../design/tokens'
import { useAuth } from '../../contexts/AuthContext'
import Logo from './Logo'

// Replace with the real community links
const SOCIALS = [
  { label: 'Telegram', href: 'https://t.me/', icon: <TelegramIcon />, color: cr.cyan },
  { label: 'Instagram', href: 'https://instagram.com/', icon: <InstagramIcon />, color: cr.magenta },
  { label: 'YouTube', href: 'https://youtube.com/', icon: <YouTubeIcon />, color: cr.danger },
  { label: 'GitHub', href: 'https://github.com/', icon: <GitHubIcon />, color: cr.primary2 },
]

const Footer = () => {
  const { isAuthenticated } = useAuth()
  const columns = [
    {
      title: 'Навігація',
      links: [
        { to: '/', label: 'Головна' },
        { to: '/clubs', label: 'Клуби' },
        ...(isAuthenticated ? [{ to: '/bookings', label: 'Мої бронювання' }, { to: '/profile', label: 'Профіль' }] : []),
      ],
    },
    {
      title: 'Акаунт',
      links: isAuthenticated
        ? [{ to: '/profile', label: 'Налаштування' }]
        : [{ to: '/login', label: 'Увійти' }, { to: '/register', label: 'Реєстрація' }],
    },
  ]

  return (
    <Box component="footer" sx={{ position: 'relative', zIndex: 2, mt: 'auto', bgcolor: cr.surface }}>
      <Box aria-hidden sx={{ height: '1px', background: cr.gradLine, boxShadow: `0 0 12px ${tint(cr.primary2, 60)}` }} />
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.6fr 1fr 1fr' }, gap: { xs: 4, md: 6 } }}>
          <Box>
            <Logo />
            <Typography sx={{ mt: 2, color: cr.muted, maxWidth: 340, lineHeight: 1.7, fontSize: '0.92rem' }}>
              Онлайн-бронювання ПК у комп'ютерних клубах. Обирай місце на схемі залу, бронюй час і грай без черг.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
              {SOCIALS.map((s) => (
                <Tooltip key={s.label} title={s.label}>
                  <IconButton
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    sx={{
                      color: cr.muted,
                      border: `1px solid ${cr.border}`,
                      borderRadius: '12px',
                      '&:hover': { color: s.color, borderColor: s.color, bgcolor: tint(s.color, 10), boxShadow: `0 0 18px ${tint(s.color, 45)}` },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          </Box>

          {columns.map((col) => (
            <Box key={col.title} component="nav" aria-label={col.title}>
              <Typography sx={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: cr.faint, mb: 2 }}>
                // {col.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {col.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link component={RouterLink} to={l.to} underline="none" sx={{ color: cr.muted, fontWeight: 600, fontSize: '0.92rem' }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: { xs: 4, md: 6 }, pt: 3, borderTop: `1px solid ${cr.borderSoft}`, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.8rem', color: cr.faint }}>
            © {new Date().getFullYear()} ClubReserve. Всі права захищені.
          </Typography>
          <Typography sx={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.14em', color: cr.faint }}>
            SYS.STATUS: <Box component="span" sx={{ color: cr.successText }}>ONLINE</Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
