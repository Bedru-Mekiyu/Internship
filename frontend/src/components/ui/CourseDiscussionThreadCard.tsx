import { Avatar, Box, Stack, Typography } from '@mui/material';

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
        border: '1px solid',
        borderColor: active ? 'primary.main' : 'divider',
        bgcolor: active ? 'background.default' : 'background.paper',
        alignItems: 'flex-start',
        gap: 1.25,
        px: 1.5,
        py: 1.3,
        transition: 'border-color 160ms ease',
        display: 'flex',
        '&:hover': {
          borderColor: 'primary.main',
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
          {thread.unread > 0 ? (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {thread.unread} unread
            </Typography>
          ) : null}
        </Box>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }} noWrap>
          {thread.summary}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {thread.category}
          </Typography>
          {thread.live ? (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Live
            </Typography>
          ) : null}
          {thread.pinned ? (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Pinned
            </Typography>
          ) : null}
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {thread.replies} replies
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function ReplyBubble({ reply }: { reply: Reply }) {
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
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {reply.role}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {hasUnreadMarker ? 'Unread' : 'Read'}
              </Typography>
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
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
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
                return (
                  <Box
                    key={attachment}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      p: 1.3,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>
                        {attachment}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                        Attachment
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          ) : null}
          {reply.reactions?.length ? (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
              {reply.reactions.map((reaction) => (
                <Typography
                  key={`${reply.id}-${reaction.emoji}`}
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  {reaction.emoji} {reaction.count}
                </Typography>
              ))}
            </Stack>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
