import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
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
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ContactMailOutlined,
  ContentCopyOutlined,
  DeleteOutlined,
  DragIndicator,
  FolderOutlined,
  FormatQuoteOutlined,
  ImageOutlined,
  PlayCircleOutlined,
  PublishOutlined,
  TextFieldsOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useGetMediaLibraryQuery } from '../../store/api/contentApi';
import { normalizeApiError } from '../../services/api';
import type { MediaItem } from '../../types';
import { sanitizeHttpUrl } from '../../utils/safeUrl';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'form' | 'testimonial' | 'hero' | 'features' | 'cta';
  content: string;
  title?: string;
  order: number;
  styles?: Record<string, unknown>;
}

type SavePayload = {
  title: string;
  slug: string;
  blocks: ContentBlock[];
  status: 'draft' | 'published';
};

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

const BLOCK_TYPES: Array<{ type: ContentBlock['type']; label: string; icon: React.ReactElement; color: string; description: string }> = [
  { type: 'text', label: 'Text', icon: <TextFieldsOutlined />, color: '#6366f1', description: 'Rich text content' },
  { type: 'image', label: 'Image', icon: <ImageOutlined />, color: '#10b981', description: 'Image with caption' },
  { type: 'video', label: 'Video', icon: <PlayCircleOutlined />, color: '#f59e0b', description: 'Embedded video URL' },
  { type: 'hero', label: 'Hero', icon: <VisibilityOutlined />, color: '#8b5cf6', description: 'Headline section' },
  { type: 'features', label: 'Features', icon: <FolderOutlined />, color: '#ec4899', description: 'Feature list' },
  { type: 'form', label: 'Form', icon: <ContactMailOutlined />, color: '#06b6d4', description: 'Form blueprint' },
  { type: 'testimonial', label: 'Testimonial', icon: <FormatQuoteOutlined />, color: '#14b8a6', description: 'Quote + author' },
  { type: 'cta', label: 'CTA', icon: <PublishOutlined />, color: '#f97316', description: 'Call-to-action section' },
];

const blockDefaults: Partial<Record<ContentBlock['type'], { title?: string; content: string }>> = {
  form: { title: '', content: '' },
  testimonial: { title: '', content: '' },
  hero: { title: '', content: '' },
  features: { title: '', content: '' },
  cta: { title: '', content: '' },
};

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeInitialBlocks = (items: ContentBlock[]) => {
  return [...items]
    .map((item, index) => ({
      ...item,
      id: item.id || `block_${Date.now()}_${index}`,
      order: Number.isFinite(item.order) ? item.order : index,
      title: item.title || '',
      content: item.content || '',
      styles: item.styles || {},
    }))
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
};

const defaultTitleByType = (type: ContentBlock['type']) =>
  BLOCK_TYPES.find((item) => item.type === type)?.label || type.toUpperCase();

