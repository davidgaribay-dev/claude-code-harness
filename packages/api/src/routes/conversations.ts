import { Hono } from 'hono';
import { getConversation, searchConversations, getRecentConversations, toggleConversationStar } from '../db/queries';

const app = new Hono();

// POST /api/conversations/:id/star - Toggle star status for a conversation
app.post('/:id/star', async (c) => {
  try {
    const sessionId = c.req.param('id');
    const starred = await toggleConversationStar(sessionId);
    return c.json({ starred });
  } catch (error) {
    console.error('Error toggling star:', error);
    return c.json({ error: 'Failed to toggle star' }, 500);
  }
});

// GET /api/conversations/recent - Get recent conversations across all projects
app.get('/recent', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '100', 10);
    const conversations = await getRecentConversations(Math.min(limit, 500));
    return c.json(conversations);
  } catch (error) {
    console.error('Error fetching recent conversations:', error);
    return c.json({ error: 'Failed to fetch recent conversations' }, 500);
  }
});

// GET /api/conversations/search - Search conversations
app.get('/search', async (c) => {
  try {
    const query = c.req.query('q') || '';
    const projectId = c.req.query('projectId');

    if (!query) {
      return c.json([]);
    }

    const conversations = await searchConversations(query, projectId);
    return c.json(conversations);
  } catch (error) {
    console.error('Error searching conversations:', error);
    return c.json({ error: 'Failed to search conversations' }, 500);
  }
});

// GET /api/conversations/:id - Get single conversation with messages
app.get('/:id', async (c) => {
  try {
    const conversation = await getConversation(c.req.param('id'));
    if (!conversation) {
      return c.json({ error: 'Conversation not found' }, 404);
    }
    return c.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return c.json({ error: 'Failed to fetch conversation' }, 500);
  }
});

export default app;
