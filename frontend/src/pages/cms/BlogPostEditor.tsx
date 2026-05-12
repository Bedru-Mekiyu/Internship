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
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  SearchOutlined,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { normalizeApiError } from '../../services/api';
import { useContent } from '../../hooks/useContent';
import type { ContentItem } from '../../types';
import DashboardPageFrame from '../../components/common/DashboardPageFrame';

type PostFilter = 'all' | 'published' | 'drafts';
type FormState = {
  title: string;
  slug: string;
  status: 'draft' | 'published';
  content: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const initialForm: FormState = {
  title: '',
  slug: '',
  status: 'draft',
  content: '',
};

const getPostPreview = (content: string) => {
  const trimmed = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return trimmed.slice(0, 90) || 'No content yet';
};

const surfaceCardSx = {
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: 'none',
} as const;

const toFormState = (post: ContentItem | null): FormState => {
  if (!post) {
    return initialForm;
  }

  return {
    title: post.title || '',
    slug: post.slug || '',
    status: post.status === 'published' ? 'published' : 'draft',
    content: post.content || '',
  };
};

export default function BlogPostEditor() {
  const { managedContent, isLoading, isCreating, isUpdating, isDeleting, create, update, remove, refetch } = useContent();
  const [filter, setFilter] = useState<PostFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [isDirty, setIsDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; severity: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const posts = useMemo(
    () =>
      managedContent
        .filter((item) => item.type === 'post')
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime()
            - new Date(a.updatedAt || a.createdAt || 0).getTime(),
        ),
    [managedContent],
  );

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter((post) => {
      const statusMatch =
        filter === 'all'
          ? true
          : filter === 'published'
            ? post.status === 'published'
            : post.status !== 'published';
      const queryMatch =
        !query
        || post.title.toLowerCase().includes(query)
        || post.slug.toLowerCase().includes(query)
        || getPostPreview(post.content || '').toLowerCase().includes(query);
      return statusMatch && queryMatch;
    });
  }, [posts, search, filter]);

  const effectiveSelectedPostId = selectedPostId || posts[0]?._id || null;
  const selectedPost = useMemo(
    () => posts.find((post) => post._id === effectiveSelectedPostId) || null,
    [posts, effectiveSelectedPostId],
  );
  const displayedForm = isDirty ? form : toFormState(selectedPost);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...(isDirty ? current : displayedForm), [key]: value }));
    setIsDirty(true);
  };

  const createNewPostDraft = () => {
    setSelectedPostId(null);
    setForm({
      title: 'Untitled post',
      slug: '',
      status: 'draft',
      content: '',
    });
    setIsDirty(true);
    setStatusMessage({ text: 'New draft started.', severity: 'info' });
  };

  const discardChanges = () => {
    if (selectedPost) {
      setForm({
        title: selectedPost.title || '',
        slug: selectedPost.slug || '',
        status: selectedPost.status === 'published' ? 'published' : 'draft',
        content: selectedPost.content || '',
      });
      setIsDirty(false);
      return;
    }
    setForm(initialForm);
    setIsDirty(false);
  };

  const savePost = async (status: 'draft' | 'published') => {
    const title = form.title.trim();
    const slug = slugify((form.slug || form.title).trim());
    const content = form.content;

    if (!title) {
      setStatusMessage({ text: 'Post title is required.', severity: 'error' });
      return;
    }
    if (!slug) {
      setStatusMessage({ text: 'Slug is required.', severity: 'error' });
      return;
    }

    const payload: Partial<ContentItem> = {
      type: 'post',
      title,
      slug,
      status,
      content,
      blocks: [
        {
          id: 'post-body',
          type: 'text',
          content,
          order: 0,
        },
      ],
    };

    try {
      if (selectedPost?._id) {
        const saved = await update(selectedPost._id, payload);
        setSelectedPostId(saved._id);
      } else {
        const saved = await create(payload);
        setSelectedPostId(saved._id);
      }
      await refetch();
      setIsDirty(false);
      setStatusMessage({
        text: status === 'published' ? 'Post published successfully.' : 'Draft saved successfully.',
        severity: 'success',
      });
    } catch (error) {
      setStatusMessage({
        text: normalizeApiError(error).message || 'Failed to save post.',
        severity: 'error',
      });
    }
  };

  const deleteSelectedPost = async () => {
    if (!selectedPost?._id) {
      setDeleteOpen(false);
      return;
    }
    try {
      await remove(selectedPost._id);
      await refetch();
      setDeleteOpen(false);
      setSelectedPostId(null);
      setForm(initialForm);
      setIsDirty(false);
      setStatusMessage({ text: 'Post deleted successfully.', severity: 'success' });
    } catch (error) {
      setDeleteOpen(false);
      setStatusMessage({
        text: normalizeApiError(error).message || 'Failed to delete post.',
        severity: 'error',
      });
    }
  };

  const isBusy = isCreating || isUpdating || isDeleting;

  return (
    <DashboardPageFrame
      title="Blog Posts"
      description="Create, edit, and manage your blog posts and articles."
      breadcrumbs={[
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Content Manager', to: '/cms/content' },
        { label: 'Blog Posts' },
      ]}
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={createNewPostDraft}
            disabled={isBusy}
          >
            New draft
          </Button>
          {selectedPost ? (
            <Button
              color="error"
              variant="outlined"
              onClick={() => setDeleteOpen(true)}
              disabled={isBusy}
            >
              Delete
            </Button>
          ) : null}
        </Stack>
      }
    >
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 1.5, sm: 2, md: 3 } }}>
      <Stack spacing={2}>

        {statusMessage ? (
          <Alert severity={statusMessage.severity} sx={{ borderRadius: 2 }}>
            {statusMessage.text}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ ...surfaceCardSx, height: '100%' }}>
              <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search posts..."
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
                  value={filter}
                  onChange={(_, next) => setFilter(next)}
                  variant="fullWidth"
                  sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 700 } }}
                >
                  <Tab value="all" label="All" />
                  <Tab value="published" label="Published" />
                  <Tab value="drafts" label="Drafts" />
                </Tabs>
                <Stack spacing={1} sx={{ overflowY: 'auto', maxHeight: { md: '62vh' }, pr: 0.5 }}>
                  {isLoading ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading posts...</Typography>
                  ) : filteredPosts.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No posts found.</Typography>
                  ) : (
                    filteredPosts.map((post) => (
                      <Card
                        key={post._id}
                        variant="outlined"
                        onClick={() => {
                          setSelectedPostId(post._id);
                          setForm(toFormState(post));
                          setIsDirty(false);
                        }}
                        sx={{
                          cursor: 'pointer',
                          borderColor: post._id === effectiveSelectedPostId ? 'primary.main' : 'divider',
                          bgcolor: post._id === effectiveSelectedPostId ? alpha('#0066FF', 0.05) : '#FFFFFF',
                        }}
                      >
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                            {post.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                            {getPostPreview(post.content || '')}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              {post.status === 'published' ? 'Published' : 'Draft'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={surfaceCardSx}>
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                <Stack spacing={2}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <TextField
                        label="Post title"
                        value={displayedForm.title}
                        onChange={(event) => {
                          const nextTitle = event.target.value;
                          updateForm('title', nextTitle);
                          if (!displayedForm.slug.trim()) {
                            updateForm('slug', slugify(nextTitle));
                          }
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Select
                          value={displayedForm.status}
                          onChange={(event) => updateForm('status', event.target.value as FormState['status'])}
                          fullWidth
                        >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                      </Select>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                          label="Slug"
                          value={displayedForm.slug}
                          onChange={(event) => updateForm('slug', slugify(event.target.value))}
                          fullWidth
                        />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Post content"
                    multiline
                    minRows={18}
                    value={displayedForm.content}
                    onChange={(event) => updateForm('content', event.target.value)}
                    fullWidth
                    placeholder="Start writing your post..."
                    sx={{ '& .MuiInputBase-root': { alignItems: 'flex-start' } }}
                  />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="outlined"
                      onClick={() => savePost('draft')}
                      disabled={isBusy || !isDirty}
                      fullWidth
                    >
                      {isUpdating || isCreating ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => savePost('published')}
                      disabled={isBusy || !isDirty}
                      fullWidth
                    >
                      {isUpdating || isCreating ? 'Publishing...' : 'Publish'}
                    </Button>
                    <Button
                      variant="text"
                      onClick={discardChanges}
                      disabled={!isDirty || isBusy}
                    >
                      Discard
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete post?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This action permanently deletes the selected post.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={deleteSelectedPost}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
    </DashboardPageFrame>
  );
}
