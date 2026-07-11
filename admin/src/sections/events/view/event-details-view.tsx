import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/utils/api-client';
import { fDate } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { WeddingTemplate } from '../templated/wedding-template';
import { getTemplateComponent } from '../templated';

// ----------------------------------------------------------------------

type EventTemplateField = {
  field_id: string;
  value: string;
  field: {
    id: string;
    identifier: string;
    type: 'text' | 'image' | 'date' | 'long_text' | 'location';
  };
};

type EventTemplateProps = {
  id: string;
  event_id: string;
  template_id: string;
  is_enabled: boolean;
  template: {
    id: string;
    name: string;
    slug: string;
    code: string;
    price: string;
    preview_image: string | null;
    view_page: string | null;
    template_fields: {
      field: {
        id: string;
        identifier: string;
        type: 'text' | 'image' | 'date' | 'long_text' | 'location';
      };
    }[];
  };
  event_template_fields: EventTemplateField[];
};

type EventDetails = {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  event_date: string;
  url: string | null;
  event_type_id: string;
  slug: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile_pic: string | null;
  };
  event_type: {
    name: string;
  };
  event_templates: EventTemplateProps[];
};

export function EventDetailsView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [eventData, setEventData] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected event template for previewing/editing
  const [selectedEventTemplateId, setSelectedEventTemplateId] = useState<string>('');

  // Dropdown list templates of the same event type
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  // Dialog states
  const [addTemplateOpen, setAddTemplateOpen] = useState(false);
  const [addingTemplateId, setAddingTemplateId] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const [editFieldsOpen, setEditFieldsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fieldsState, setFieldsState] = useState<Record<string, string>>({});

  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/events/${id}`);
      setEventData(res);
      // Auto-select the first template or enabled one if none selected
      if (res.event_templates && res.event_templates.length > 0) {
        const enabled = res.event_templates.find((t: any) => t.is_enabled);
        if (enabled) {
          setSelectedEventTemplateId(enabled.id);
        } else if (!selectedEventTemplateId) {
          setSelectedEventTemplateId(res.event_templates[0].id);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  }, [id, selectedEventTemplateId]);

  const fetchAvailableTemplates = useCallback(async () => {
    if (!eventData?.event_type_id) return;
    try {
      const res = await api.get(`/templates?limit=1000&event_type_id=${eventData.event_type_id}`);
      setAvailableTemplates(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [eventData?.event_type_id]);

  useEffect(() => {
    fetchEventDetails();
  }, [id, fetchEventDetails]);

  useEffect(() => {
    if (eventData) {
      fetchAvailableTemplates();
    }
  }, [eventData, fetchAvailableTemplates]);

  // Enable/Disable Template
  const handleToggleTemplate = async (eventTemplateId: string, currentEnabled: boolean) => {
    try {
      if (currentEnabled) {
        await api.patch(`/events/templates/${eventTemplateId}/disable`, {});
      } else {
        await api.patch(`/events/templates/${eventTemplateId}/enable`, {});
      }
      fetchEventDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle template status');
    }
  };

  // Add Template Action
  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !addingTemplateId) return;
    setSubmitLoading(true);
    try {
      await api.post(`/events/${id}/templates`, { template_id: addingTemplateId });
      setAddTemplateOpen(false);
      setAddingTemplateId('');
      fetchEventDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to associate template to event');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Prepare Edit Fields modal
  const handleOpenEditFields = (evtTemplate: EventTemplateProps) => {
    const defaultFields: Record<string, string> = {};
    // Pre-fill existing values
    evtTemplate.template.template_fields.forEach((tf) => {
      const matchedValue = evtTemplate.event_template_fields.find((f) => f.field_id === tf.field.id);
      defaultFields[tf.field.id] = matchedValue ? matchedValue.value : '';
    });
    setFieldsState(defaultFields);
    setEditFieldsOpen(true);
  };

  // Save Fields
  const handleSaveFields = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const fieldsPayload = Object.keys(fieldsState).map((fid) => ({
        field_id: fid,
        value: fieldsState[fid],
      }));
      await api.put(`/events/templates/${selectedEventTemplateId}/fields`, {
        fields: fieldsPayload,
      });
      setEditFieldsOpen(false);
      fetchEventDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to save field values');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading && !eventData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !eventData) {
    return (
      <DashboardContent>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Event not found.'}
        </Alert>
        <Button variant="contained" onClick={() => router.push('/events')}>
          Back to Events
        </Button>
      </DashboardContent>
    );
  }

  const selectedEventTemplate = eventData.event_templates.find((t) => t.id === selectedEventTemplateId);

  return (
    <DashboardContent>
      <Box sx={{ mb: 5, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push('/events')}
          startIcon={<Iconify icon={"eva:arrow-back-fill" as any} />}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Event Details
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Event Details & Templates List */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            {/* Event Info Card */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {eventData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {eventData.description || 'No description.'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Event Type</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{eventData.event_type.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Event Date</Typography>
                  <Typography variant="body2">{fDate(eventData.event_date)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body2">{new Date(eventData.start_date).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                  <Typography variant="body2">{new Date(eventData.end_date).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Owner</Typography>
                  <Typography variant="body2">{eventData.user.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" color="text.secondary">Slug</Typography>
                  <Label variant="soft" color="info">{eventData.slug}</Label>
                </Box>
                {eventData.url && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" color="text.secondary">Live URL</Typography>
                    <Typography
                      variant="body2"
                      component="a"
                      href={eventData.url}
                      target="_blank"
                      rel="noopener"
                      sx={{ color: 'primary.main', textDecoration: 'underline' }}
                    >
                      Visit Event
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Associated Templates list */}
            <Card sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Event Templates</Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="inherit"
                  startIcon={<Iconify icon={"mingcute:add-line" as any} />}
                  onClick={() => setAddTemplateOpen(true)}
                >
                  Add Template
                </Button>
              </Box>

              <Stack spacing={2} divider={<Divider />}>
                {eventData.event_templates.map((et) => (
                  <Box
                    key={et.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: selectedEventTemplateId === et.id ? 'action.selected' : 'transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => setSelectedEventTemplateId(et.id)}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack spacing={0.5}>
                        <Typography variant="subtitle2">{et.template.name}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Label color={et.is_enabled ? 'success' : 'default'} variant="soft">
                            {et.is_enabled ? 'Enabled' : 'Disabled'}
                          </Label>
                          <Typography variant="caption" color="text.secondary">
                            Code: {et.template.code}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={et.is_enabled}
                              onChange={() => handleToggleTemplate(et.id, et.is_enabled)}
                              size="small"
                            />
                          }
                          label="Enable"
                          sx={{ m: 0 }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
                {eventData.event_templates.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                    No templates associated with this event. Click Add Template to choose one.
                  </Typography>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right Side: Template Preview & Fields Area */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedEventTemplate ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box>
                    <Typography variant="h5">{selectedEventTemplate.template.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Template Code: {selectedEventTemplate.template.code}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<Iconify icon={"solar:eye-bold" as any} />}
                      onClick={() => setPreviewOpen(true)}
                    >
                      Preview Live Page
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Iconify icon={"solar:pen-bold" as any} />}
                      onClick={() => handleOpenEditFields(selectedEventTemplate)}
                    >
                      Edit Fields
                    </Button>
                  </Stack>
                </Box>

                {selectedEventTemplate.template.view_page ||
                selectedEventTemplate.template.code?.toLowerCase().includes('wed') ||
                selectedEventTemplate.template.slug?.toLowerCase().includes('wedding') ||
                selectedEventTemplate.template.name?.toLowerCase().includes('wedding') ? (
                  (() => {
                    const SelectedComponent = selectedEventTemplate.template.view_page
                      ? getTemplateComponent(selectedEventTemplate.template.view_page)
                      : null;
                    const ComponentToRender = SelectedComponent || WeddingTemplate;
                    return (
                      <ComponentToRender
                        event={{
                          name: eventData.name,
                          description: eventData.description,
                          event_date: eventData.event_date,
                          start_date: eventData.start_date,
                        }}
                        fields={selectedEventTemplate.event_template_fields}
                      />
                    );
                  })()
                ) : (
                  <>
                    {selectedEventTemplate.template.preview_image && (
                      <Box
                        component="img"
                        src={selectedEventTemplate.template.preview_image}
                        alt="Preview"
                        sx={{ width: 1, maxHeight: 240, objectFit: 'cover', borderRadius: 1.5, mb: 3 }}
                      />
                    )}

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      Saved Fields & Values
                    </Typography>

                    <Stack spacing={2} divider={<Divider />}>
                      {selectedEventTemplate.template.template_fields.map((tf) => {
                        const matchedVal = selectedEventTemplate.event_template_fields.find(
                          (val) => val.field_id === tf.field.id
                        );
                        return (
                          <Box key={tf.field.id} sx={{ py: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack>
                                <Typography variant="subtitle2">{tf.field.identifier}</Typography>
                                <Label variant="soft" color="info" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
                                  Type: {tf.field.type}
                                </Label>
                              </Stack>
                              <Typography variant="body2" sx={{ fontWeight: 'medium', maxWidth: '60%', textAlign: 'right' }}>
                                {matchedVal ? matchedVal.value : <em style={{ color: '#aaa' }}>Empty</em>}
                              </Typography>
                            </Stack>
                          </Box>
                        );
                      })}
                      {selectedEventTemplate.template.template_fields.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No fields are mapped to this template.
                        </Typography>
                      )}
                    </Stack>
                  </>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 1, py: 8 }}>
                <Iconify icon={"solar:palette-bold" as any} width={64} sx={{ color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No Template Selected
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  Add a template and select it from the sidebar list to manage custom fields.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Add Template Dialog */}
      <Dialog open={addTemplateOpen} onClose={() => setAddTemplateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Template to Event</DialogTitle>
        <form onSubmit={handleAddTemplate}>
          <DialogContent sx={{ pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel id="add-template-select-label">Choose Template</InputLabel>
              <Select
                labelId="add-template-select-label"
                label="Choose Template"
                value={addingTemplateId}
                onChange={(e) => setAddingTemplateId(e.target.value)}
              >
                {availableTemplates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} (Code: {t.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setAddTemplateOpen(false)} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="inherit" disabled={submitLoading || !addingTemplateId}>
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Fields Values Dialog */}
      {selectedEventTemplate && (
        <Dialog open={editFieldsOpen} onClose={() => setEditFieldsOpen(false)} maxWidth="lg" fullWidth>
          <DialogTitle>Edit Template Fields</DialogTitle>
          <form onSubmit={handleSaveFields}>
            <DialogContent sx={{ pt: 1 }}>
              <Grid container spacing={3}>
                {/* Form Fields (Left) */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack spacing={2.5}>
                    {selectedEventTemplate.template.template_fields.map((tf) => {
                      const f = tf.field;
                      if (f.type === 'long_text') {
                        return (
                          <TextField
                            key={f.id}
                            label={`${f.identifier} (${f.type})`}
                            fullWidth
                            multiline
                            rows={3}
                            value={fieldsState[f.id] || ''}
                            onChange={(e) => setFieldsState({ ...fieldsState, [f.id]: e.target.value })}
                          />
                        );
                      }
                      if (f.type === 'date') {
                        return (
                          <TextField
                            key={f.id}
                            label={`${f.identifier} (${f.type})`}
                            fullWidth
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={fieldsState[f.id] || ''}
                            onChange={(e) => setFieldsState({ ...fieldsState, [f.id]: e.target.value })}
                          />
                        );
                      }
                      if (f.type === 'image') {
                        return (
                          <Box key={f.id} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="subtitle2">{f.identifier} (Image upload)</Typography>
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<Iconify icon={"solar:upload-bold" as any} />}
                            >
                              Choose File
                              <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const formData = new FormData();
                                      formData.append('file', file);
                                      const res = await api.upload('/upload', formData);
                                      setFieldsState((prev) => ({ ...prev, [f.id]: res.url }));
                                    } catch (err: any) {
                                      alert(err.message || 'File upload failed');
                                    }
                                  }
                                }}
                              />
                            </Button>
                            {fieldsState[f.id] && (
                              <Box
                                component="img"
                                src={fieldsState[f.id]}
                                alt="Uploaded Preview"
                                sx={{ width: 1, maxHeight: 120, objectFit: 'cover', borderRadius: 1, border: '1px solid rgba(0,0,0,0.1)' }}
                              />
                            )}
                          </Box>
                        );
                      }
                      // Also default text, image, location to standard inputs
                      return (
                        <TextField
                          key={f.id}
                          label={`${f.identifier} (${f.type})`}
                          fullWidth
                          value={fieldsState[f.id] || ''}
                          onChange={(e) => setFieldsState({ ...fieldsState, [f.id]: e.target.value })}
                        />
                      );
                    })}
                  </Stack>
                </Grid>

                {/* Real-time Preview (Right) */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ borderLeft: (theme) => `1px solid ${theme.palette.divider}`, pl: { md: 3 }, height: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: '700', mb: 2 }}>
                      Live Preview (with given values)
                    </Typography>
                    <Box
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.neutral',
                        p: 1.5,
                        maxHeight: '70vh',
                        overflowY: 'auto',
                      }}
                    >
                      {(() => {
                        const SelectedComponent = selectedEventTemplate.template.view_page
                          ? getTemplateComponent(selectedEventTemplate.template.view_page)
                          : null;
                        const ComponentToRender = SelectedComponent || WeddingTemplate;
                        const previewFields = selectedEventTemplate.template.template_fields.map((tf) => ({
                          field_id: tf.field.id,
                          value: fieldsState[tf.field.id] || '',
                          field: {
                            id: tf.field.id,
                            identifier: tf.field.identifier,
                            type: tf.field.type,
                          },
                        }));
                        return (
                          <ComponentToRender
                            event={{
                              name: eventData.name,
                              description: eventData.description,
                              event_date: eventData.event_date,
                              start_date: eventData.start_date,
                            }}
                            fields={previewFields}
                          />
                        );
                      })()}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setEditFieldsOpen(false)} disabled={submitLoading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="inherit" disabled={submitLoading}>
                Save & Sync
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}

      {/* Fullscreen Event Page Preview Dialog */}
      {selectedEventTemplate && (
        <Dialog
          fullScreen
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'background.default',
            },
          }}
        >
          {/* Header Bar */}
          <Box
            sx={{
              px: 3,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => setPreviewOpen(false)}
                startIcon={<Iconify icon={"solar:arrow-left-bold" as any} />}
              >
                Back to Details
              </Button>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: '700' }}>
                  {eventData.name} - {selectedEventTemplate.template.name} Preview
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Previewing layout with actual event details and field values
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Main Preview Area */}
          <Box
            sx={{
              p: { xs: 2, md: 5 },
              minHeight: 'calc(100vh - 72px)',
              bgcolor: 'background.neutral',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Container maxWidth="md">
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: (theme: any) => theme.customShadows?.z24 || theme.shadows[24],
                  bgcolor: 'background.paper',
                }}
              >
                {(() => {
                  const SelectedComponent = selectedEventTemplate.template.view_page
                    ? getTemplateComponent(selectedEventTemplate.template.view_page)
                    : null;
                  const ComponentToRender = SelectedComponent || WeddingTemplate;
                  return (
                    <ComponentToRender
                      event={{
                        name: eventData.name,
                        description: eventData.description,
                        event_date: eventData.event_date,
                        start_date: eventData.start_date,
                      }}
                      fields={selectedEventTemplate.event_template_fields}
                    />
                  );
                })()}
              </Box>
            </Container>
          </Box>
        </Dialog>
      )}
    </DashboardContent>
  );
}
