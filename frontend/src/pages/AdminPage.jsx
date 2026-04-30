import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
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
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getAllClubsAdmin, createClub, updateClub, deleteClub } from '../api/clubs'
import { getAllComputersAdmin, createComputer, updateComputer, deleteComputer } from '../api/computers'
import { getAllUsersAdmin, toggleUserAdmin, toggleUserActive } from '../api/users'
import { getAdminStats } from '../api/admin'
import { getPromos, createPromo, togglePromo } from '../api/promos'

const emptyClub = { name: '', address: '', description: '', is_active: true }
const emptyComputer = { name: '', description: '', club_id: '', price_per_hour: '', is_active: true }

const PURPLE_SWITCH_SX = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#a855f7' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#a855f7' },
}

const ActiveChip = ({ active, trueLabel = 'Активний', falseLabel = 'Неактивний' }) => (
  <Chip
    label={active ? trueLabel : falseLabel}
    size="small"
    sx={{
      bgcolor: active ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
      color: active ? '#10b981' : '#6b7280',
      border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.3)'}`,
    }}
  />
)

const AdminPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')

  useEffect(() => {
    if (user && !user.is_admin) navigate('/')
  }, [user, navigate])

  if (!user?.is_admin) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <AdminPanelSettingsIcon sx={{ color: '#a855f7', fontSize: 32 }} />
        <Typography variant="h4" fontWeight={700} sx={{
          background: 'linear-gradient(135deg,#e2e8f0,#a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Адмін-панель
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          '& .MuiTabs-indicator': { backgroundColor: '#a855f7' },
          '& .Mui-selected': { color: '#a855f7 !important' },
          borderBottom: '1px solid rgba(147,51,234,0.2)',
        }}
      >
        <Tab value="stats" label="Статистика" />
        <Tab value="clubs" label="Клуби" />
        <Tab value="computers" label="Комп'ютери" />
        <Tab value="users" label="Користувачі" />
        <Tab value="promos" label="Промо-коди" />
      </Tabs>

      {tab === 'stats'     && <StatsAdmin />}
      {tab === 'clubs'     && <ClubsAdmin />}
      {tab === 'computers' && <ComputersAdmin />}
      {tab === 'users'     && <UsersAdmin />}
      {tab === 'promos'    && <PromosAdmin />}
    </Box>
  )
}

/* ─── Stats Admin ─────────────────────────────────────────── */

