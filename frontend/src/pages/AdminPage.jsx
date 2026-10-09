import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PercentIcon from '@mui/icons-material/Percent'
import StarIcon from '@mui/icons-material/Star'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllClubsAdmin, createClub, updateClub, deleteClub } from '../api/clubs'
import { getAllComputersAdmin, createComputer, updateComputer, deleteComputer } from '../api/computers'
import { getAllUsersAdmin, toggleUserAdmin, toggleUserActive } from '../api/users'
import { getAdminStats, getAllReviewsAdmin, deleteReviewAdmin, getAllBookingsAdmin } from '../api/admin'
import { getPromos, createPromo, togglePromo } from '../api/promos'
import { usePageTitle } from '../hooks/usePageTitle'
import { cr, font, tint } from '../design/tokens'
import { EmptyState, GlassCard, HudStat, Mono, PageLoader, SectionHeader, StatusBadge } from '../components/ui'

const emptyClub = { name: '', address: '', description: '', is_active: true }
const emptyComputer = { name: '', description: '', club_id: '', price_per_hour: '', is_active: true }

const ActiveChip = ({ active, trueLabel = 'Активний', falseLabel = 'Неактивний' }) => (
  <StatusBadge status={active ? 'free' : 'inactive'} label={active ? trueLabel : falseLabel} pulse={false} />
)

const Loader = () => <PageLoader minHeight={240} />

// Shared table cell styles (admin = restrained: no motion, mono numbers)
const idCell = { fontFamily: font.mono, color: cr.faint, width: 56 }
const monoCell = { fontFamily: font.mono, fontWeight: 600 }
const actionBtn = (color) => ({ color, '&:hover': { color, bgcolor: tint(color, 12) } })

const AdminPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  usePageTitle('Адмін-панель')

  useEffect(() => {
    if (user && !user.is_admin) navigate('/')
  }, [user, navigate])

  if (!user?.is_admin) return <PageLoader label="Перевірка доступу" />

  return (
    <Box>
      <SectionHeader
        component="h1"
        label="Control panel"
        title="Адмін-панель"
        size="md"
        action={<StatusBadge status="admin" icon={<AdminPanelSettingsIcon sx={{ fontSize: 14 }} />} label={user.username} size="md" />}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 3 }} aria-label="Розділи адмін-панелі">
        <Tab value="stats" label="Статистика" />
        <Tab value="clubs" label="Клуби" />
        <Tab value="computers" label="Комп'ютери" />
        <Tab value="users" label="Користувачі" />
        <Tab value="promos" label="Промо-коди" />
        <Tab value="bookings" label="Бронювання" />
        <Tab value="reviews" label="Відгуки" />
      </Tabs>

      {tab === 'stats'     && <StatsAdmin />}
      {tab === 'clubs'     && <ClubsAdmin />}
      {tab === 'computers' && <ComputersAdmin />}
      {tab === 'users'     && <UsersAdmin />}
      {tab === 'promos'    && <PromosAdmin />}
      {tab === 'bookings'  && <BookingsAdmin />}
      {tab === 'reviews'   && <ReviewsAdmin />}
    </Box>
  )
}

/* ─── Stats Admin ─────────────────────────────────────────── */

const STAT_CARDS = [
  { key: 'total_users',       label: 'Користувачів',   color: cr.cyan },
  { key: 'total_clubs',       label: 'Клубів',         color: cr.primary2 },
  { key: 'total_computers',   label: "Комп'ютерів",    color: cr.primary },
  { key: 'total_bookings',    label: 'Бронювань',      color: cr.magenta },
  { key: 'active_bookings',   label: 'Активних',       color: cr.success },
  { key: 'cancelled_bookings',label: 'Скасованих',     color: cr.danger },
  { key: 'total_reviews',     label: 'Відгуків',       color: cr.vip },
  { key: 'total_revenue',     label: 'Дохід',          color: cr.success, money: true },
]

