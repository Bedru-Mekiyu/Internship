import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
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
  FilterListOutlined,
  GridViewOutlined,
  MoreVertOutlined,
  PlayCircleOutlineOutlined,
  SearchOutlined,
  SortOutlined,
  UploadFileOutlined,
  ViewListOutlined,
  EditOutlined,
  PreviewOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material';
import { useContent } from '../../hooks/useContent';
import { normalizeApiError } from '../../services/api';
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

const initialMedia: MediaCardItem[] = [
  {
    id: 'hero-banner',
    type: 'image',
    fileName: 'hero_banner_v2.jpg',
    size: '2.4 MB',
    uploadedAt: 'Just now',
    preview: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'team-shot',
    type: 'image',
    fileName: 'team_launch_day.png',
    size: '3.1 MB',
    uploadedAt: '4 min ago',
    preview: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'workspace',
    type: 'image',
    fileName: 'workspace_grid.jpg',
    size: '1.9 MB',
    uploadedAt: '18 min ago',
    preview: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'app-screen',
    type: 'image',
    fileName: 'app_screenshot.png',
    size: '4.7 MB',
    uploadedAt: '26 min ago',
    preview: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'team-meeting',
    type: 'video',
    fileName: 'team_meeting_zoom.mp4',
    size: '14.2 MB',
    uploadedAt: '2 min ago',
    duration: '0:45',
    preview: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'feature-demo',
    type: 'video',
    fileName: 'feature_walkthrough.mp4',
    size: '18.6 MB',
    uploadedAt: '7 min ago',
    duration: '1:12',
    preview: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'brand-guide',
    type: 'document',
    fileName: 'brand_guidelines.pdf',
    size: '8.4 MB',
    uploadedAt: '1 hr ago',
    preview: '',
    accent: '#DBEAFE',
  },
  {
    id: 'quarter-report',
    type: 'document',
    fileName: 'q1_content_report.pdf',
    size: '6.8 MB',
    uploadedAt: '3 hr ago',
    preview: '',
    accent: '#E0F2FE',
  },
];

function MediaCard({
  item,
  onMenuOpen,
}: {
  item: MediaCardItem;
  onMenuOpen: (event: React.MouseEvent<HTMLButtonElement>, mediaId: string) => void;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
          borderColor: 'rgba(0,102,255,0.18)',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {item.type === 'image' ? (
          <CardMedia component="img" height="180" image={item.preview} alt={item.fileName} sx={{ objectFit: 'cover' }} />
        ) : null}

        {item.type === 'video' ? (
          <Box sx={{ position: 'relative' }}>
            <CardMedia component="img" height="180" image={item.preview} alt={item.fileName} sx={{ objectFit: 'cover' }} />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(15,23,42,0.06) 0%, rgba(15,23,42,0.36) 100%)',
              }}
            />
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
            <Box
              sx={{
                position: 'absolute',
                inset: 'auto 12px 12px auto',
                width: 38,
                height: 38,
                borderRadius: '999px',
                bgcolor: 'rgba(255,255,255,0.94)',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
              }}
            >
              <PlayCircleOutlineOutlined />
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
                bgcolor: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
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
            boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
            '&:hover': { bgcolor: '#FFFFFF' },
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
    uploadedAt: 'Recently',
    preview: type === 'document' ? '' : (item.url || ''),
    accent: '#DBEAFE',
  };
}

export default function MediaLibrary() {
  const { media, isLoading, error } = useContent();
  const [tab, setTab] = useState<MediaKind>('all');
  const [search, setSearch] = useState('');
  const [sortLabel] = useState('Newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [removedItemIds, setRemovedItemIds] = useState<string[]>([]);
  const [renamedItems, setRenamedItems] = useState<Record<string, string>>({});
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const items = useMemo(() => {
    const source = media.length ? media.map(mapMediaItem) : initialMedia;

    return source
      .filter((item) => !removedItemIds.includes(item.id))
      .map((item) => ({
        ...item,
        fileName: renamedItems[item.id] ?? item.fileName,
      }));
  }, [media, removedItemIds, renamedItems]);

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

  const deleteItem = () => {
    if (!activeItem) {
      return;
    }

    setRemovedItemIds((currentIds) => [...currentIds, activeItem.id]);
    closeMenu();
  };

  const saveRename = () => {
    if (!activeItem) {
      return;
    }

    const nextName = renameValue.trim();
    if (!nextName) {
      return;
    }

    setRenamedItems((currentItems) => ({
      ...currentItems,
      [activeItem.id]: nextName,
    }));
    setRenameOpen(false);
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack spacing={2.25}>
              {error ? (
                <Typography sx={{ color: 'error.main', fontWeight: 700 }}>
                  {normalizeApiError(error).message || 'Failed to load media files.'}
                </Typography>
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
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 18,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'text.secondary',
                        pointerEvents: 'none',
                      }}
                    >
                      <SearchOutlined fontSize="small" />
                    </Box>
                    <TextField
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search files..."
                      sx={{
                        '& .MuiInputBase-root': {
                          pl: 5.25,
                        },
                      }}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                    <Button variant="outlined" startIcon={<FilterListOutlined />}>
                      Filters
                    </Button>
                    <Button variant="outlined" startIcon={<SortOutlined />}>
                      Sort by: {sortLabel}
                    </Button>
                    <Box sx={{ display: 'inline-flex', border: '1px solid #CBD5E1', borderRadius: '12px', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
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
                      <Divider orientation="vertical" flexItem />
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
                    <Button variant="contained" startIcon={<UploadFileOutlined />} sx={{ minWidth: 160 }}>
                      Upload Media
                    </Button>
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
          <Card sx={{ mt: 2.5 }}>
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
        <MenuItem onClick={deleteItem} sx={{ color: 'error.main' }}>
          <DeleteOutlineOutlined fontSize="small" style={{ marginRight: 10 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Rename file</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField value={renameValue} onChange={(event) => setRenameValue(event.target.value)} label="File name" fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRenameOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={saveRename} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
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
                      bgcolor: '#FFFFFF',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                    }}
                  >
                    <DescriptionOutlined sx={{ fontSize: 44 }} />
                  </Box>
                </Box>
              ) : (
                <Box component="img" src={activeItem.preview} alt={activeItem.fileName} sx={{ width: '100%', borderRadius: '12px', height: 240, objectFit: 'cover' }} />
              )}

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
          <Button onClick={() => setPreviewOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
