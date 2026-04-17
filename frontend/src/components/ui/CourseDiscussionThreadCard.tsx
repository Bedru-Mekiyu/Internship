import { Avatar, Badge, Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { BookmarkBorderOutlined, InsertDriveFileOutlined } from '@mui/icons-material';
import { theme } from '../../theme';

export type ThreadCategory = 'All' | 'Announcements' | 'Q&A' | 'Study Group' | 'Project Help';

export type Reply = {
  id: number;
  author: string;
  role: string;
  time: string;
  text: string;
  accent: string;
  isInstructor?: boolean;
  isRead?: boolean;
  attachments?: string[];
  reactions?: Array<{ emoji: string; count: number }>;
};

export type Thread = {
  id: number;
  title: string;
  category: Exclude<ThreadCategory, 'All'>;
  courseLabel: string;
  lessonLabel: string;
  deepLinkPath: string;
  author: string;
  avatar: string;
  accent: string;
  summary: string;
  replies: number;
  unread: number;
  lastActivity: string;
  pinned?: boolean;
  live?: boolean;
  tags: string[];
  repliesList: Reply[];
};

function getAttachmentDetails(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
    return { label: 'Image attachment', sizeLabel: '1.2 MB', accent: '#0EA5E9' };
  }

  if (extension === 'pdf') {
    return { label: 'PDF document', sizeLabel: '842 KB', accent: '#EF4444' };
  }

  if (['zip', 'rar'].includes(extension)) {
    return { label: 'Compressed archive', sizeLabel: '3.6 MB', accent: '#7C3AED' };
  }

  return { label: 'File attachment', sizeLabel: '512 KB', accent: '#64748B' };
}

export function ThreadItem({ thread, active, onClick }: { thread: Thread; active: boolean; onClick: () => void }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: 0 }}
      sx={{
        cursor: 'pointer',
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : '#FFFFFF',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.5,
        py: 1.3,
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        display: 'flex',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
          borderColor: alpha(theme.palette.primary.main, 0.25),
        },
      }}
    >
      <Avatar sx={{ width: 44, height: 44, bgcolor: thread.accent, color: '#FFFFFF', fontWeight: 800, flexShrink: 0 }}>
        {thread.avatar}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
            {thread.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {thread.pinned ? <BookmarkBorderOutlined fontSize="small" /> : null}
            {thread.unread > 0 ? <Badge color="error" badgeContent={thread.unread} /> : null}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }} noWrap>
          {thread.summary}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={thread.category} sx={{ bgcolor: alpha(thread.accent, 0.12), color: thread.accent, fontWeight: 700 }} />
          {thread.live ? <Chip size="small" label="Live" color="success" /> : null}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {thread.replies} replies
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function ReplyBubble({ reply }: { reply: Reply }) {
  const isInstructor = Boolean(reply.isInstructor);
  const hasUnreadMarker = reply.isRead === false;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Box sx={{ maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15, mb: 0.75 }}>
          <Avatar sx={{ width: 38, height: 38, bgcolor: reply.accent, color: '#FFFFFF', fontWeight: 800 }}>
            {reply.author.split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </Avatar>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {reply.author}
              </Typography>
              <Chip label={reply.role} size="small" sx={{ height: 22, bgcolor: isInstructor ? alpha(theme.palette.primary.main, 0.1) : '#F8FAFC', color: isInstructor ? 'primary.main' : 'text.secondary', fontWeight: 700 }} />
              <Chip
                label={hasUnreadMarker ? 'Unread' : 'Read'}
                size="small"
                sx={{
                  height: 22,
                  bgcolor: hasUnreadMarker ? alpha('#EF4444', 0.1) : alpha('#10B981', 0.1),
                  color: hasUnreadMarker ? '#EF4444' : '#10B981',
                  fontWeight: 700,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {reply.time}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            ml: 6.1,
            borderRadius: 3,
            bgcolor: isInstructor ? alpha(theme.palette.primary.main, 0.08) : '#F8FAFC',
            border: '1px solid #E2E8F0',
            px: 2,
            py: 1.6,
          }}
        >
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {reply.text}
          </Typography>
          {reply.attachments?.length ? (
            <Stack spacing={1} sx={{ mt: 1.75 }}>
              {reply.attachments.map((attachment) => {
                const details = getAttachmentDetails(attachment);
                return (
                  <Box
                    key={attachment}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      p: 1.3,
                      borderRadius: 2.5,
                      border: '1px solid #E2E8F0',
                      bgcolor: '#FFFFFF',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: alpha(details.accent, 0.12),
                        color: details.accent,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <InsertDriveFileOutlined fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                        {attachment}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        {details.label} • {details.sizeLabel}
                      </Typography>
                    </Box>
                    <Chip label="Preview" size="small" sx={{ bgcolor: '#F8FAFC' }} />
                  </Box>
                );
              })}
            </Stack>
          ) : null}
          {reply.reactions?.length ? (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
              {reply.reactions.map((reaction) => (
                <Chip key={`${reply.id}-${reaction.emoji}`} label={`${reaction.emoji} ${reaction.count}`} size="small" sx={{ bgcolor: '#FFFFFF' }} />
              ))}
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
