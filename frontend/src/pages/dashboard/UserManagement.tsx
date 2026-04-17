import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  EditOutlined,
  VisibilityOutlined,
  DeleteOutlineOutlined,
  AddOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api, normalizeApiError } from '../../services/api';
import { theme } from '../../theme';
type RoleFilter = 'All Roles' | 'Instructor' | 'Student' | 'Admin' | 'Content Manager';
type StatusFilter = 'All Status' | 'Active' | 'Inactive' | 'Blocked';
type UserRole = 'Instructor' | 'Student' | 'Admin' | 'Content Manager';
type UserStatus = 'Active' | 'Inactive' | 'Blocked';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rawRole: ApiUser['role'];
  status: UserStatus;
  isActive: boolean;
  lastLogin: string;
  joinedDate: string;
  avatar: string;
  color: string;
  firstName: string;
  lastName: string;
}

interface ApiUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: 'student' | 'instructor' | 'admin' | 'content_manager';
  isActive?: boolean;
  createdAt?: string;
}

function roleStyles(role: UserRole) {
  switch (role) {
    case 'Content Manager':
      return { bgcolor: alpha('#0EA5E9', 0.12), color: '#0369A1' };
    case 'Instructor':
      return { bgcolor: alpha('#A855F7', 0.12), color: '#7C3AED' };
    case 'Admin':
      return { bgcolor: alpha('#0066FF', 0.12), color: '#0066FF' };
    default:
      return { bgcolor: alpha('#64748B', 0.12), color: '#64748B' };
  }
}

function statusStyles(status: UserStatus) {
  switch (status) {
    case 'Active':
      return { dot: '#10B981', color: 'success.main', bg: alpha('#10B981', 0.12) };
    case 'Blocked':
      return { dot: '#EF4444', color: '#EF4444', bg: alpha('#EF4444', 0.12) };
    default:
      return { dot: '#64748B', color: 'text.secondary', bg: alpha('#64748B', 0.12) };
  }
}