export default function PageBuilder({
  initialTitle = '',
  initialSlug = '',
  initialBlocks = [],
  initialStatus = 'draft',
  onSave,
}: {
  initialPageId?: string;
  initialTitle?: string;
  initialSlug?: string;
  initialBlocks?: ContentBlock[];
  initialStatus?: 'draft' | 'published' | 'archived';
  onSave?: (data: SavePayload) => void | Promise<void>;
}) {
  const [pageTitle, setPageTitle] = useState(initialTitle);
  const [pageSlug, setPageSlug] = useState(initialSlug);
  const [blocks, setBlocks] = useState<ContentBlock[]>(normalizeInitialBlocks(initialBlocks));
  const [status, setStatus] = useState<'draft' | 'published'>(initialStatus === 'published' ? 'published' : 'draft');
  const [previewMode, setPreviewMode] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: mediaItems = [], isLoading: isLoadingMedia } = useGetMediaLibraryQuery();

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const markDirty = useCallback(() => {
    setSaveState((current) => (current === 'saving' ? current : 'dirty'));
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    setBlocks((current) => {
      const reordered = [...current];
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination!.index, 0, moved);
      return reordered.map((item, index) => ({ ...item, order: index }));
    });
    markDirty();
  };

  const addBlock = (type: ContentBlock['type']) => {
    const defaults = blockDefaults[type];
    setBlocks((current) => [
      ...current,
      {
        id: `block_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        type,
        title: defaults?.title || '',
        content: defaults?.content || '',
        order: current.length,
        styles: {},
      },
    ]);
    setMenuAnchorEl(null);
    markDirty();
  };

  const updateBlock = useCallback((blockId: string, updates: Partial<ContentBlock>) => {
    setBlocks((current) =>
      current.map((block) => (block.id === blockId ? { ...block, ...updates } : block)),
    );
    markDirty();
  }, [markDirty]);

  const duplicateBlock = (blockId: string) => {
    setBlocks((current) => {
      const existing = current.find((block) => block.id === blockId);
      if (!existing) {
        return current;
      }

      return [
        ...current,
        {
          ...existing,
          id: `block_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          order: current.length,
        },
      ];
    });
    markDirty();
  };

  const removeBlock = (blockId: string) => {
    setBlocks((current) =>
      current
        .filter((block) => block.id !== blockId)
        .map((block, index) => ({ ...block, order: index })),
    );
    markDirty();
  };

  const handleTitleChange = (value: string) => {
    setPageTitle(value);
    if (!pageSlug.trim()) {
      setPageSlug(generateSlug(value));
    }
    markDirty();
  };

  const handleSlugChange = (value: string) => {
    setPageSlug(generateSlug(value));
    markDirty();
  };

  const openMediaSelector = (blockId: string) => {
    setSelectedBlockId(blockId);
    setMediaDialogOpen(true);
  };

  const handleMediaSelect = (media: MediaItem) => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, { content: media.url });
    }
    setSelectedBlockId(null);
    setMediaDialogOpen(false);
    showSnackbar('Media selected', 'success');
  };

  const saveStatusLabel = useMemo(() => {
    if (saveState === 'saved') {
      return 'Saved';
    }
    if (saveState === 'saving') {
      return 'Saving...';
    }
    if (saveState === 'error') {
      return 'Save failed';
    }
    if (saveState === 'dirty') {
      return 'Unsaved changes';
    }
    return 'No changes';
  }, [saveState]);

  const handleSave = async () => {
    const normalizedTitle = pageTitle.trim();
    const normalizedSlug = pageSlug.trim();

    if (!normalizedTitle || !normalizedSlug) {
      showSnackbar('Page title and slug are required.', 'error');
      return;
    }

    if (!onSave) {
      showSnackbar('Save handler is not available.', 'error');
      return;
    }

    try {
      setSaveState('saving');
      await onSave({
        title: normalizedTitle,
        slug: normalizedSlug,
        blocks: blocks.map((block, index) => ({ ...block, order: index })),
        status,
      });
      setSaveState('saved');
      showSnackbar(status === 'published' ? 'Page published successfully.' : 'Draft saved successfully.', 'success');
    } catch (error) {
      setSaveState('error');
      showSnackbar(normalizeApiError(error).message || 'Failed to save page.', 'error');
    }
  };

  const renderBlockEditor = (block: ContentBlock) => {
    if (block.type === 'text') {
      return (
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={block.content}
          onChange={(event) => updateBlock(block.id, { content: event.target.value })}
          placeholder="Write your content..."
          disabled={previewMode}
        />
      );
    }

    if (block.type === 'image' || block.type === 'video') {
      return (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              value={block.content}
              onChange={(event) => updateBlock(block.id, { content: event.target.value })}
              placeholder={block.type === 'image' ? 'Image URL...' : 'Video URL...'}
              disabled={previewMode}
            />
            {!previewMode ? (
              <Button variant="outlined" onClick={() => openMediaSelector(block.id)}>
                Media
              </Button>
            ) : null}
          </Stack>
          {block.content ? (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', minHeight: 140, display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
              {block.type === 'image' ? (
                sanitizeHttpUrl(block.content) ? (
                  <Box component="img" src={sanitizeHttpUrl(block.content) ?? undefined} alt={block.title || 'image'} sx={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain' }} />
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Invalid image URL</Typography>
                )
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{block.content}</Typography>
              )}
            </Box>
          ) : null}
        </Stack>
      );
    }

    if (block.type === 'testimonial') {
      return (
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={block.content}
            onChange={(event) => updateBlock(block.id, { content: event.target.value })}
            placeholder="Quote text..."
            disabled={previewMode}
          />
          <TextField
            fullWidth
            value={block.title || ''}
            onChange={(event) => updateBlock(block.id, { title: event.target.value })}
            placeholder="Author name..."
            disabled={previewMode}
          />
        </Stack>
      );
    }

    return (
      <Stack spacing={1.5}>
        <TextField
          fullWidth
          value={block.title || ''}
          onChange={(event) => updateBlock(block.id, { title: event.target.value })}
          placeholder={`${defaultTitleByType(block.type)} title...`}
          disabled={previewMode}
        />
        <TextField
          fullWidth
          multiline
          minRows={block.type === 'hero' ? 3 : 2}
          value={block.content}
          onChange={(event) => updateBlock(block.id, { content: event.target.value })}
          placeholder="Content..."
          disabled={previewMode}
        />
      </Stack>
    );
  };

  return (
    <Stack spacing={2.5}>
      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Page Builder
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Build and publish CMS pages with reusable content blocks.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {saveStatusLabel}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Switch checked={status === 'published'} onChange={(event) => { setStatus(event.target.checked ? 'published' : 'draft'); markDirty(); }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {status === 'published' ? 'Published' : 'Draft'}
                </Typography>
                <Button variant="outlined" onClick={() => setPreviewMode((current) => !current)}>
                  {previewMode ? 'Edit mode' : 'Preview mode'}
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Page title" value={pageTitle} onChange={(event) => handleTitleChange(event.target.value)} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth label="Slug" value={pageSlug} onChange={(event) => handleSlugChange(event.target.value)} helperText={`/pages/${pageSlug || 'your-page'}`} />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Blocks ({blocks.length})
              </Typography>
              <Button variant="outlined" onClick={(event) => setMenuAnchorEl(event.currentTarget)}>
                Add block
              </Button>
            </Box>

            {blocks.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Start by adding a block (hero, text, image, video, etc.).
              </Alert>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="blocks">
                  {(dropProvided) => (
                    <Box ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
                      {blocks.map((block, index) => {
                        const blockType = BLOCK_TYPES.find((item) => item.type === block.type);
                        const accent = blockType?.color || '#6366f1';

                        return (
                          <Draggable key={block.id} draggableId={block.id} index={index}>
                            {(dragProvided, snapshot) => (
                              <Card
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                sx={{
                                  mb: 1.5,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  boxShadow: snapshot.isDragging ? `0 6px 18px ${alpha(accent, 0.12)}` : 'none',
                                  borderRadius: 1.5,
                                }}
                              >
                                <CardContent sx={{ p: 2 }}>
                                  <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                          {...(!previewMode ? dragProvided.dragHandleProps : {})}
                                          sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 1,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(accent, 0.1),
                                            color: accent,
                                            cursor: previewMode ? 'default' : 'grab',
                                          }}
                                        >
                                          <DragIndicator fontSize="small" />
                                        </Box>
                                        <Typography variant="body2" sx={{ color: accent, fontWeight: 700 }}>
                                          {blockType?.label || block.type}
                                        </Typography>
                                      </Box>
                                      {!previewMode ? (
                                        <Box>
                                          <Tooltip title="Duplicate">
                                            <IconButton size="small" onClick={() => duplicateBlock(block.id)}>
                                              <ContentCopyOutlined fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="Delete">
                                            <IconButton size="small" onClick={() => removeBlock(block.id)} color="error">
                                              <DeleteOutlined fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      ) : null}
                                    </Box>
                                    {renderBlockEditor(block)}
                                  </Stack>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        );
                      })}
                      {dropProvided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
        {BLOCK_TYPES.map((type) => (
          <MenuItem key={type.type} onClick={() => addBlock(type.type)} sx={{ gap: 1.25 }}>
            <Box sx={{ color: type.color, display: 'grid', placeItems: 'center' }}>{type.icon}</Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{type.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{type.description}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      <Dialog open={mediaDialogOpen} onClose={() => setMediaDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Media Library</DialogTitle>
        <DialogContent>
          {isLoadingMedia ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading media...</Typography>
          ) : mediaItems.length === 0 ? (
            <Alert severity="info">No media uploaded yet.</Alert>
          ) : (
            <Grid container spacing={1.5}>
              {mediaItems.map((media) => (
                <Grid key={media._id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card sx={{ cursor: 'pointer', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }} onClick={() => handleMediaSelect(media)}>
                    {media.mimetype.startsWith('image/') ? (
                      sanitizeHttpUrl(media.url) ? (
                        <Box component="img" src={sanitizeHttpUrl(media.url) ?? undefined} alt={media.originalName || media.filename} sx={{ width: '100%', height: 110, objectFit: 'cover' }} />
                      ) : (
                        <Box sx={{ height: 110, display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Invalid URL</Typography>
                        </Box>
                      )
                    ) : (
                      <Box sx={{ height: 110, display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
                        <PlayCircleOutlined color="action" />
                      </Box>
                    )}
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        {media.originalName || media.filename}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMediaDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((current) => ({ ...current, open: false }))} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
