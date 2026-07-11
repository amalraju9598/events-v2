import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { api } from 'src/utils/api-client';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { FieldTableRow } from '../field-table-row';
import { TableNoData } from '../../user/table-no-data';
import { UserTableHead } from '../../user/user-table-head';
import { TableEmptyRows } from '../../user/table-empty-rows';
import { UserTableToolbar } from '../../user/user-table-toolbar';
import { useTable } from '../../event-types/view/event-types-view';

import type { FieldProps } from '../field-table-row';

// ----------------------------------------------------------------------

export function FieldsView() {
  const table = useTable();

  const [fields, setFields] = useState<FieldProps[]>([]);
  const [totalFields, setTotalFields] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<FieldProps | null>(null);
  const [formFields, setFormFields] = useState({
    identifier: '',
    type: 'text' as 'text' | 'image' | 'date' | 'long_text' | 'location',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Fetch fields list
  const fetchFields = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = table.page + 1;
      const limit = table.rowsPerPage;
      const response = await api.get(`/fields?page=${page}&limit=${limit}&search=${filterName}`);
      setFields(response.data || []);
      setTotalFields(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching fields:', err);
      setError(err.message || 'Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filterName]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  // Open create dialog
  const handleOpenCreate = () => {
    setEditingField(null);
    setFormFields({
      identifier: '',
      type: 'text',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (field: FieldProps) => {
    setEditingField(field);
    setFormFields({
      identifier: field.identifier,
      type: field.type,
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
      const payload = {
        identifier: formFields.identifier,
        type: formFields.type,
      };

      if (editingField) {
        await api.patch(`/fields/${editingField.id}`, payload);
      } else {
        await api.post('/fields', payload);
      }

      setDialogOpen(false);
      fetchFields();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the field.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle delete
  const handleDeleteRow = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        await api.delete(`/fields/${id}`);
        fetchFields();
      } catch (err: any) {
        alert(err.message || 'Failed to delete field.');
      }
    }
  }, [fetchFields]);

  const dataFiltered = [...fields].sort((a, b) => {
    const isDesc = table.order === 'desc';
    const key = table.orderBy as keyof FieldProps;

    const valA = a[key];
    const valB = b[key];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }

    return isDesc 
      ? (valA < valB ? 1 : -1)
      : (valA < valB ? -1 : 1);
  });

  const notFound = !dataFiltered.length && !!filterName;

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
          Template Fields
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          New Field
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={fields.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    fields.map((f) => f.id)
                  )
                }
                headLabel={[
                  { id: 'identifier', label: 'Field Identifier' },
                  { id: 'type', label: 'Type' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {loading ? (
                  <TableEmptyRows
                    height={68}
                    emptyRows={5}
                    children={
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                      </Box>
                    }
                  />
                ) : (
                  dataFiltered.map((row) => (
                    <FieldTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onEditRow={() => handleOpenEdit(row)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))
                )}

                {!loading && dataFiltered.length < table.rowsPerPage && (
                  <TableEmptyRows
                    height={68}
                    emptyRows={table.rowsPerPage - dataFiltered.length}
                  />
                )}

                {notFound && !loading && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          page={table.page}
          count={totalFields}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* Field Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingField ? 'Edit Field' : 'New Field'}</DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Field Identifier"
              fullWidth
              required
              value={formFields.identifier}
              onChange={(e) => {
                const sanitizedVal = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setFormFields({
                  ...formFields,
                  identifier: sanitizedVal,
                });
              }}
              placeholder="e.g. guest_email"
              helperText="Only lowercase letters, numbers, and underscores are allowed."
            />

            <FormControl fullWidth required>
              <InputLabel id="field-type-label">Field Type</InputLabel>
              <Select
                labelId="field-type-label"
                label="Field Type"
                value={formFields.type}
                onChange={(e) => setFormFields({ ...formFields, type: e.target.value as any })}
              >
                <MenuItem value="text">Text (Short input)</MenuItem>
                <MenuItem value="image">Image (Upload/URL)</MenuItem>
                <MenuItem value="date">Date picker</MenuItem>
                <MenuItem value="long_text">Long text (Textarea)</MenuItem>
                <MenuItem value="location">Location picker</MenuItem>
              </Select>
            </FormControl>
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
