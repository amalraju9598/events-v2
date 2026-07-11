import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { api } from 'src/utils/api-client';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { TemplateCard } from '../product-card';
import { UserTableToolbar } from '../../user/user-table-toolbar';

import type { TemplateProps } from '../product-table-row';

type SimpleEventType = {
  id: string;
  name: string;
  identifier: string;
};

type SimpleField = {
  id: string;
  identifier: string;
  type: string;
};

// ----------------------------------------------------------------------

export function ProductsView() {
  const [templates, setTemplates] = useState<TemplateProps[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Selectors list
  const [eventTypesList, setEventTypesList] = useState<SimpleEventType[]>([]);
  const [fieldsList, setFieldsList] = useState<SimpleField[]>([]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateProps | null>(null);
  const [formFields, setFormFields] = useState({
    event_type_id: '',
    name: '',
    slug: '',
    code: '',
    price: '',
    strikethrough_price: '',
    preview_image: '',
    status: 'draft' as 'draft' | 'active' | 'disabled',
    field_ids: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Fetch templates list
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageNum = page + 1;
      const response = await api.get(`/templates?page=${pageNum}&limit=${rowsPerPage}&search=${filterName}`);
      setTemplates(response.data || []);
      setTotalTemplates(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filterName]);

  // Fetch event types and fields list for selections
  const fetchSelectorsData = useCallback(async () => {
    try {
      const [etRes, fieldsRes] = await Promise.all([
        api.get('/event-types?limit=100'),
        api.get('/templates/fields'),
      ]);
      setEventTypesList(etRes.data || []);
      setFieldsList(fieldsRes || []);
    } catch (err: any) {
      console.error('Failed to load selectors data:', err);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (dialogOpen) {
      fetchSelectorsData();
    }
  }, [dialogOpen, fetchSelectorsData]);

  // Open create dialog
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormFields({
      event_type_id: '',
      name: '',
      slug: '',
      code: '',
      price: '',
      strikethrough_price: '',
      preview_image: '',
      status: 'draft',
      field_ids: [],
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (template: TemplateProps) => {
    setEditingTemplate(template);
    setFormFields({
      event_type_id: template.event_type_id,
      name: template.name,
      slug: template.slug,
      code: template.code,
      price: String(template.price),
      strikethrough_price: template.strikethrough_price ? String(template.strikethrough_price) : '',
      preview_image: template.preview_image || '',
      status: template.status,
      field_ids: template.template_fields?.map((tf) => tf.field.id) || [],
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Handle create/update submit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittingForm(true);

    try {
      const parsedPrice = parseFloat(formFields.price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw new Error('Price must be a valid positive number');
      }

      let parsedStrikethrough: number | null = null;
      if (formFields.strikethrough_price.trim()) {
        parsedStrikethrough = parseFloat(formFields.strikethrough_price);
        if (Number.isNaN(parsedStrikethrough) || parsedStrikethrough < 0) {
          throw new Error('Strikethrough price must be a valid positive number');
        }
      }

      const payload = {
        event_type_id: formFields.event_type_id,
        name: formFields.name,
        slug: formFields.slug,
        code: formFields.code,
        price: parsedPrice,
        strikethrough_price: parsedStrikethrough,
        preview_image: formFields.preview_image || null,
        status: formFields.status,
        field_ids: formFields.field_ids,
      };

      if (editingTemplate) {
        await api.patch(`/templates/${editingTemplate.id}`, payload);
      } else {
        await api.post('/templates', payload);
      }

      setDialogOpen(false);
      fetchTemplates();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the template.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle delete
  const handleDeleteRow = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await api.delete(`/templates/${id}`);
        fetchTemplates();
      } catch (err: any) {
        alert(err.message || 'Failed to delete template.');
      }
    }
  }, [fetchTemplates]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Templates
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          New Template
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <UserTableToolbar
          numSelected={0}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            setPage(0);
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {templates.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 1.5 }}>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                No templates found
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid key={template.id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <TemplateCard
                    template={template}
                    onEdit={() => handleOpenEdit(template)}
                    onDelete={() => handleDeleteRow(template.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          <TablePagination
            component="div"
            page={page}
            count={totalTemplates}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[12, 24, 48]}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ mt: 4 }}
          />
        </>
      )}

      {/* Template Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel id="event-type-label">Event Type</InputLabel>
                  <Select
                    labelId="event-type-label"
                    label="Event Type"
                    value={formFields.event_type_id}
                    onChange={(e) => setFormFields({ ...formFields, event_type_id: e.target.value })}
                  >
                    {eventTypesList.map((et) => (
                      <MenuItem key={et.id} value={et.id}>
                        {et.name} ({et.identifier})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    label="Status"
                    value={formFields.status}
                    onChange={(e) => setFormFields({ ...formFields, status: e.target.value as any })}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="disabled">Disabled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Name"
                  fullWidth
                  required
                  value={formFields.name}
                  onChange={(e) => {
                    const nameVal = e.target.value;
                    const slugVal = nameVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const codeVal = nameVal.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase();
                    setFormFields({
                      ...formFields,
                      name: nameVal,
                      slug: slugVal,
                      code: codeVal,
                    });
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Slug"
                  fullWidth
                  required
                  value={formFields.slug}
                  onChange={(e) => {
                    const slugVal = e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
                    setFormFields({
                      ...formFields,
                      slug: slugVal,
                    });
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Alpha Code"
                  fullWidth
                  required
                  value={formFields.code}
                  onChange={(e) => {
                    const codeVal = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                    setFormFields({
                      ...formFields,
                      code: codeVal,
                    });
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Price ($)"
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formFields.price}
                  onChange={(e) => setFormFields({ ...formFields, price: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Strikethrough Price ($) (Optional)"
                  fullWidth
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={formFields.strikethrough_price}
                  onChange={(e) => setFormFields({ ...formFields, strikethrough_price: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Preview Image URL (Optional)"
                  fullWidth
                  placeholder="https://example.com/image.jpg"
                  value={formFields.preview_image}
                  onChange={(e) => setFormFields({ ...formFields, preview_image: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel id="fields-label">Template Fields (Syncs automatically)</InputLabel>
                  <Select
                    labelId="fields-label"
                    label="Template Fields (Syncs automatically)"
                    multiple
                    value={formFields.field_ids}
                    onChange={(e) => setFormFields({ ...formFields, field_ids: e.target.value as string[] })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const f = fieldsList.find((field) => field.id === value);
                          return (
                            <Chip key={value} label={f ? f.identifier : value} size="small" />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {fieldsList.map((f) => (
                      <MenuItem key={f.id} value={f.id}>
                        <Checkbox checked={formFields.field_ids.includes(f.id)} />
                        <ListItemText primary={f.identifier} secondary={f.type} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