const StatsAdmin = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError('Помилка завантаження статистики'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!stats) return null

  const topComputers = stats.top_computers || []
  const maxBookings = topComputers[0]?.bookings_count || 1
  const bookingsByDay = stats.bookings_by_day || []
  const maxDay = Math.max(1, ...bookingsByDay.map((d) => d.count))

  return (
    <Box>
      {/* Stat cards grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 }, mb: 3 }}>
        {STAT_CARDS.map(({ key, label, color, money }) => (
          <HudStat
            key={key}
            compact
            hud={false}
            label={label}
            accent={color}
            value={money ? `₴${Number(stats[key] || 0).toFixed(0)}` : (stats[key] ?? 0)}
          />
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {/* Top 5 computers: horizontal neon bars */}
        <GlassCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2.5 }}>Топ 5 комп'ютерів</Typography>
          {topComputers.length === 0 && <EmptyState compact art="pc" title="Немає даних" sx={{ py: 2 }} />}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {topComputers.map((item, idx) => (
              <Box key={idx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 0.75 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, minWidth: 0 }}>
                    <Mono sx={{ fontSize: '0.7rem', color: cr.faint }}>{String(idx + 1).padStart(2, '0')}</Mono>
                    <Typography variant="body2" fontWeight={700} noWrap>{item.computer_name}</Typography>
                    <Typography variant="caption" noWrap sx={{ color: cr.muted }}>{item.club_name}</Typography>
                  </Box>
                  <Mono sx={{ fontWeight: 700, color: cr.text, flexShrink: 0 }}>{item.bookings_count}</Mono>
                </Box>
                <Box sx={{ height: 6, borderRadius: 6, bgcolor: tint(cr.primary, 12), overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${(item.bookings_count / maxBookings) * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${cr.primary2}, ${cr.cyan})`, boxShadow: `0 0 10px ${tint(cr.cyan, 50)}` }} />
                </Box>
              </Box>
            ))}
          </Box>
        </GlassCard>

        {/* Bookings by day: vertical bar chart */}
        <GlassCard sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2.5 }}>
            <Typography variant="h6" component="h3">Бронювань по днях</Typography>
            <Mono sx={{ fontSize: '0.7rem', color: cr.faint }}>14 ДНІВ</Mono>
          </Box>
          {bookingsByDay.length === 0 ? (
            <EmptyState compact art="calendar" title="Немає даних" sx={{ py: 2 }} />
          ) : (
            <Box role="img" aria-label={`Графік бронювань по днях: ${bookingsByDay.map((d) => d.count).join(', ')}`}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.5, sm: 0.75 }, height: 180, borderBottom: `1px solid ${cr.border}`, backgroundImage: `repeating-linear-gradient(0deg, ${cr.borderSoft} 0 1px, transparent 1px 45px)` }}>
                {bookingsByDay.map((item, idx) => (
                  <Tooltip key={idx} title={`${new Date(item.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', weekday: 'short' })}: ${item.count}`}>
                    <Box sx={{ flex: 1, height: `${Math.max((item.count / maxDay) * 100, item.count > 0 ? 4 : 1.5)}%`, borderRadius: '4px 4px 0 0', background: item.count > 0 ? `linear-gradient(180deg, ${cr.cyan}, ${cr.primary})` : tint(cr.faint, 30), boxShadow: item.count > 0 ? `0 0 10px ${tint(cr.primary2, 45)}` : 'none' }} />
                  </Tooltip>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75 }, mt: 0.75 }}>
                {bookingsByDay.map((item, idx) => (
                  <Mono key={idx} sx={{ flex: 1, textAlign: 'center', fontSize: '0.58rem', color: cr.faint }}>
                    {new Date(item.date).getDate()}
                  </Mono>
                ))}
              </Box>
            </Box>
          )}
        </GlassCard>
      </Box>
    </Box>
  )
}

/* ─── Clubs Admin ─────────────────────────────────────────── */