export default function UserManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All Roles');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All Status');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student' as ApiUser['role'],
    isActive: true,
  });
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student' as ApiUser['role'],
    isActive: true,
  });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users', search, roleFilter, statusFilter],
    queryFn: async () => {
      const role = roleFilter === 'All Roles' ? undefined : roleFilter.toLowerCase();
      const normalizedRole = role === 'content manager' ? 'content_manager' : role;
      const status =
        statusFilter === 'All Status' || statusFilter === 'Blocked'
          ? undefined
          : statusFilter.toLowerCase();

      const response = await api.get<ApiUser[]>('/api/users', {
        params: {
          q: search.trim() || undefined,
          role: normalizedRole,
          status,
        },
      });

      return response.data;
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/api/users/${userId}`);
    },
    onSuccess: () => {
      setStatusMessage('User deactivated successfully.');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setSelected([]);
    },
    onError: (requestError) => {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to deactivate user.');
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: ApiUser['role'];
      isActive: boolean;
    }) => {
      const response = await api.post('/api/users', payload);
      return response.data;
    },
    onSuccess: () => {
      setStatusMessage('User created successfully.');
      setCreatingUser(false);
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'student',
        isActive: true,
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (requestError) => {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to create user.');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      payload,
    }: {
      userId: string;
      payload: {
        firstName: string;
        lastName: string;
        email: string;
        role: ApiUser['role'];
        isActive: boolean;
      };
    }) => {
      await api.patch(`/api/users/${userId}`, payload);
    },
    onSuccess: () => {
      setStatusMessage('User updated successfully.');
      setEditingUser(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (requestError) => {
      setStatusMessage(normalizeApiError(requestError).message || 'Failed to update user.');
    },
  });

  const users = useMemo<UserRow[]>(() => {
    const rows = data ?? [];

    return rows.map((user, index) => {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
      const role =
        user.role === 'instructor'
          ? 'Instructor'
          : user.role === 'content_manager'
            ? 'Content Manager'
          : user.role === 'admin'
            ? 'Admin'
            : 'Student';
      const firstName = user.firstName?.trim() || '';
      const lastName = user.lastName?.trim() || '';
      const isActive = user.isActive !== false;

      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('') || 'U';

      return {
        id: user._id,
        name: fullName,
        email: user.email,
        role,
        rawRole: user.role,
        status: isActive ? 'Active' : 'Inactive',
        isActive,
        lastLogin: 'N/A',
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })
          : 'N/A',
        avatar: initials,
        color: ['#0EA5E9', '#6366F1', '#10B981', '#F59E0B', '#0066FF'][index % 5],
        firstName,
        lastName,
      };
    });
  }, [data]);

  const filteredUsers = useMemo(() => {
    if (statusFilter !== 'Blocked') {
      return users;
    }

    return users.filter((user) => user.status === 'Inactive');
  }, [statusFilter, users]);

  const totalUsers = filteredUsers.length;
  const usersPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(totalUsers / usersPerPage));
  const currentPage = Math.min(page, totalPages);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const toggleSelection = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const goToPage = (value: number) => {
    setPage(Math.max(1, Math.min(value, totalPages)));
  };

  const handleDeactivate = (userId: string) => {
    void deactivateUserMutation.mutateAsync(userId);
  };

  const openEditDialog = (user: UserRow) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.rawRole,
      isActive: user.isActive,
    });
  };

  const handleCreateUser = () => {
    if (!createForm.firstName.trim() || !createForm.lastName.trim() || !createForm.email.trim() || !createForm.password) {
      setStatusMessage('All fields are required.');
      return;
    }

    if (createForm.password.length < 8) {
      setStatusMessage('Password must be at least 8 characters.');
      return;
    }

    void createUserMutation.mutateAsync({
      firstName: createForm.firstName.trim(),
      lastName: createForm.lastName.trim(),
      email: createForm.email.trim(),
      password: createForm.password,
      role: createForm.role,
      isActive: createForm.isActive,
    });
  };

  const saveUserChanges = () => {
    if (!editingUser) {
      return;
    }

    void updateUserMutation.mutateAsync({
      userId: editingUser.id,
      payload: {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        isActive: editForm.isActive,
      },
    });
  };

  const firstVisibleItem = totalUsers === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
  const lastVisibleItem = Math.min(currentPage * usersPerPage, totalUsers);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
          User management
        </Typography>

        {statusMessage ? (
          <Alert
            severity={statusMessage.toLowerCase().includes('failed') ? 'error' : 'success'}
            sx={{ mb: 2.25, borderRadius: '12px' }}
            onClose={() => setStatusMessage(null)}
          >
            {statusMessage}
          </Alert>
        ) : null}

        {isError ? (
          <Alert severity="error" sx={{ mb: 2.25, borderRadius: '12px' }}>
            {normalizeApiError(error).message || 'Could not load users'}
          </Alert>
        ) : null}

        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                User Management
              </Typography>

              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box sx={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', pointerEvents: 'none' }}>
                      <SearchOutlined fontSize="small" />
                    </Box>
                    <TextField
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search by name or email..."
                      sx={{
                        '& .MuiInputBase-root': {
                          pl: 5.25,
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Grid container spacing={1.25}>
                    <Grid size={6}>
                      <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)} fullWidth>
                        {['All Roles', 'Instructor', 'Student', 'Admin', 'Content Manager'].map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid size={6}>
                      <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} fullWidth>
                        {['All Status', 'Active', 'Inactive', 'Blocked'].map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddOutlined />}
                    fullWidth
                    sx={{ py: 1.5 }}
                    onClick={() => setCreatingUser(true)}
                  >
                    Add User
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 920 }}>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid #E2E8F0', color: 'text.secondary', fontWeight: 800, py: 1.75 } }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.length > 0 && selected.length === displayedUsers.length}
                        indeterminate={selected.length > 0 && selected.length < displayedUsers.length}
                        onChange={() => setSelected(selected.length ? [] : displayedUsers.map((user) => user.id))}
                      />
                    </TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Joined Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <Typography sx={{ color: 'text.secondary', py: 1.5 }}>Loading users...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {displayedUsers.map((user) => {
                    const roleStyle = roleStyles(user.role);
                    const statusStyle = statusStyles(user.status);

                    return (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          '& .MuiTableCell-root': { py: 1.8, borderBottom: '1px solid #E2E8F0' },
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={selected.includes(user.id)} onChange={() => toggleSelection(user.id)} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 42, height: 42, bgcolor: user.color, fontWeight: 700 }}>{user.avatar}</Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                                {user.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              px: 1.2,
                              py: 0.6,
                              borderRadius: '999px',
                              bgcolor: roleStyle.bgcolor,
                              color: roleStyle.color,
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {user.role}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '999px', bgcolor: statusStyle.dot }} />
                            <Typography variant="body2" sx={{ color: statusStyle.color, fontWeight: 700 }}>
                              {user.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {user.lastLogin}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            {user.joinedDate}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                            <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => openEditDialog(user)}>
                              <EditOutlined fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => setViewingUser(user)}>
                              <VisibilityOutlined fontSize="small" />
                            </IconButton>
                            <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => handleDeactivate(user.id)} disabled={deactivateUserMutation.isPending}>
                              <DeleteOutlineOutlined fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, px: { xs: 2, md: 3 }, py: 2, flexWrap: 'wrap' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Showing {firstVisibleItem} to {lastVisibleItem} of {totalUsers} users
              </Typography>
              <Pagination count={totalPages} page={currentPage} onChange={(_, value) => goToPage(value)} color="primary" shape="rounded" />
            </Box>
          </CardContent>
        </Card>

        <Drawer
          anchor="right"
          open={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: 420 },
              p: 2.5,
            },
          }}
        >
          {viewingUser ? (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                User Profile
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 48, height: 48, bgcolor: viewingUser.color, fontWeight: 700 }}>{viewingUser.avatar}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {viewingUser.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {viewingUser.email}
                  </Typography>
                </Box>
              </Box>
              <Card sx={{ boxShadow: 'none', border: '1px solid #E2E8F0' }}>
                <CardContent>
                  <Stack spacing={1.25}>
                    <Typography variant="body2"><strong>Role:</strong> {viewingUser.role}</Typography>
                    <Typography variant="body2"><strong>Status:</strong> {viewingUser.status}</Typography>
                    <Typography variant="body2"><strong>Joined:</strong> {viewingUser.joinedDate}</Typography>
                    <Typography variant="body2"><strong>Last Login:</strong> {viewingUser.lastLogin}</Typography>
                  </Stack>
                </CardContent>
              </Card>
              <Button variant="outlined" onClick={() => setViewingUser(null)}>
                Close
              </Button>
            </Stack>
          ) : null}
        </Drawer>

        <Dialog open={Boolean(editingUser)} onClose={() => setEditingUser(null)} fullWidth maxWidth="sm">
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent sx={{ pt: '12px !important' }}>
            <Grid container spacing={1.5}>
              <Grid size={6}>
                <TextField
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((current) => ({ ...current, firstName: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((current) => ({ ...current, lastName: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="edit-user-role-label">Role</InputLabel>
                  <Select
                    labelId="edit-user-role-label"
                    label="Role"
                    value={editForm.role}
                    onChange={(event) => setEditForm((current) => ({ ...current, role: event.target.value as ApiUser['role'] }))}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="content_manager">Content Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="edit-user-status-label">Status</InputLabel>
                  <Select
                    labelId="edit-user-status-label"
                    label="Status"
                    value={editForm.isActive ? 'active' : 'inactive'}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, isActive: event.target.value === 'active' }))
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setEditingUser(null)} disabled={updateUserMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={saveUserChanges} variant="contained" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={creatingUser} onClose={() => setCreatingUser(false)} fullWidth maxWidth="sm">
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent sx={{ pt: '12px !important' }}>
            <Grid container spacing={1.5}>
              <Grid size={6}>
                <TextField
                  label="First Name"
                  value={createForm.firstName}
                  onChange={(event) => setCreateForm((current) => ({ ...current, firstName: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Last Name"
                  value={createForm.lastName}
                  onChange={(event) => setCreateForm((current) => ({ ...current, lastName: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                  fullWidth
                  helperText="Minimum 8 characters"
                />
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="create-user-role-label">Role</InputLabel>
                  <Select
                    labelId="create-user-role-label"
                    label="Role"
                    value={createForm.role}
                    onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value as ApiUser['role'] }))}
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="content_manager">Content Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel id="create-user-status-label">Status</InputLabel>
                  <Select
                    labelId="create-user-status-label"
                    label="Status"
                    value={createForm.isActive ? 'active' : 'inactive'}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, isActive: event.target.value === 'active' }))
                    }
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setCreatingUser(false)} disabled={createUserMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} variant="contained" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
}
