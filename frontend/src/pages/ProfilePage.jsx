import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
  Chip,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { updateMe } from '../api/users'
import PersonIcon from '@mui/icons-material/Person'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

const ProfilePage = () => {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const updateMutation = useMutation({
    mutationFn: (data) => updateMe(data),
    onSuccess: () => {
      setEditing(false)
      setSuccess(true)
      setError('')
      setTimeout(() => setSuccess(false), 3000)
    },
    onError: (err) => {
      setError(err.response?.data?.detail || 'Помилка оновлення профілю')
    },
  })

  const handleSave = (e) => {
    e.preventDefault()
    setError('')
    updateMutation.mutate(form)
  }

  const handleCancel = () => {
    setForm({ username: user?.username || '', email: user?.email || '' })
    setEditing(false)
    setError('')
  }

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Профіль
      </Typography>

      {success && <Alert severity="success" sx={{ mb: 2 }}>Профіль оновлено успішно!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
            }}
          >
            {user.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {user.username}
            </Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {user.is_admin && <Chip label="Адмін" color="error" size="small" />}
              <Chip
                label={user.is_active ? 'Активний' : 'Неактивний'}
                color={user.is_active ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {!editing ? (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Ім'я користувача
                  </Typography>
                </Box>
                <Typography fontWeight={600}>{user.username}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Email
                </Typography>
                <Typography fontWeight={600}>{user.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  ID користувача
                </Typography>
                <Typography fontWeight={600}>#{user.id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Дата реєстрації
                </Typography>
                <Typography fontWeight={600}>
                  {new Date(user.created_at).toLocaleDateString('uk-UA')}
                </Typography>
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Редагувати профіль
            </Button>
          </>
        ) : (
          <Box component="form" onSubmit={handleSave}>
            <TextField
              fullWidth
              label="Ім'я користувача"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Зберегти'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                Скасувати
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ProfilePage
