import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  DescriptionOutlined,
  GridViewOutlined,
  MoreVertOutlined,
  SearchOutlined,
  ViewListOutlined,
  EditOutlined,
  PreviewOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material';
import { useContent } from '../../hooks/useContent';
import { normalizeApiError } from '../../services/api';
import { sanitizeHttpUrl } from '../../utils/safeUrl';
import { theme } from '../../theme';
type MediaKind = 'all' | 'image' | 'video' | 'document';
type ViewMode = 'grid' | 'list';

interface MediaCardItem {
  id: string;
  type: Exclude<MediaKind, 'all'>;
  fileName: string;
  size: string;
  uploadedAt: string;
  duration?: string;
  preview: string;
  accent?: string;
}

function MediaCard({
  item,
  onMenuOpen,
}: {
  item: MediaCardItem;
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, mediaId: string) => void;
}) {
  const safePreviewUrl = sanitizeHttpUrl(item.preview);

  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'border-color 160ms ease, background-color 160ms ease',
        '&:hover': {
          borderColor: 'primary.light',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {item.type === 'image' && safePreviewUrl ? (
          <CardMedia component="img" height="180" image={safePreviewUrl} alt={item.fileName} sx={{ objectFit: 'cover' }} />
        ) : null}

        {item.type === 'video' && safePreviewUrl ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia component="img" height="180" image={safePreviewUrl} alt={item.fileName} sx={{ objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                left: 12,
                bottom: 12,
                px: 1,
                py: 0.5,
                borderRadius: '999px',
                bgcolor: 'rgba(15,23,42,0.78)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {item.duration}
            </Box>
          </Box>
        ) : null}

        {item.type === 'document' ? (
          <Box
            sx={{
              height: 180,
              bgcolor: item.accent ?? '#DBEAFE',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '18px',
                bgcolor: 'background.paper',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <DescriptionOutlined sx={{ fontSize: 36 }} />
            </Box>
          </Box>
        ) : null}

        <IconButton
          size="small"
          onClick={(event) => onMenuOpen(event, item.id)}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            bgcolor: 'rgba(255,255,255,0.94)',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <MoreVertOutlined fontSize="small" />
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap title={item.fileName}>
          {item.fileName}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.4, color: 'text.secondary' }}>
          {item.size} • {item.uploadedAt}
        </Typography>
      </CardContent>
    </Card>
  );
}

function mapMediaItem(item: {
  _id: string;
  filename: string;
  originalName?: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt?: string;
}): MediaCardItem {
  const mime = String(item.mimetype || '').toLowerCase();
  const type: MediaCardItem['type'] = mime.startsWith('image/')
    ? 'image'
    : mime.startsWith('video/')
      ? 'video'
      : 'document';

  const sizeInMb = Number(item.size || 0) / (1024 * 1024);

  return {
    id: String(item._id),
    type,
    fileName: item.originalName || item.filename || 'untitled.file',
    size: `${sizeInMb.toFixed(1)} MB`,
    uploadedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date',
    preview: type === 'document' ? '' : (item.url || ''),
    accent: '#DBEAFE',
  };
}

export default function MediaLibrary() {
  const {
    media,
    isLoading,
    error,
    removeMedia,
    isDeletingMedia,
    upload,
    isUploading,
    renameMedia,
    isRenamingMedia,
    refetch,
  } = useContent();
  const [tab, setTab] = useState<MediaKind>('all');
  const [search, setSearch] = useState('');
  const [sortLabel] = useState('Newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const items = useMemo(() => media.map(mapMediaItem), [media]);

  const activeItem = items.find((item) => item.id === menuItemId) ?? null;

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesTab = tab === 'all' ? true : item.type === tab;
      const matchesSearch = !query || item.fileName.toLowerCase().includes(query);
      return matchesTab && matchesSearch;
    });
  }, [items, search, tab]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, mediaId: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuItemId(mediaId);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const clearMenuSelection = () => {
    setMenuItemId(null);
  };

  const openRenameDialog = () => {
    if (activeItem) {
      setRenameValue(activeItem.fileName);
      setRenameOpen(true);
    }
    closeMenu();
  };

  const openPreviewDialog = () => {
    setPreviewOpen(true);
    closeMenu();
  };

  const deleteItem = async (mediaId: string) => {
    if (!mediaId) {
      return;
    }

    try {
      setDeleteError(null);
      await removeMedia(mediaId);
      await refetch();
      closeMenu();
      clearMenuSelection();
      setActionMessage({ type: 'success', text: 'Media deleted successfully.' });
    } catch (requestError) {
      setDeleteError(normalizeApiError(requestError).message || 'Failed to delete media file.');
    }
  };

  const saveRename = async () => {
    if (!activeItem) {
      return;
    }

    const nextName = renameValue.trim();
    if (!nextName) {
      return;
    }

    try {
      await renameMedia(activeItem.id, nextName);
      await refetch();
      setRenameOpen(false);
      clearMenuSelection();
      setActionMessage({ type: 'success', text: 'Media renamed successfully.' });
    } catch (requestError) {
      setActionMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || 'Failed to rename media file.',
      });
    }
  };

  const handleUploadMediaClick = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadMediaChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    try {
      const payload = new FormData();
      payload.append('file', file);
      await upload(payload);
      await refetch();
      setActionMessage({ type: 'success', text: `${file.name} uploaded successfully.` });
    } catch (requestError) {
      setActionMessage({
        type: 'error',
        text: normalizeApiError(requestError).message || 'Failed to upload media file.',
      });
    }
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Card sx={{ mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.25}>
              {error ? (
                <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
                  Media service is temporarily unavailable. Please try again.
                </Typography>
              ) : null}
              {deleteError ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {deleteError}
                </Alert>
              ) : null}
              {actionMessage ? (
                <Alert severity={actionMessage.type} sx={{ borderRadius: 2 }} onClose={() => setActionMessage(null)}>
                  {actionMessage.text}
                </Alert>
              ) : null}

              {isLoading ? (
                <Typography sx={{ color: 'text.secondary' }}>Loading media files...</Typography>
              ) : null}

              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                Media Library
              </Typography>

              <Tabs
                value={tab}
                onChange={(_, nextTab) => setTab(nextTab)}
                sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 700 } }}
              >
                <Tab value="all" label="All Files" />
                <Tab value="image" label="Images" />
                <Tab value="video" label="Videos" />
                <Tab value="document" label="Documents" />
              </Tabs>

              <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search files..."
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

                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Sort: {sortLabel}
                    </Typography>
                    <Box sx={{ display: 'inline-flex', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden', bgcolor: 'background.paper' }}>
                      <IconButton
                        onClick={() => setViewMode('grid')}
                        sx={{
                          borderRadius: 0,
                          bgcolor: viewMode === 'grid' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          color: viewMode === 'grid' ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        <GridViewOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => setViewMode('list')}
                        sx={{
                          borderRadius: 0,
                          bgcolor: viewMode === 'list' ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                          color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        <ViewListOutlined fontSize="small" />
                      </IconButton>
                    </Box>
                    <Button variant="contained" sx={{ minWidth: 160 }} onClick={handleUploadMediaClick} disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Upload Media'}
                    </Button>
                    <input ref={uploadInputRef} type="file" hidden onChange={handleUploadMediaChange} />
                  </Box>
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          {filteredItems.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
              <MediaCard item={item} onMenuOpen={handleMenuOpen} />
            </Grid>
          ))}
        </Grid>

        {!filteredItems.length ? (
          <Card sx={{ mt: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                No files found
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Try a different search term or switch to another tab.
              </Typography>
            </CardContent>
          </Card>
        ) : null}

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={openPreviewDialog}>
          <PreviewOutlined fontSize="small" style={{ marginRight: 10 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={openRenameDialog}>
          <EditOutlined fontSize="small" style={{ marginRight: 10 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={() => menuItemId && void deleteItem(menuItemId)} sx={{ color: 'error.main' }} disabled={isDeletingMedia}>
          <DeleteOutlineOutlined fontSize="small" style={{ marginRight: 10 }} />
          {isDeletingMedia ? 'Deleting...' : 'Delete'}
        </MenuItem>
      </Menu>

      <Dialog open={renameOpen} onClose={() => { setRenameOpen(false); clearMenuSelection(); }} maxWidth="xs" fullWidth>
        <DialogTitle>Rename file</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField value={renameValue} onChange={(event) => setRenameValue(event.target.value)} label="File name" fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setRenameOpen(false); clearMenuSelection(); }} variant="outlined">
            Cancel
          </Button>
          <Button onClick={() => void saveRename()} variant="contained" disabled={isRenamingMedia}>
            {isRenamingMedia ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => { setPreviewOpen(false); clearMenuSelection(); }} maxWidth="sm" fullWidth>
        <DialogTitle>Preview media</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {activeItem ? (
            <Stack spacing={2}>
              {activeItem.type === 'document' ? (
                <Box sx={{ height: 240, borderRadius: '12px', bgcolor: activeItem.accent ?? '#DBEAFE', display: 'grid', placeItems: 'center' }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '22px',
                      bgcolor: 'background.paper',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                    }}
                  >
                    <DescriptionOutlined sx={{ fontSize: 44 }} />
                  </Box>
                </Box>
              ) : sanitizeHttpUrl(activeItem.preview) ? (
                <Box component="img" src={sanitizeHttpUrl(activeItem.preview) ?? undefined} alt={activeItem.fileName} sx={{ width: '100%', borderRadius: '12px', height: 240, objectFit: 'cover' }} />
              ) : null}

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {activeItem.fileName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {activeItem.size} • {activeItem.uploadedAt}
                </Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => { setPreviewOpen(false); clearMenuSelection(); }} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
