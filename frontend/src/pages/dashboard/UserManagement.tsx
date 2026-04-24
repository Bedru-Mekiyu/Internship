import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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
  InputAdornment,
} from '@mui/material';
import {
  EditOutlined,
  VisibilityOutlined,
  DeleteOutlineOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { api, normalizeApiError } from '../../services/api';
import DashboardPageFrame, { DashboardSection } from '../../components/common/DashboardPageFrame';
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

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

type CreateFormErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'password', string>>;
type EditFormErrors = Partial<Record<'firstName' | 'lastName' | 'email', string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function statusStyles(status: UserStatus) {
  switch (status) {
    case 'Active':
      return { dot: '#10B981', color: 'success.main' };
    case 'Blocked':
      return { dot: '#EF4444', color: '#EF4444' };
    default:
      return { dot: '#64748B', color: 'text.secondary' };
  }
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All Roles');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All Status');
  const [page, setPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [viewingUser, setViewingUser] = useState<UserRow | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createFormErrors, setCreateFormErrors] = useState<CreateFormErrors>({});
  const [editFormErrors, setEditFormErrors] = useState<EditFormErrors>({});
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
      const response = await api.delete<{ message?: string }>(`/api/users/${userId}`);
      return response.data;
    },
    onSuccess: (responseData) => {
      setStatusMessage({
        type: 'success',
        text: responseData?.message || 'User deactivated successfully.',
      });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (requestError) => {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || 'Failed to deactivate user.',
      });
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
      setStatusMessage({ type: 'success', text: 'User created successfully.' });
      setCreatingUser(false);
      setCreateFormErrors({});
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
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || 'Failed to create user.',
      });
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
      const response = await api.patch(`/api/users/${userId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      setStatusMessage({ type: 'success', text: 'User updated successfully.' });
      setEditingUser(null);
      setEditFormErrors({});
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (requestError) => {
      setStatusMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || 'Failed to update user.',
      });
    },
  });

  const users = useMemo<UserRow[]>(() => {
    const rows = data ?? [];

    return rows.map((user) => {
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

  const goToPage = (value: number) => {
    setPage(Math.max(1, Math.min(value, totalPages)));
  };

  const handleDeactivate = (userId: string) => {
    void deactivateUserMutation.mutateAsync(userId);
  };

  const openEditDialog = (user: UserRow) => {
    setStatusMessage(null);
    setEditFormErrors({});
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
    const nextErrors: CreateFormErrors = {};
    const trimmedFirstName = createForm.firstName.trim();
    const trimmedLastName = createForm.lastName.trim();
    const trimmedEmail = createForm.email.trim().toLowerCase();

    if (!trimmedFirstName) {
      nextErrors.firstName = 'First name is required.';
    }
    if (!trimmedLastName) {
      nextErrors.lastName = 'Last name is required.';
    }
    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!createForm.password) {
      nextErrors.password = 'Password is required.';
    } else if (createForm.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setCreateFormErrors(nextErrors);
      setStatusMessage({ type: 'error', text: 'Fix the highlighted fields before creating a user.' });
      return;
    }

    setCreateFormErrors({});
    void createUserMutation.mutateAsync({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      password: createForm.password,
      role: createForm.role,
      isActive: createForm.isActive,
    });
  };

  const saveUserChanges = () => {
    if (!editingUser) {
      return;
    }

    const nextErrors: EditFormErrors = {};
    const trimmedFirstName = editForm.firstName.trim();
    const trimmedLastName = editForm.lastName.trim();
    const trimmedEmail = editForm.email.trim().toLowerCase();

    if (!trimmedFirstName) {
      nextErrors.firstName = 'First name is required.';
    }
    if (!trimmedLastName) {
      nextErrors.lastName = 'Last name is required.';
    }
    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setEditFormErrors(nextErrors);
      setStatusMessage({ type: 'error', text: 'Fix the highlighted fields before saving changes.' });
      return;
    }

    setEditFormErrors({});
    void updateUserMutation.mutateAsync({
      userId: editingUser.id,
      payload: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        role: editForm.role,
        isActive: editForm.isActive,
      },
    });
  };

  const firstVisibleItem = totalUsers === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
  const lastVisibleItem = Math.min(currentPage * usersPerPage, totalUsers);

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <DashboardPageFrame
        title="Users"
        description="Manage learner, instructor, and admin accounts with standardized role and status controls."
        actions={(
          <Button
            variant="contained"
            sx={{ py: 1.25 }}
            onClick={() => {
              setStatusMessage(null);
              setCreateFormErrors({});
              setCreatingUser(true);
            }}
          >
            Add User
          </Button>
        )}
      >
        {statusMessage ? (
          <Alert
            severity={statusMessage.type}
            sx={{ mb: 2.25, borderRadius: 1.5 }}
            onClose={() => setStatusMessage(null)}
          >
            {statusMessage.text}
          </Alert>
        ) : null}

        {isError ? (
          <Alert severity="error" sx={{ mb: 2.25, borderRadius: 1.5 }}>
            {normalizeApiError(error).message || 'Could not load users'}
          </Alert>
        ) : null}

        <DashboardSection>
          <Stack spacing={2}>
              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email..."
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchOutlined fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <Grid container spacing={1.25}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)} fullWidth>
                        {['All Roles', 'Instructor', 'Student', 'Admin', 'Content Manager'].map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
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
              </Grid>
          </Stack>
        </DashboardSection>

        <DashboardSection cardContentSx={{ p: 0 }}>
            <Box sx={{ px: { xs: 2, md: 2.5 }, pt: { xs: 2, md: 2.5 }, pb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                User Directory
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Role-based account list with quick actions.
              </Typography>
            </Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: { xs: 760, md: 920 } }}>
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { borderBottom: '1px solid', borderColor: 'divider', color: 'text.secondary', fontWeight: 800, py: { xs: 1.25, md: 1.75 }, fontSize: { xs: '0.75rem', md: '0.875rem' } } }}>
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
                      <TableCell colSpan={6}>
                        <Typography sx={{ color: 'text.secondary', py: 1.5 }}>Loading users...</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {displayedUsers.map((user) => {
                    const statusStyle = statusStyles(user.status);

                    return (
                      <TableRow
                        key={user.id}
                        hover
                        sx={{
                          '& .MuiTableCell-root': { py: 1.8, borderBottom: '1px solid', borderColor: 'divider' },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' }, wordBreak: 'break-word' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                            {user.role}
                          </Typography>
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
        </DashboardSection>

        <Drawer
          anchor="right"
          open={Boolean(viewingUser)}
          onClose={() => setViewingUser(null)}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: 420 },
              p: 2.5,
              borderLeft: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          {viewingUser ? (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                User Profile
              </Typography>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {viewingUser.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {viewingUser.email}
                </Typography>
              </Box>
              <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  value={editForm.firstName}
                  onChange={(event) => {
                    setEditForm((current) => ({ ...current, firstName: event.target.value }));
                    setEditFormErrors((current) => ({ ...current, firstName: undefined }));
                  }}
                  error={Boolean(editFormErrors.firstName)}
                  helperText={editFormErrors.firstName}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  value={editForm.lastName}
                  onChange={(event) => {
                    setEditForm((current) => ({ ...current, lastName: event.target.value }));
                    setEditFormErrors((current) => ({ ...current, lastName: undefined }));
                  }}
                  error={Boolean(editFormErrors.lastName)}
                  helperText={editFormErrors.lastName}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(event) => {
                    setEditForm((current) => ({ ...current, email: event.target.value }));
                    setEditFormErrors((current) => ({ ...current, email: undefined }));
                  }}
                  error={Boolean(editFormErrors.email)}
                  helperText={editFormErrors.email}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
            <Button
              onClick={() => {
                setEditingUser(null);
                setEditFormErrors({});
              }}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={saveUserChanges} variant="contained" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={creatingUser}
          onClose={() => {
            setCreatingUser(false);
            setCreateFormErrors({});
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent sx={{ pt: '12px !important' }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="First Name"
                  value={createForm.firstName}
                  onChange={(event) => {
                    setCreateForm((current) => ({ ...current, firstName: event.target.value }));
                    setCreateFormErrors((current) => ({ ...current, firstName: undefined }));
                  }}
                  error={Boolean(createFormErrors.firstName)}
                  helperText={createFormErrors.firstName}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name"
                  value={createForm.lastName}
                  onChange={(event) => {
                    setCreateForm((current) => ({ ...current, lastName: event.target.value }));
                    setCreateFormErrors((current) => ({ ...current, lastName: undefined }));
                  }}
                  error={Boolean(createFormErrors.lastName)}
                  helperText={createFormErrors.lastName}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={(event) => {
                    setCreateForm((current) => ({ ...current, email: event.target.value }));
                    setCreateFormErrors((current) => ({ ...current, email: undefined }));
                  }}
                  error={Boolean(createFormErrors.email)}
                  helperText={createFormErrors.email}
                  fullWidth
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(event) => {
                    setCreateForm((current) => ({ ...current, password: event.target.value }));
                    setCreateFormErrors((current) => ({ ...current, password: undefined }));
                  }}
                  error={Boolean(createFormErrors.password)}
                  helperText={createFormErrors.password || 'Minimum 8 characters'}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
            <Button
              onClick={() => {
                setCreatingUser(false);
                setCreateFormErrors({});
              }}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateUser} variant="contained" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardPageFrame>
    </Box>
  );
}
