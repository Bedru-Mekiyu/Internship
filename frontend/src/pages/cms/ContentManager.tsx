import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useContent } from '../../hooks/useContent';
import { normalizeApiError } from '../../services/api';
import PageBuilder, { type ContentBlock } from './PageBuilder';

export default function ContentManager() {
  const { create, isCreating } = useContent();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async (blocks: ContentBlock[]) => {
    setSaveError(null);
    setSaveMessage(null);

    try {
      const timestamp = Date.now();
      await create({
        title: `Page Draft ${new Date(timestamp).toLocaleString()}`,
        slug: `page-draft-${timestamp}`,
        type: 'page',
        status: 'draft',
        content: JSON.stringify(blocks),
      });
      setSaveMessage('Page blocks saved successfully.');
    } catch (error) {
      setSaveError(normalizeApiError(error).message || 'Unable to save blocks.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 800 }}>Content Manager</Typography>
      {saveError ? (
        <Typography sx={{ color: 'error.main', fontWeight: 700, mb: 2 }}>{saveError}</Typography>
      ) : null}
      {saveMessage ? (
        <Typography sx={{ color: 'success.main', fontWeight: 700, mb: 2 }}>{saveMessage}</Typography>
      ) : null}
      {isCreating ? (
        <Typography sx={{ color: 'text.secondary', fontWeight: 600, mb: 2 }}>Saving content...</Typography>
      ) : null}
      <PageBuilder onSave={handleSave} />
    </Box>
  );
}
