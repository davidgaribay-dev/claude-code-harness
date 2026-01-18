import { Hono } from 'hono';
import { getStats } from '../db/queries';

const app = new Hono();

// GET /api/stats - Get overall statistics
app.get('/', async (c) => {
  try {
    const stats = await getStats();
    return c.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default app;
