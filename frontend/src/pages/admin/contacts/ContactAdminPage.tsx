import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from '@mui/material';
import {
  CheckCircleOutlineOutlined,
  FlagOutlined,
  HourglassEmptyOutlined,
  PersonAddOutlined,
  RefreshOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import {
  useAssignContactMessageMutation,
  useGetContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
} from '../../../store/api/contactApi';
import DashboardPageFrame from '../../../components/common/DashboardPageFrame';
import { card, formFieldSpacing, sectionHeader, SPACING } from '../../../theme/tokens';
import type { ContactMessage } from '../../../types';

// ─── Status Helpers ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ContactMessage['status'], { label: string; icon: React.ReactElement; color: 'error' | 'warning' | 'success' }> = {
  new: { label: 'New', icon: <FlagOutlined fontSize="small" />, color: 'error' },
  in_progress: { label: 'In Progress', icon: <HourglassEmptyOutlined fontSize="small" />, color: 'warning' },
  resolved: { label: 'Resolved', icon: <CheckCircleOutlineOutlined fontSize="small" />, color: 'success' },
};

function StatusChip({ status }: { status: ContactMessage['status'] }) {
  const cfg = STATUS_CONFIG[status];
  return <Chip icon={cfg.icon} label={cfg.label} color={cfg.color} size="small" variant="outlined" />;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ─── Message Detail Dialog ───────────────────────────────────────────────────

function MessageDetailDialog({
  message,
  open,
  onClose,
}: {
  message: ContactMessage | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!message) return null;

  const assignedName =
    typeof message.assignedTo === 'object' && message.assignedTo
      ? `${message.assignedTo.firstName} ${message.assignedTo.lastName}`
      : 'Unassigned';

  const reviewedName =
    typeof message.reviewedBy === 'object' && message.reviewedBy
      ? `${message.reviewedBy.firstName} ${message.reviewedBy.lastName}`
      : undefined;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Contact Message</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={formFieldSpacing}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              FROM
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {message.fullName}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {message.email}
            </Typography>
            {message.phone ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {message.phone}
              </Typography>
            ) : null}
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              STATUS
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <StatusChip status={message.status} />
            </Box>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              MESSAGE
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.5, whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}
            >
              {message.message}
            </Typography>
          </Box>

          {message.reviewNotes ? (
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                REVIEW NOTES
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                {message.reviewNotes}
              </Typography>
            </Box>
          ) : null}

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                ASSIGNED TO
              </Typography>
              <Typography variant="body2">{assignedName}</Typography>
            </Box>
            {reviewedName ? (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  REVIEWED BY
                </Typography>
                <Typography variant="body2">{reviewedName}</Typography>
              </Box>
            ) : null}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                SUBMITTED
              </Typography>
              <Typography variant="body2">{formatDate(message.createdAt)}</Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ContactAdminPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<ContactMessage | null>(null);
  const [newStatus, setNewStatus] = useState<ContactMessage['status']>('resolved');
  const [reviewNotes, setReviewNotes] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetching, error } = useGetContactMessagesQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
    q: debouncedSearch || undefined,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateContactMessageStatusMutation();
  const [assignToMe, { isLoading: isAssigning }] = useAssignContactMessageMutation();

  // Debounce search input
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setPage(1);
      }, 400);
    },
    [],
  );

  const openDetail = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDialogOpen(true);
  };

  const openStatusDialog = (msg: ContactMessage) => {
    setStatusTarget(msg);
    setNewStatus(msg.status === 'new' ? 'in_progress' : 'resolved');
    setReviewNotes(msg.reviewNotes || '');
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusTarget) return;
    try {
      await updateStatus({
        contactMessageId: statusTarget._id,
        status: newStatus,
        reviewNotes: reviewNotes || undefined,
      }).unwrap();
      setStatusDialogOpen(false);
      setStatusTarget(null);
    } catch {
      // error handled by RTK
    }
  };

  const handleAssignToMe = async (msg: ContactMessage) => {
    try {
      await assignToMe({ contactMessageId: msg._id }).unwrap();
    } catch {
      // error handled by RTK
    }
  };

  const messages: ContactMessage[] = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <DashboardPageFrame
      title="Contact Messages"
      description="Manage incoming contact requests from users and visitors."
      breadcrumbs={[
        { label: 'Admin', to: '/admin' },
        { label: 'Contact Messages' },
      ]}
    >
      {/* Error Banner */}
      {error ? (
        <Alert severity="error" sx={{ mb: SPACING.lg }}>
          Failed to load contact messages. Please try again.
        </Alert>
      ) : null}

      {/* Search & Filters */}
      <Card sx={card}>
        <CardContent sx={{ p: SPACING.cardPadding }}>
          <Box sx={sectionHeader}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by name, email, or message..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: <SearchOutlined sx={{ mr: 0.5, color: 'text.secondary', fontSize: 20 }} />,
                  },
                }}
                sx={{ minWidth: 280 }}
              />
              <Select
                size="small"
                value={statusFilter}
                onChange={(e: SelectChangeEvent) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                displayEmpty
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </Stack>
            <IconButton onClick={() => setPage(1)} size="small" disabled={!isFetching && !isLoading}>
              <RefreshOutlined />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : messages.length === 0 ? (
        <Card sx={card}>
          <CardContent sx={{ p: SPACING.cardPadding, textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              No contact messages found{statusFilter ? ` with status "${STATUS_CONFIG[statusFilter as ContactMessage['status']]?.label ?? statusFilter}"` : ''}.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Message List */}
          <Stack spacing={1.5}>
            {messages.map((msg: ContactMessage) => (
              <Card
                key={msg._id}
                sx={{
                  ...card,
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  '&:hover': { borderColor: 'primary.light', boxShadow: '0 4px 20px rgba(93,95,239,0.1)' },
                  ...(msg.status === 'new' ? { borderLeft: '4px solid', borderLeftColor: 'error.main' } : {}),
                }}
                onClick={() => openDetail(msg)}
              >
                <CardContent sx={{ p: SPACING.cardPaddingTight }}>
                  <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {msg.fullName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {msg.email}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {msg.message}
                      </Typography>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 0.75 }}>
                        <StatusChip status={msg.status} />
                        <Typography variant="caption" sx={{ color: 'text.muted' }}>
                          {formatDate(msg.createdAt)}
                        </Typography>
                        {typeof msg.assignedTo === 'object' && msg.assignedTo ? (
                          <Typography variant="caption" sx={{ color: 'text.muted' }}>
                            Assigned: {msg.assignedTo.firstName} {msg.assignedTo.lastName}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>

                    {/* Actions */}
                    <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                      {msg.status !== 'resolved' ? (
                        <>
                          {!msg.assignedTo ? (
                            <Tooltip title="Assign to me">
                              <IconButton
                                size="small"
                                onClick={() => handleAssignToMe(msg)}
                                disabled={isAssigning}
                              >
                                <PersonAddOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                          <Tooltip title="Update status">
                            <IconButton size="small" onClick={() => openStatusDialog(msg)}>
                              <CheckCircleOutlineOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : null}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5, mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </Typography>
              <Button
                variant="outlined"
                size="small"
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Box>
          ) : null}
        </>
      )}

      {/* Detail Dialog */}
      <MessageDetailDialog message={selectedMessage} open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Message Status</DialogTitle>
        <DialogContent>
          <Stack spacing={formFieldSpacing} sx={{ mt: 0.5 }}>
            <Select
              value={newStatus}
              onChange={(e: SelectChangeEvent) => setNewStatus(e.target.value as ContactMessage['status'])}
              size="small"
              fullWidth
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
            <TextField
              label="Review Notes (optional)"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardPageFrame>
  );
}
