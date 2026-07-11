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
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { api } from 'src/utils/api-client';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { TableNoData } from '../table-no-data';
import { UserTableRow } from '../user-table-row';
import { UserTableHead } from '../user-table-head';
import { TableEmptyRows } from '../table-empty-rows';
import { applyFilter, getComparator } from '../utils';
import { UserTableToolbar } from '../user-table-toolbar';

import type { UserProps } from '../user-table-row';

// ----------------------------------------------------------------------

export function UserView() {
  const router = useRouter();
  const table = useTable();

  const [users, setUsers] = useState<UserProps[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');

  // Form Modal Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProps | null>(null);
  const [formFields, setFormFields] = useState({
    name: '',
    email: '',
    mobile: '',
    username: '',
    password: '',
    user_type: 'user',
    profile_pic: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Fetch users list from paginated endpoint
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Material UI table page is 0-indexed, API is 1-indexed
      const page = table.page + 1;
      const limit = table.rowsPerPage;
      const response = await api.get(`/users?page=${page}&limit=${limit}&search=${filterName}`);
      setUsers(response.data || []);
      setTotalUsers(response.total || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [table.page, table.rowsPerPage, filterName]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open dialog for creation
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormFields({
      name: '',
      email: '',
      mobile: '',
      username: '',
      password: '',
      user_type: 'user',
      profile_pic: '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Open dialog for update
  const handleOpenEdit = (user: UserProps) => {
    setEditingUser(user);
    setFormFields({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      username: user.username || '',
      password: '', // Password is optional on update
      user_type: user.user_type,
      profile_pic: user.profile_pic || '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  // Handle form submit (create or update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmittingForm(true);

    try {
      const payload: any = {
        name: formFields.name,
        email: formFields.email,
        mobile: formFields.mobile || undefined,
        username: formFields.username || undefined,
        user_type: formFields.user_type,
        profile_pic: formFields.profile_pic || undefined,
      };

      if (editingUser) {
        if (formFields.password) {
          payload.password = formFields.password;
        }
        await api.patch(`/users/${editingUser.id}`, payload);
      } else {
        if (!formFields.password) {
          throw new Error('Password is required when creating a new user.');
        }
        payload.password = formFields.password;
        await api.post('/users', payload);
      }

      setDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving user data.');
    } finally {
      setSubmittingForm(false);
    }
  };

  // Handle delete user
  const handleDeleteRow = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  }, [fetchUsers]);

  // Client-side sorting for the current paginated page
  const dataFiltered: UserProps[] = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName: '', // Skip client-side filtering because server did it
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
          Users
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          New user
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
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    users.map((user) => user.id)
                  )
                }
                headLabel={[
                  { id: 'name', label: 'Name' },
                  { id: 'email', label: 'Email' },
                  { id: 'username', label: 'Username' },
                  { id: 'mobile', label: 'Mobile' },
                  { id: 'user_type', label: 'User Type' },
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
                    <UserTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onEditRow={() => handleOpenEdit(row)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                      onViewEvents={() => router.push(`/events?user_id=${row.id}`)}
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
          count={totalUsers}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {/* User Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'New User'}</DialogTitle>
        <form onSubmit={handleSubmitForm}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              label="Name"
              fullWidth
              required
              value={formFields.name}
              onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
            />

            <TextField
              label="Email"
              fullWidth
              required
              type="email"
              value={formFields.email}
              onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
            />

            <TextField
              label="Username"
              fullWidth
              value={formFields.username}
              onChange={(e) => setFormFields({ ...formFields, username: e.target.value })}
            />

            <TextField
              label="Mobile Number"
              fullWidth
              value={formFields.mobile}
              onChange={(e) => setFormFields({ ...formFields, mobile: e.target.value })}
            />

            <TextField
              label="Profile Picture URL"
              fullWidth
              value={formFields.profile_pic}
              onChange={(e) => setFormFields({ ...formFields, profile_pic: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
            />

            <TextField
              label="Password"
              fullWidth
              required={!editingUser}
              type="password"
              placeholder={editingUser ? 'Leave blank to keep current' : ''}
              value={formFields.password}
              onChange={(e) => setFormFields({ ...formFields, password: e.target.value })}
            />

            <FormControl fullWidth required>
              <InputLabel id="user-type-label">User Type</InputLabel>
              <Select
                labelId="user-type-label"
                label="User Type"
                value={formFields.user_type}
                onChange={(e) => setFormFields({ ...formFields, user_type: e.target.value })}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="client">Client</MenuItem>
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