const STAT_CARDS = [
  { key: 'total_users',       label: 'Користувачів',   color: '#818cf8' },
  { key: 'total_clubs',       label: 'Клубів',         color: '#a855f7' },
  { key: 'total_computers',   label: "Комп'ютерів",    color: '#9333ea' },
  { key: 'total_bookings',    label: 'Бронювань',      color: '#6366f1' },
  { key: 'active_bookings',   label: 'Активних',       color: '#10b981' },
  { key: 'cancelled_bookings',label: 'Скасованих',     color: '#ef4444' },
  { key: 'total_reviews',     label: 'Відгуків',       color: '#f59e0b' },
  { key: 'total_revenue',     label: 'Дохід (₴)',      color: '#10b981', money: true },
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!stats) return null

  const topComputers = stats.top_computers || []
  const maxBookings = topComputers[0]?.bookings_count || 1
  const bookingsByDay = stats.bookings_by_day || []

  return (
    <Box>
      {/* Stat cards grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2, mb: 4 }}>
        {STAT_CARDS.map(({ key, label, color, money }) => (
          <Paper key={key} sx={(theme) => ({
            p: 2.5, borderRadius: 2, textAlign: 'center',
            background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#faf7ff',
            border: `1px solid ${color}33`,
          })}>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {money
                ? `₴${Number(stats[key] || 0).toFixed(0)}`
                : (stats[key] ?? 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Top 5 computers */}
        <Box sx={(theme) => ({
          p: 3, borderRadius: 2,
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#faf7ff',
          border: '1px solid rgba(147,51,234,0.15)',
        })}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Топ 5 комп'ютерів
          </Typography>
          {topComputers.length === 0 && (
            <Typography color="text.disabled" variant="body2">Немає даних</Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {topComputers.map((item, idx) => (
              <Box key={idx}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '60%' }}>
                    {item.computer_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.club_name}
                    </Typography>
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#a855f7', flexShrink: 0 }}>
                      {item.bookings_count}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(item.bookings_count / maxBookings) * 100}
                  sx={{
                    height: 6, borderRadius: 3,
                    bgcolor: 'rgba(168,85,247,0.12)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#a855f7', borderRadius: 3 },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Bookings by day */}
        <Box sx={(theme) => ({
          p: 3, borderRadius: 2,
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#faf7ff',
          border: '1px solid rgba(147,51,234,0.15)',
        })}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            Бронювань по днях (14 днів)
          </Typography>
          {bookingsByDay.length === 0 && (
            <Typography color="text.disabled" variant="body2">Немає даних</Typography>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {bookingsByDay.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(item.date).toLocaleDateString('uk-UA', { day: '2-digit', month: 'short', weekday: 'short' })}
                </Typography>
                <Chip
                  label={item.count}
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.7rem', fontWeight: 700,
                    bgcolor: item.count > 0 ? 'rgba(168,85,247,0.15)' : 'rgba(107,114,128,0.1)',
                    color: item.count > 0 ? '#a855f7' : '#6b7280',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Новий клуб</Button>
      </Box>

      <TableContainer sx={(theme) => ({ borderRadius: 2, border: `1px solid ${theme.palette.divider}` })}>
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
                <TableCell sx={{ color: 'text.disabled', width: 50 }}>{club.id}</TableCell>
                <TableCell fontWeight={600}>{club.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{club.address}</TableCell>
                <TableCell><ActiveChip active={club.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Редагувати">
                    <IconButton size="small" onClick={() => openEdit(club)} sx={{ color: '#a855f7' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" onClick={() => handleDelete(club.id)} sx={{ color: '#ef4444' }}>
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
            control={<Switch checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} sx={PURPLE_SWITCH_SX} />}
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Новий комп'ютер</Button>
      </Box>

      <TableContainer sx={(theme) => ({ borderRadius: 2, border: `1px solid ${theme.palette.divider}` })}>
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
                <TableCell sx={{ color: 'text.disabled', width: 50 }}>{pc.id}</TableCell>
                <TableCell>{pc.name}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{clubName(pc.club_id)}</TableCell>
                <TableCell sx={{ color: '#a855f7', fontWeight: 600 }}>
                  {pc.price_per_hour ? `₴${Number(pc.price_per_hour).toFixed(0)}` : '—'}
                </TableCell>
                <TableCell><ActiveChip active={pc.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Редагувати">
                    <IconButton size="small" onClick={() => openEdit(pc)} sx={{ color: '#a855f7' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Видалити">
                    <IconButton size="small" onClick={() => handleDelete(pc.id)} sx={{ color: '#ef4444' }}>
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
            control={<Switch checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} sx={PURPLE_SWITCH_SX} />}
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <TableContainer sx={(theme) => ({ borderRadius: 2, border: `1px solid ${theme.palette.divider}` })}>
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
                <TableCell sx={{ color: 'text.disabled', width: 50 }}>{u.id}</TableCell>
                <TableCell fontWeight={600}>{u.username}</TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    label={u.is_admin ? 'Адмін' : 'Юзер'}
                    size="small"
                    sx={{
                      bgcolor: u.is_admin ? 'rgba(168,85,247,0.15)' : 'rgba(107,114,128,0.1)',
                      color: u.is_admin ? '#a855f7' : '#6b7280',
                      border: `1px solid ${u.is_admin ? 'rgba(168,85,247,0.4)' : 'rgba(107,114,128,0.3)'}`,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell><ActiveChip active={u.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title={u.is_admin ? 'Зняти права адміна' : 'Надати права адміна'}>
                    <IconButton size="small" onClick={() => handleToggleAdmin(u.id)} sx={{ color: '#a855f7' }}>
                      <AdminPanelSettingsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={u.is_active ? 'Заблокувати' : 'Розблокувати'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleActive(u.id)}
                      sx={{ color: u.is_active ? '#10b981' : '#ef4444' }}
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyPromo); setDialogOpen(true) }}>
          Новий промо-код
        </Button>
      </Box>

      <TableContainer sx={(theme) => ({ borderRadius: 2, border: `1px solid ${theme.palette.divider}` })}>
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
                <TableCell sx={{ color: 'text.disabled', width: 50 }}>{p.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'monospace', color: '#a855f7' }}>
                    {p.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PercentIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
                      {p.discount_percent}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{p.used_count ?? 0}</TableCell>
                <TableCell>{p.max_uses ?? '—'}</TableCell>
                <TableCell><ActiveChip active={p.is_active} /></TableCell>
                <TableCell align="right">
                  <Tooltip title={p.is_active ? 'Деактивувати' : 'Активувати'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggle(p.id)}
                      sx={{ color: p.is_active ? '#10b981' : '#6b7280' }}
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
            inputProps={{ style: { textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: 2 } }}
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

export default AdminPage
