import { useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  List,
  ListItemButton,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  SearchOutlined,
  AddOutlined,
  FormatBoldOutlined,
  FormatItalicOutlined,
  FormatUnderlinedOutlined,
  LinkOutlined,
  FormatListBulletedOutlined,
  FormatListNumberedOutlined,
  FormatQuoteOutlined,
  ImageOutlined,
  CloseOutlined,
  PublicOutlined,
} from '@mui/icons-material';
import { useContent } from '../../hooks/useContent';
import { normalizeApiError } from '../../services/api';
import { theme } from '../../theme';

type PostStatus = 'Published' | 'Draft';
type PostFilter = 'all' | 'published' | 'drafts';

interface BlogPost {
  id: string;
  title: string;
  status: PostStatus;
  timestamp: string;
  content: string;
}

const initialPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: '10 LMS Trends to Watch in 2024',
    status: 'Draft',
    timestamp: 'Just now',
    content:
      '<h2>Start writing your next great post...</h2><p>Build a post that helps your audience understand where LMS platforms are heading. Add data-backed trends, screenshots, and practical recommendations.</p><ol><li>Personalized learning journeys</li><li>AI-assisted content creation</li><li>Mobile-first delivery</li></ol>',
  },
  {
    id: 'post-2',
    title: 'How to Engage Students in Online Learning',
    status: 'Published',
    timestamp: '2 days ago',
    content: '<h2>How to Engage Students in Online Learning</h2><p>Use interactive formats, meaningful feedback, and structured pacing to increase participation.</p>',
  },
  {
    id: 'post-3',
    title: 'Gamification in E-Learning: A Complete Guide',
    status: 'Published',
    timestamp: '1 week ago',
    content: '<h2>Gamification in E-Learning</h2><p>Points, badges, and challenges can improve retention when applied with purpose.</p>',
  },
  {
    id: 'post-4',
    title: 'Why Mobile Learning is the Future',
    status: 'Draft',
    timestamp: '3 days ago',
    content: '<h2>Why Mobile Learning is the Future</h2><p>Mobile devices are now a primary learning environment for many users.</p>',
  },
  {
    id: 'post-5',
    title: 'Top 5 Accessibility Tools for Courses',
    status: 'Published',
    timestamp: '5 days ago',
    content: '<h2>Top 5 Accessibility Tools for Courses</h2><p>Accessible learning experiences create better outcomes for all students.</p>',
  },
];

const categories = ['E-Learning Trends', 'Course Design', 'Student Engagement', 'Accessibility', 'Product Updates'];
const authorOptions = ['Maria Garcia', 'Alex Morgan', 'Sarah Kim'];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'untitled-post';

function StatusChip({ status }: { status: PostStatus }) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.45,
        borderRadius: '999px',
        fontSize: 12,
        fontWeight: 700,
        bgcolor: status === 'Published' ? alpha(theme.palette.success.main, 0.12) : alpha('#64748B', 0.12),
        color: status === 'Published' ? 'success.main' : 'text.secondary',
      }}
    >
      {status}
    </Box>
  );
}

