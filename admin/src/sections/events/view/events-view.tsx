import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/utils/api-client';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useAuth } from 'src/auth/auth-context';

import { EventCard } from '../event-card';

import type { EventProps } from '../event-card';

// ----------------------------------------------------------------------

export function EventsView() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const userIdFilter = searchParams.get('user_id') || '';

  const [events, setEvents] = useState<EventProps[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');

  // Dropdown list data
  const [users, setUsers] = useState<any[]>([]);
  const [eventTypes, setEventTypes] = useState<any[]>([]);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventProps | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  const [formFields, setFormFields] = useState({
    name: '',
    description: '',
    user_id: '',
    start_date: '',
    end_date: '',
    event_date: '',
    url: '',
    event_type_id: '',
    slug: '',
  });

  // Fetch events list
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = `/events?page=${page}&limit=${limit}&search=${search}`;
      if (userIdFilter) {
        query += `&user_id=${userIdFilter}`;
      }
      const response = await api.get(query);
      setEvents(response.data || []);
      setTotalEvents(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, userIdFilter]);

  // Fetch dropdown collections
  const fetchDropdownData = useCallback(async () => {
    try {
      const [typesRes, usersRes] = await Promise.all([
        api.get('/event-types?limit=1000'),
        currentUser?.user_type === 'super_admin' ? api.get('/users?limit=1000') : Promise.resolve({ data: [] }),
      ]);
      setEventTypes(typesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Error fetching dropdown options:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchDropdownData();
  }, [fetchDropdownData]);

  // Actions
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormFields({
      name: '',
      description: '',
      user_id: currentUser?.user_type === 'super_admin' ? '' : currentUser?.id || '',
      start_date: '',
      end_date: '',
      event_date: '',
      url: '',
      event_type_id: '',
      slug: '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (evt: EventProps) => {
    setEditingEvent(evt);
    setFormFields({
      name: evt.name,
      description: evt.description || '',
      user_id: evt.user_id,
      start_date: evt.start_date ? new Date(evt.start_date).toISOString().slice(0, 16) : '',
      end_date: evt.end_date ? new Date(evt.end_date).toISOString().slice(0, 16) : '',
      event_date: evt.event_date ? new Date(evt.event_date).toISOString().slice(0, 10) : '',
      url: evt.url || '',
      event_type_id: evt.event_type_id,
      slug: evt.slug,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (err: any) {
        alert(err.message || 'Failed to delete event');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittingForm(true);

    try {
      const payload = {
        name: formFields.name,
        description: formFields.description || undefined,
        user_id: formFields.user_id,
        start_date: new Date(formFields.start_date).toISOString(),
        end_date: new Date(formFields.end_date).toISOString(),
        event_date: new Date(formFields.event_date).toISOString(),
        url: formFields.url || undefined,
        event_type_id: formFields.event_type_id,
        slug: formFields.slug,
      };

      if (editingEvent) {
        await api.patch(`/events/${editingEvent.id}`, payload);
      } else {
        await api.post('/events', payload);
      }

      setDialogOpen(false);
      fetchEvents();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save event. Check fields and slug.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const pageCount = Math.ceil(totalEvents / limit);

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Events {userIdFilter && '(Filtered by User)'}
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          New Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ maxWidth: 320 }}
          InputProps={{
            startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', mr: 1 }} />,
          }}
        />
        {userIdFilter && (
          <Button variant="outlined" onClick={() => router.push('/events')}>
            Clear User Filter
          </Button>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {events.map((evt) => (
              <Grid key={evt.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <EventCard
                  event={evt}
                  onEdit={() => handleOpenEdit(evt)}
                  onDelete={() => handleDelete(evt.id)}
                  onView={() => router.push(`/events/${evt.id}`)}
                />
              </Grid>
            ))}
            {events.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    No events found.
                  </Typography>
                </Card>
              </Grid>
            )}
          </Grid>

          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}
            />
          )}
        </>
      )}

      {/* Create/Edit Event Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Event Name"
              required
              fullWidth
              value={formFields.name}
              onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formFields.description}
              onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
            />

            <TextField
              label="Slug"
              required
              fullWidth
              value={formFields.slug}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
                setFormFields({ ...formFields, slug: val });
              }}
              placeholder="only_letters_numbers_and_underscores"
              helperText="Only letters, numbers, and underscores are allowed. No spaces/special characters."
            />

            <TextField
              label="Event URL"
              fullWidth
              value={formFields.url}
              onChange={(e) => setFormFields({ ...formFields, url: e.target.value })}
              placeholder="https://example.com/live-link"
            />

            {currentUser?.user_type === 'super_admin' ? (
              <FormControl fullWidth required>
                <InputLabel id="event-user-label">Assigned User</InputLabel>
                <Select
                  labelId="event-user-label"
                  label="Assigned User"
                  value={formFields.user_id}
                  onChange={(e) => setFormFields({ ...formFields, user_id: e.target.value })}
                >
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            <FormControl fullWidth required>
              <InputLabel id="event-type-label">Event Type</InputLabel>
              <Select
                labelId="event-type-label"
                label="Event Type"
                value={formFields.event_type_id}
                onChange={(e) => setFormFields({ ...formFields, event_type_id: e.target.value })}
              >
                {eventTypes.map((et) => (
                  <MenuItem key={et.id} value={et.id}>
                    {et.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Event Date"
              required
              fullWidth
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formFields.event_date}
              onChange={(e) => setFormFields({ ...formFields, event_date: e.target.value })}
            />

            <TextField
              label="Start Date & Time"
              required
              fullWidth
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={formFields.start_date}
              onChange={(e) => setFormFields({ ...formFields, start_date: e.target.value })}
            />

            <TextField
              label="End Date & Time"
              required
              fullWidth
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={formFields.end_date}
              onChange={(e) => setFormFields({ ...formFields, end_date: e.target.value })}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={submittingForm}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="inherit" disabled={submittingForm}>
              {submittingForm ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </DashboardContent>
  );
}