const ClubsAdmin = () => {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyClub)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    getAllClubsAdmin()
      .then(setClubs)
      .catch(() => setError('Помилка завантаження клубів'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyClub); setDialogOpen(true) }
  const openEdit = (club) => {
    setEditing(club)
    setForm({ name: club.name, address: club.address || '', description: club.description || '', is_active: club.is_active })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateClub(editing.id, form)
        setClubs((prev) => prev.map((c) => (c.id === editing.id ? updated : c)))
      } else {
        const created = await createClub(form)
        setClubs((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити клуб? Це видалить усі пов\'язані комп\'ютери та бронювання.')) return
    try {
      await deleteClub(id)
      setClubs((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка видалення')
    }
  }

  if (loading) return <Loader />

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Новий клуб</Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Адреса</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clubs.map((club) => (
              <TableRow key={club.id} hover>
                <TableCell sx={idCell}>{club.id}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{club.name}</TableCell>
                <TableCell sx={{ color: cr.muted, fontSize: '0.85rem' }}>{club.address}</TableCell>
                <TableCell><ActiveChip active={club.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Редагувати">
                    <IconButton size="small" onClick={() => openEdit(club)} aria-label="Редагувати" sx={actionBtn(cr.primaryText)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" onClick={() => handleDelete(club.id)} aria-label="Видалити" sx={actionBtn(cr.dangerText)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Редагувати клуб' : 'Новий клуб'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Назва" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required fullWidth />
          <TextField label="Адреса" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} fullWidth />
          <TextField label="Опис" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} multiline rows={3} fullWidth />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />}
            label="Активний"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

/* ─── Computers Admin ──────────────────────────────────────── */

const ComputersAdmin = () => {
  const [computers, setComputers] = useState([])
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyComputer)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([getAllComputersAdmin(), getAllClubsAdmin()])
      .then(([comp, cl]) => { setComputers(comp); setClubs(cl) })
      .catch(() => setError('Помилка завантаження'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditing(null); setForm(emptyComputer); setDialogOpen(true) }
  const openEdit = (pc) => {
    setEditing(pc)
    setForm({
      name: pc.name,
      description: pc.description || '',
      club_id: pc.club_id,
      price_per_hour: pc.price_per_hour ?? '',
      is_active: pc.is_active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...form,
      club_id: Number(form.club_id),
      price_per_hour: form.price_per_hour !== '' ? Number(form.price_per_hour) : null,
    }
    try {
      if (editing) {
        const { club_id, ...updatePayload } = payload
        const updated = await updateComputer(editing.id, updatePayload)
        setComputers((prev) => prev.map((c) => (c.id === editing.id ? updated : c)))
      } else {
        const created = await createComputer(payload)
        setComputers((prev) => [...prev, created])
      }
      setDialogOpen(false)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити комп\'ютер?')) return
    try {
      await deleteComputer(id)
      setComputers((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка видалення')
    }
  }

  const clubName = (id) => clubs.find((c) => c.id === id)?.name ?? `ID ${id}`

  if (loading) return <Loader />

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Новий комп'ютер</Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Назва</TableCell>
              <TableCell>Клуб</TableCell>
              <TableCell>Ціна/год</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {computers.map((pc) => (
              <TableRow key={pc.id} hover>
                <TableCell sx={idCell}>{pc.id}</TableCell>
                <TableCell sx={monoCell}>{pc.name}</TableCell>
                <TableCell sx={{ color: cr.muted, fontSize: '0.85rem' }}>{clubName(pc.club_id)}</TableCell>
                <TableCell sx={monoCell}>
                  {pc.price_per_hour ? `₴${Number(pc.price_per_hour).toFixed(0)}` : '—'}
                </TableCell>
                <TableCell><ActiveChip active={pc.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Редагувати">
                    <IconButton size="small" onClick={() => openEdit(pc)} aria-label="Редагувати" sx={actionBtn(cr.primaryText)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" onClick={() => handleDelete(pc.id)} aria-label="Видалити" sx={actionBtn(cr.dangerText)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Редагувати комп'ютер" : "Новий комп'ютер"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="Назва" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required fullWidth />
          <TextField label="Опис" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} multiline rows={2} fullWidth />
          {!editing && (
            <TextField
              select label="Клуб" value={form.club_id} onChange={(e) => setForm((f) => ({ ...f, club_id: e.target.value }))}
              required fullWidth SelectProps={{ native: true }}
            >
              <option value="">— Оберіть клуб —</option>
              {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </TextField>
          )}
          <TextField
            label="Ціна за годину (₴)" type="number" value={form.price_per_hour}
            onChange={(e) => setForm((f) => ({ ...f, price_per_hour: e.target.value }))}
            inputProps={{ min: 0, step: 5 }} fullWidth
          />
          <FormControlLabel
            control={<Switch checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />}
            label="Активний"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || (!editing && !form.club_id)}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

/* ─── Users Admin ──────────────────────────────────────────── */

const UsersAdmin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllUsersAdmin()
      .then(setUsers)
      .catch(() => setError('Помилка завантаження користувачів'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleAdmin = async (id) => {
    try {
      const updated = await toggleUserAdmin(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка')
    }
  }

  const handleToggleActive = async (id) => {
    try {
      const updated = await toggleUserActive(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка')
    }
  }

  if (loading) return <Loader />

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Адмін</TableCell>
              <TableCell>Активний</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={idCell}>{u.id}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{u.username}</TableCell>
                <TableCell sx={{ color: cr.muted, fontSize: '0.85rem' }}>{u.email}</TableCell>
                <TableCell>
                  <StatusBadge status={u.is_admin ? 'admin' : 'inactive'} label={u.is_admin ? 'Адмін' : 'Юзер'} pulse={false} />
                </TableCell>
                <TableCell><ActiveChip active={u.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title={u.is_admin ? 'Зняти права адміна' : 'Надати права адміна'}>
                    <IconButton size="small" onClick={() => handleToggleAdmin(u.id)} aria-label={u.is_admin ? 'Зняти права адміна' : 'Надати права адміна'} sx={actionBtn(cr.primaryText)}>
                      <AdminPanelSettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={u.is_active ? 'Заблокувати' : 'Розблокувати'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(u.id)}
                      aria-label={u.is_active ? 'Заблокувати' : 'Розблокувати'}
                      sx={actionBtn(u.is_active ? cr.successText : cr.dangerText)}
                    >
                      {u.is_active ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

/* ─── Promos Admin ─────────────────────────────────────────── */

const emptyPromo = { code: '', discount_percent: '', max_uses: '' }

const PromosAdmin = () => {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyPromo)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPromos()
      .then(setPromos)
      .catch(() => setError('Помилка завантаження промо-кодів'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    setSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase(),
        discount_percent: Number(form.discount_percent),
        ...(form.max_uses !== '' ? { max_uses: Number(form.max_uses) } : {}),
      }
      const created = await createPromo(payload)
      setPromos((prev) => [created, ...prev])
      setDialogOpen(false)
      setForm(emptyPromo)
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка створення')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      const updated = await togglePromo(id)
      setPromos((prev) => prev.map((p) => (p.id === id ? updated : p)))
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка')
    }
  }

  if (loading) return <Loader />

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyPromo); setDialogOpen(true) }}>
          Новий промо-код
        </Button>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Код</TableCell>
              <TableCell>Знижка (%)</TableCell>
              <TableCell>Використано</TableCell>
              <TableCell>Макс. використань</TableCell>
              <TableCell>Активний</TableCell>
              <TableCell align="right">Дії</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {promos.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell sx={idCell}>{p.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} sx={{ fontFamily: font.mono, letterSpacing: '0.08em', color: cr.primaryText }}>
                    {p.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PercentIcon sx={{ fontSize: 14, color: cr.successText }} />
                    <Typography variant="body2" fontWeight={700} sx={{ fontFamily: font.mono, color: cr.successText }}>
                      {p.discount_percent}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={monoCell}>{p.used_count ?? 0}</TableCell>
                <TableCell sx={monoCell}>{p.max_uses ?? '—'}</TableCell>
                <TableCell><ActiveChip active={p.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title={p.is_active ? 'Деактивувати' : 'Активувати'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggle(p.id)}
                      aria-label={p.is_active ? 'Деактивувати' : 'Активувати'}
                      sx={actionBtn(p.is_active ? cr.successText : cr.muted)}
                    >
                      {p.is_active ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Новий промо-код</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Код"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            required
            fullWidth
            inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'var(--cr-font-mono)', letterSpacing: 2 } }}
          />
          <TextField
            label="Знижка %"
            type="number"
            value={form.discount_percent}
            onChange={(e) => setForm((f) => ({ ...f, discount_percent: e.target.value }))}
            required
            fullWidth
            inputProps={{ min: 1, max: 100 }}
          />
          <TextField
            label="Макс. використань (необов'язково)"
            type="number"
            value={form.max_uses}
            onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Скасувати</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !form.code || !form.discount_percent}
          >
            {saving ? 'Створення...' : 'Створити'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

/* ─── Bookings Admin ───────────────────────────────────────── */

const fmtDate = (d) => new Date(d).toLocaleString('uk-UA', {
  day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
})

const UserCell = ({ username, userId }) => (
  <TableCell>
    <Typography variant="body2" fontWeight={700}>{username}</Typography>
    <Mono sx={{ fontSize: '0.7rem', color: cr.faint }}>ID {userId}</Mono>
  </TableCell>
)

const BookingsAdmin = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllBookingsAdmin()
      .then(setBookings)
      .catch(() => setError('Помилка завантаження бронювань'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {bookings.length === 0 && !error ? (
        <GlassCard><EmptyState compact art="calendar" title="Бронювань ще немає" /></GlassCard>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Користувач</TableCell>
                <TableCell>Комп'ютер</TableCell>
                <TableCell>Клуб</TableCell>
                <TableCell>Початок</TableCell>
                <TableCell>Кінець</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={idCell}>{b.id}</TableCell>
                  <UserCell username={b.username} userId={b.user_id} />
                  <TableCell sx={monoCell}>{b.computer_name ?? `ID ${b.computer_id}`}</TableCell>
                  <TableCell sx={{ color: cr.muted, fontSize: '0.85rem' }}>{b.club_name ?? '—'}</TableCell>
                  <TableCell sx={{ ...monoCell, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtDate(b.start_time)}</TableCell>
                  <TableCell sx={{ ...monoCell, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{fmtDate(b.end_time)}</TableCell>
                  <TableCell><StatusBadge status={b.status} pulse={false} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

/* ─── Reviews Admin ────────────────────────────────────────── */

const ReviewsAdmin = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAllReviewsAdmin()
      .then(setReviews)
      .catch(() => setError('Помилка завантаження відгуків'))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Видалити цей відгук?')) return
    try {
      await deleteReviewAdmin(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (e) {
      setError(e.response?.data?.detail || 'Помилка видалення')
    }
  }

  if (loading) return <Loader />

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {reviews.length === 0 && !error ? (
        <GlassCard><EmptyState compact art="search" title="Відгуків ще немає" /></GlassCard>
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Користувач</TableCell>
                <TableCell>Клуб</TableCell>
                <TableCell>Оцінка</TableCell>
                <TableCell>Коментар</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={idCell}>{r.id}</TableCell>
                  <UserCell username={r.username} userId={r.user_id} />
                  <TableCell sx={{ color: cr.muted, fontSize: '0.85rem' }}>{r.club_name ?? `ID ${r.club_id}`}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <StarIcon sx={{ fontSize: 14, color: cr.vip }} />
                      <Mono sx={{ fontWeight: 700, color: cr.vipText }}>{r.rating}</Mono>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 280 }}>
                    <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: r.comment ? cr.text : cr.faint }}>
                      {r.comment || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ ...monoCell, fontSize: '0.8rem', whiteSpace: 'nowrap', color: cr.muted }}>
                    {new Date(r.created_at).toLocaleDateString('uk-UA')}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Видалити відгук">
                      <IconButton size="small" onClick={() => handleDelete(r.id)} aria-label="Видалити відгук" sx={actionBtn(cr.dangerText)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

export default AdminPage
