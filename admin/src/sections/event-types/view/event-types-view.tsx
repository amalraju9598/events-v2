import { useState, useCallback, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { api } from 'src/utils/api-client';

import { TableNoData } from '../../user/table-no-data';
import { TableEmptyRows } from '../../user/table-empty-rows';
import { UserTableHead } from '../../user/user-table-head';
import { UserTableToolbar } from '../../user/user-table-toolbar';

import { EventTypeTableRow } from '../event-type-table-row';

import type { EventTypeProps } from '../event-type-table-row';

type SimpleUser = {
  id: string;
  name: string;
  email: string;
};

// ----------------------------------------------------------------------

export function EventTypesView() {
  const table = useTable();

  const [eventTypes, setEventTypes] = useState<EventTypeProps[]>([]);
  const [totalEventTypes, setTotalEventTypes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');

  // Dropdown options
  const [usersList, setUsersList] = useState<SimpleUser[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEventType, setEditingEventType] = useState<EventTypeProps | null>(null);
  const [formFields, setFormFields] = useState({
    name: '',
    identifier: '',
    description: '',
    icon: 'solar:tag-bold',
    user_id: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Fetch event types list
  const fetchEventTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = table.page + 1;
      const limit = table.rowsPerPage;
      const response = await api.get(`/event-types?page=${page}&limit=${limit}&search=${filterName}`);
      setEventTypes(response.data || []);
      setTotalEventTypes(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching event types:', err);
      setError(err.message || 'Failed to fetch event types');
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filterName]);

  // Fetch users for selector
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users?limit=100');
      setUsersList(response.data || []);
    } catch (err: any) {
      console.error('Failed to load users for selector:', err);
    }
  }, []);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  useEffect(() => {
    if (dialogOpen) {
      fetchUsers();
    }
  }, [dialogOpen, fetchUsers]);

  // Open create dialog
  const handleOpenCreate = () => {
    setEditingEventType(null);
    setFormFields({
      name: '',
      identifier: '',
      description: '',
      icon: 'solar:tag-bold',
      user_id: '', // Empty means null/Global
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleOpenEdit = (eventType: EventTypeProps) => {
    setEditingEventType(eventType);
    setFormFields({
      name: eventType.name,
      identifier: eventType.identifier,
      description: eventType.description || '',
      icon: eventType.icon || 'solar:tag-bold',
      user_id: eventType.user_id || '',
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
      const payload: any = {
        name: formFields.name,
        identifier: formFields.identifier,
        description: formFields.description || null,
        icon: formFields.icon || null,
        user_id: formFields.user_id || null, // Convert empty string to null for global
      };

      if (editingEventType) {
        await api.patch(`/event-types/${editingEventType.id}`, payload);
      } else {
        await api.post('/event-types', payload);
      }

      setDialogOpen(false);
      fetchEventTypes();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the event type.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle delete
  const handleDeleteRow = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      try {
        await api.delete(`/event-types/${id}`);
        fetchEventTypes();
      } catch (err: any) {
        alert(err.message || 'Failed to delete event type.');
      }
    }
  }, [fetchEventTypes]);

  // Sorting client-side on current paginated data page
  const dataFiltered = [...eventTypes].sort((a, b) => {
    const isDesc = table.order === 'desc';
    const key = table.orderBy as keyof EventTypeProps;

    const valA = a[key];
    const valB = b[key];

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    // Handle nested user object sort if sorting by owner user name
    if (key === 'user') {
      const nameA = a.user?.name || '';
      const nameB = b.user?.name || '';
      return isDesc ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    }

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
          Event Types
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          New Event Type
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
                rowCount={eventTypes.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    eventTypes.map((et) => et.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Name / Identifier' },
                  { id: 'description', label: 'Description' },
                  { id: 'icon', label: 'Icon' },
                  { id: 'user', label: 'Owner' },
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
                    <EventTypeTableRow
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
          count={totalEventTypes}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* Event Type Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEventType ? 'Edit Event Type' : 'New Event Type'}</DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Name"
              fullWidth
              required
              value={formFields.name}
              onChange={(e) => {
                const nameVal = e.target.value;
                const identifierVal = nameVal.toLowerCase().replace(/[^a-z0-9]/g, '_');
                setFormFields({
                  ...formFields,
                  name: nameVal,
                  identifier: identifierVal,
                });
              }}
            />

            <TextField
              label="Identifier"
              fullWidth
              required
              placeholder="e.g. meeting_type_1"
              value={formFields.identifier}
              onChange={(e) => {
                const sanitizedVal = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                setFormFields({
                  ...formFields,
                  identifier: sanitizedVal,
                });
              }}
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
              label="Icon (Solar iconify class)"
              fullWidth
              value={formFields.icon}
              onChange={(e) => setFormFields({ ...formFields, icon: e.target.value })}
              placeholder="e.g. solar:calendar-bold"
              helperText="You can use any iconify icon path (e.g. solar:tag-bold, solar:calendar-bold)"
            />

            <FormControl fullWidth>
              <InputLabel id="owner-user-label">Owner User (Optional)</InputLabel>
              <Select
                labelId="owner-user-label"
                label="Owner User (Optional)"
                value={formFields.user_id}
                onChange={(e) => setFormFields({ ...formFields, user_id: e.target.value })}
              >
                <MenuItem value="">
                  <em>Global (No User)</em>
                </MenuItem>
                {usersList.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
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

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}
