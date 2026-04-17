import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Menu,
  MenuItem,
  TextField,
  Paper,
} from '@mui/material';
import {
  DragIndicator,
  AddOutlined,
  DeleteOutlined,
  ImageOutlined,
  TextFieldsOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  ContactMailOutlined,
  FormatQuoteOutlined,
} from '@mui/icons-material';

export interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'form' | 'testimonial';
  content: string;
  title?: string;
  order: number;
}

export default function PageBuilder({
  initialBlocks = [],
  onSave,
}: {
  initialBlocks?: ContentBlock[];
  onSave?: (blocks: ContentBlock[]) => void | Promise<void>;
}) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBlocks(items.map((item, index) => ({ ...item, order: index })));
  };

  const addBlock = (type: ContentBlock['type']) => {
    const defaultTitle =
      type === 'text'
        ? 'New Text Block'
        : type === 'image'
          ? 'Image Block'
          : type === 'video'
            ? 'Video Block'
            : type === 'form'
              ? 'Contact form'
              : 'Testimonial';
    const defaultContent =
      type === 'form'
        ? 'name,email,message'
        : type === 'testimonial'
          ? 'Share a short quote from a learner or client.'
          : '';
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type,
      content: defaultContent,
      title: defaultTitle,
      order: blocks.length,
    };
    setBlocks([...blocks, newBlock]);
    setAnchorEl(null);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Page Builder</Typography>
        <Button variant="contained" startIcon={<SaveOutlined />} onClick={() => onSave?.(blocks)}>Save Page</Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="builder-blocks">
          {(provided) => (
            <Box {...provided.droppableProps} ref={provided.innerRef} sx={{ minHeight: 200 }}>
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        mb: 2,
                        boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                        border: '1px solid',
                        borderColor: snapshot.isDragging ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        position: 'relative'
                      }}
                    >
                      <Box
                        {...provided.dragHandleProps}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(0,0,0,0.02)',
                          borderRight: '1px solid',
                          borderColor: 'divider',
                          color: 'text.secondary',
                          cursor: 'grab'
                        }}
                      >
                        <DragIndicator />
                      </Box>
                      <CardContent sx={{ ml: 5, p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            {block.type} Block
                          </Typography>
                          <IconButton size="small" color="error" onClick={() => removeBlock(block.id)}>
                            <DeleteOutlined fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {block.type === 'text' && (
                          <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            variant="outlined"
                            placeholder="Enter text content..."
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          />
                        )}
                        {block.type === 'image' && (
                          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <ImageOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Image URL..."
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </Paper>
                        )}
                        {block.type === 'video' && (
                          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <PlayCircleOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Video/Embed URL..."
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </Paper>
                        )}
                        {block.type === 'form' && (
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <ContactMailOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <TextField
                              fullWidth
                              size="small"
                              label="Form heading"
                              sx={{ mb: 1.5 }}
                              value={block.title ?? ''}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            />
                            <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              size="small"
                              label="Field keys (comma-separated)"
                              helperText="Maps to your site contact handler; e.g. name,email,message"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </Paper>
                        )}
                        {block.type === 'testimonial' && (
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <FormatQuoteOutlined sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                            <TextField
                              fullWidth
                              size="small"
                              label="Attribution"
                              sx={{ mb: 1.5 }}
                              value={block.title ?? ''}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            />
                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              label="Quote"
                              value={block.content}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                          </Paper>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<AddOutlined />}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ borderRadius: 6, borderStyle: 'dashed', borderWidth: 2 }}
                >
                  Add Block
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  <MenuItem onClick={() => addBlock('text')}><TextFieldsOutlined sx={{ mr: 1, fontSize: 20 }} /> Text</MenuItem>
                  <MenuItem onClick={() => addBlock('image')}><ImageOutlined sx={{ mr: 1, fontSize: 20 }} /> Image</MenuItem>
                  <MenuItem onClick={() => addBlock('video')}><PlayCircleOutlined sx={{ mr: 1, fontSize: 20 }} /> Video</MenuItem>
                  <MenuItem onClick={() => addBlock('form')}><ContactMailOutlined sx={{ mr: 1, fontSize: 20 }} /> Contact form</MenuItem>
                  <MenuItem onClick={() => addBlock('testimonial')}><FormatQuoteOutlined sx={{ mr: 1, fontSize: 20 }} /> Testimonial</MenuItem>
                </Menu>
              </Box>
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