function PostRow({
  post,
  active,
  onClick,
}: {
  post: BlogPost;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <ListItemButton
      onClick={onClick}
      selected={active}
      sx={{
        borderRadius: '12px',
        px: 1.5,
        py: 1.4,
        alignItems: 'flex-start',
        gap: 1.25,
        '&.Mui-selected': {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
        },
      }}
    >
      <Avatar sx={{ width: 42, height: 42, bgcolor: active ? 'primary.main' : alpha(theme.palette.primary.main, 0.1), color: active ? '#FFFFFF' : 'primary.main', fontWeight: 700 }}>
        {post.title.slice(0, 1)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {post.title}
          </Typography>
          <StatusChip status={post.status} />
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {post.timestamp}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

function EditorToolbar() {
  const tools = [
    FormatBoldOutlined,
    FormatItalicOutlined,
    FormatUnderlinedOutlined,
    LinkOutlined,
    FormatListBulletedOutlined,
    FormatListNumberedOutlined,
    FormatQuoteOutlined,
    ImageOutlined,
  ];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
      {tools.map((Tool, index) => (
        <IconButton key={`${Tool.name}-${index}`} size="small" sx={{ color: 'text.secondary', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
          <Tool fontSize="small" />
        </IconButton>
      ))}
    </Box>
  );
}

function FeaturedImageCard() {
  return (
    <Box
      sx={{
        height: 180,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, rgba(17,24,39,0.96), rgba(30,41,59,0.96) 60%, rgba(99,102,241,0.28))',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top left, rgba(99,102,241,0.25), transparent 28%), radial-gradient(circle at bottom right, rgba(0,102,255,0.22), transparent 25%)' }} />
      <Box sx={{ position: 'relative', p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.78), fontWeight: 800, letterSpacing: '0.18em' }}>
          FEATURED IMAGE
        </Typography>
        <Box>
          <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 900, letterSpacing: '-0.02em' }}>
            FUTURE OF E-LEARNING
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            <Box sx={{ width: 74, height: 8, borderRadius: 999, bgcolor: alpha('#FFFFFF', 0.28) }} />
            <Box sx={{ width: 46, height: 8, borderRadius: 999, bgcolor: alpha('#FFFFFF', 0.16) }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function BlogPostEditor() {
  const { create, isCreating } = useContent();
  const [filter, setFilter] = useState<PostFilter>('all');
  const [search, setSearch] = useState('');
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState(initialPosts[0].id);
  const [editorValue, setEditorValue] = useState(initialPosts[0].content);
  const [author, setAuthor] = useState('Maria Garcia');
  const [selectedTags, setSelectedTags] = useState(['LMS', '2024', 'AI']);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusSeverity, setStatusSeverity] = useState<'success' | 'error'>('success');

  const currentPost = posts.find((post) => post.id === selectedPostId) ?? posts[0];

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesFilter = filter === 'all' ? true : filter === 'published' ? post.status === 'Published' : post.status === 'Draft';
      const matchesSearch = !query || post.title.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [posts, search, filter]);

  const publish = () => {
    void (async () => {
      try {
        await create({
          type: 'post',
          title: currentPost.title,
          content: editorValue,
          slug: slugify(currentPost.title),
          status: 'published',
        });

        setStatusSeverity('success');
        setStatusMessage(`Published "${currentPost.title}"`);
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === currentPost.id
              ? { ...post, status: 'Published', timestamp: 'Just published', content: editorValue }
              : post,
          )
        );
      } catch (error) {
        setStatusSeverity('error');
        setStatusMessage(normalizeApiError(error).message || 'Failed to publish post.');
      }
    })();
  };

  const saveDraft = () => {
    void (async () => {
      try {
        await create({
          type: 'post',
          title: currentPost.title,
          content: editorValue,
          slug: slugify(currentPost.title),
          status: 'draft',
        });

        setStatusSeverity('success');
        setStatusMessage(`Draft saved for "${currentPost.title}"`);
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === currentPost.id ? { ...post, status: 'Draft', timestamp: 'Saved just now', content: editorValue } : post,
          )
        );
      } catch (error) {
        setStatusSeverity('error');
        setStatusMessage(normalizeApiError(error).message || 'Failed to save draft.');
      }
    })();
  };

  const removeTag = (tag: string) => {
    setSelectedTags((currentTags) => currentTags.filter((currentTag) => currentTag !== tag));
    setStatusMessage(`Removed tag: ${tag}`);
  };

  const createPost = () => {
    void (async () => {
      const nextId = `post-${Date.now()}`;
      const nextPost: BlogPost = {
        id: nextId,
        title: 'Untitled post',
        status: 'Draft',
        timestamp: 'Just now',
        content: '<h2>Untitled post</h2><p>Start drafting your new article here.</p>',
      };

      try {
        await create({
          type: 'post',
          title: nextPost.title,
          content: nextPost.content,
          slug: slugify(nextPost.title),
          status: 'draft',
        });

        setPosts((currentPosts) => [nextPost, ...currentPosts]);
        setSelectedPostId(nextId);
        setEditorValue(nextPost.content);
        setSelectedTags(['LMS', '2024', 'AI']);
        setStatusSeverity('success');
        setStatusMessage('New draft created');
      } catch (error) {
        setStatusSeverity('error');
        setStatusMessage(normalizeApiError(error).message || 'Failed to create post draft.');
      }
    })();
  };

  const onSelectPost = (post: BlogPost) => {
    setSelectedPostId(post.id);
    setEditorValue(post.content);
    setSelectedTags(['LMS', '2024', 'AI']);
    setStatusMessage(null);
  };

  return (
    <Box sx={{ minHeight: '100%', bgcolor: 'background.default', p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2.5 }}>
          Content manager
        </Typography>

        {statusMessage ? (
          <Alert severity={statusSeverity} sx={{ mb: 2.25, borderRadius: '12px' }} onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        ) : null}

        <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', overflow: 'hidden' }}>
              <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2.5, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Posts
                    </Typography>
                    <IconButton onClick={createPost} disabled={isCreating} sx={{ bgcolor: 'primary.main', color: '#FFFFFF', '&:hover': { bgcolor: 'primary.dark' } }}>
                      <AddOutlined />
                    </IconButton>
                  </Box>

                  <Box sx={{ position: 'relative', mt: 2 }}>
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
                      placeholder="Search posts..."
                      sx={{
                        '& .MuiInputBase-root': {
                          pl: 5.25,
                        },
                      }}
                    />
                  </Box>

                  <Tabs
                    value={filter}
                    onChange={(_, value) => setFilter(value)}
                    sx={{ mt: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 700, px: 1.5 } }}
                  >
                    <Tab value="all" label="All" />
                    <Tab value="published" label="Published" />
                    <Tab value="drafts" label="Drafts" />
                  </Tabs>
                </Box>

                <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  <List disablePadding sx={{ display: 'grid', gap: 0.75 }}>
                    {filteredPosts.map((post) => (
                      <PostRow key={post.id} post={post} active={post.id === selectedPostId} onClick={() => onSelectPost(post)} />
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
                      {currentPost.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      Draft mode
                    </Typography>
                  </Box>

                  <Box sx={{ pb: 1 }}>
                    <EditorToolbar />
                  </Box>

                  <Box
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(event) => setEditorValue((event.currentTarget as HTMLDivElement).innerHTML)}
                    dangerouslySetInnerHTML={{ __html: editorValue }}
                    sx={{
                      flex: 1,
                      minHeight: 520,
                      p: 2.5,
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                      outline: 'none',
                      overflowY: 'auto',
                      '&:focus': {
                        borderColor: 'primary.main',
                        boxShadow: '0 0 0 4px rgba(0,102,255,0.08)',
                      },
                    }}
                    component="div"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2.25}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" fullWidth onClick={saveDraft} disabled={isCreating}>
                      {isCreating ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button variant="contained" fullWidth onClick={publish} disabled={isCreating}>
                      {isCreating ? 'Publishing...' : 'Publish'}
                    </Button>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.14em' }}>
                      SETTINGS
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Visibility
                    </Typography>
                    <Select value="Public" fullWidth>
                      <MenuItem value="Public">
                        <PublicOutlined sx={{ mr: 1, fontSize: 18 }} /> Public
                      </MenuItem>
                    </Select>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      URL Slug
                    </Typography>
                    <TextField value="10-lms-trends-2024" fullWidth />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Category
                    </Typography>
                    <Select value="E-Learning Trends" fullWidth>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {selectedTags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onDelete={() => removeTag(tag)}
                          deleteIcon={<CloseOutlined />}
                          sx={{ bgcolor: alpha('#0066FF', 0.08), color: 'primary.main', fontWeight: 700 }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Featured Image
                    </Typography>
                    <FeaturedImageCard />
                    <Button variant="outlined" fullWidth sx={{ mt: 1.5 }} onClick={() => setStatusMessage('Featured image replace flow opened')}>
                      Replace Image
                    </Button>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.75 }}>
                      Author
                    </Typography>
                    <Select value={author} onChange={(event) => setAuthor(event.target.value)} fullWidth>
                      {authorOptions.map((person) => (
                        <MenuItem key={person} value={person}>
                          {person}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Box>
  );
}
