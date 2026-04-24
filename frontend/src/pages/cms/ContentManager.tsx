import { useMemo, useState } from 'react';
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
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CloudDoneOutlined,
  CloudOffOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  MoreVertOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import { normalizeApiError } from '../../services/api';
import { useContent } from '../../hooks/useContent';
import PageBuilder, { type ContentBlock } from './PageBuilder';
import type { ContentItem } from '../../types';
import DashboardPageFrame, { DashboardSection } from '../../components/common/DashboardPageFrame';

const parseBlocks = (page: ContentItem): ContentBlock[] => {
  if (Array.isArray(page.blocks)) {
    return page.blocks;
  }

  if (typeof page.content === 'string' && page.content.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(page.content) as ContentBlock[];
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return [];
    }
  }

  return [];
};

export default function ContentManager() {
  const { managedContent: pages, isLoading, create, update, remove, refetch } = useContent();

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedPage, setSelectedPage] = useState<ContentItem | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPage, setMenuPage] = useState<ContentItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((page) => {
      const matchesSearch = !q || page.title.toLowerCase().includes(q) || page.slug.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [pages, search, statusFilter]);

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async (data: { title: string; slug: string; blocks: ContentBlock[]; status: 'draft' | 'published' }) => {
    try {
      if (selectedPage?._id) {
        await update(selectedPage._id, {
          title: data.title,
          slug: data.slug,
          status: data.status,
          type: 'page',
          blocks: data.blocks,
          content: JSON.stringify(data.blocks),
        });
        showSnackbar('Page updated successfully.', 'success');
      } else {
        await create({
          title: data.title,
          slug: data.slug,
          status: data.status,
          type: 'page',
          blocks: data.blocks,
          content: JSON.stringify(data.blocks),
        });
        showSnackbar('Page created successfully.', 'success');
      }

      await refetch();
      setSelectedPage(null);
      setView('list');
    } catch (error) {
      showSnackbar(normalizeApiError(error).message || 'Failed to save page.', 'error');
    }
  };

  const handlePublishToggle = async (page: ContentItem) => {
    try {
      const next = page.status === 'published' ? 'draft' : 'published';
      await update(page._id, { status: next });
      await refetch();
      showSnackbar(next === 'published' ? 'Page published.' : 'Page moved to draft.', 'success');
    } catch (error) {
      showSnackbar(normalizeApiError(error).message || 'Failed to update status.', 'error');
    }
  };

  const handleDuplicate = async (page: ContentItem) => {
    try {
      await create({
        type: 'page',
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy-${Date.now().toString().slice(-4)}`,
        status: 'draft',
        blocks: parseBlocks(page),
        content: typeof page.content === 'string' ? page.content : JSON.stringify(parseBlocks(page)),
      });
      await refetch();
      showSnackbar('Page duplicated.', 'success');
    } catch (error) {
      showSnackbar(normalizeApiError(error).message || 'Failed to duplicate page.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!menuPage?._id) {
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await remove(menuPage._id);
      await refetch();
      showSnackbar('Page deleted.', 'success');
    } catch (error) {
      showSnackbar(normalizeApiError(error).message || 'Failed to delete page.', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setMenuPage(null);
    }
  };

  if (view === 'create' || view === 'edit') {
    return (
      <Stack spacing={2}>
        <Button
          onClick={() => {
            setView('list');
            setSelectedPage(null);
          }}
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to pages
        </Button>
        <PageBuilder
          initialPageId={selectedPage?._id}
          initialTitle={selectedPage?.title || ''}
          initialSlug={selectedPage?.slug || ''}
          initialBlocks={selectedPage ? parseBlocks(selectedPage) : []}
          initialStatus={(selectedPage?.status as 'draft' | 'published' | 'archived') || 'draft'}
          onSave={handleSave}
        />
      </Stack>
    );
  }

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default' }}>
      <DashboardPageFrame
        title="Content Manager"
        description="Manage CMS pages and maintain structured learning content across the platform."
        actions={(
          <Button variant="contained" onClick={() => { setSelectedPage(null); setView('create'); }}>
            New page
          </Button>
        )}
      >
        <DashboardSection>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title or slug..."
                sx={{ flex: { xs: '1 1 100%', md: '1 1 420px' } }}
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
              <Tabs
                value={statusFilter}
                onChange={(_, nextValue) => setStatusFilter(nextValue)}
                sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 700 } }}
              >
                <Tab label="All" value="all" />
                <Tab label="Published" value="published" />
                <Tab label="Draft" value="draft" />
                <Tab label="Archived" value="archived" />
              </Tabs>
            </Box>
          </Stack>
        </DashboardSection>

      {isLoading ? (
        <Alert severity="info">Loading pages...</Alert>
      ) : filteredPages.length === 0 ? (
        <Alert severity="info">No pages match your filters yet.</Alert>
      ) : (
        <Grid container spacing={1.5}>
          {filteredPages.map((page) => (
            <Grid key={page._id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1.25}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
                          {page.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                          /pages/{page.slug}
                        </Typography>
                      </Box>
                      <Box>
                        <Tooltip title="More actions">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              setMenuAnchorEl(event.currentTarget);
                              setMenuPage(page);
                            }}
                          >
                            <MoreVertOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ px: 1, py: 0.25, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.default' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                          {(page.status || 'draft').toUpperCase()}
                        </Typography>
                      </Box>
                      <Button size="small" onClick={() => { setSelectedPage(page); setView('edit'); }}>
                        Edit
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => { setMenuAnchorEl(null); setMenuPage(null); }}>
        <MenuItem
          onClick={() => {
            if (menuPage) {
              void handleDuplicate(menuPage);
            }
            setMenuAnchorEl(null);
          }}
          sx={{ gap: 1.25 }}
        >
          <ContentCopyOutlined fontSize="small" />
          Duplicate
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPage) {
              void handlePublishToggle(menuPage);
            }
            setMenuAnchorEl(null);
          }}
          sx={{ gap: 1.25 }}
        >
          {menuPage?.status === 'published' ? <CloudOffOutlined fontSize="small" /> : <CloudDoneOutlined fontSize="small" />}
          {menuPage?.status === 'published' ? 'Move to draft' : 'Publish'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            setMenuAnchorEl(null);
          }}
          sx={{ gap: 1.25, color: 'error.main' }}
        >
          <DeleteOutlined fontSize="small" />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete page?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This action permanently removes the page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </DashboardPageFrame>
    </Box>
  );
}
