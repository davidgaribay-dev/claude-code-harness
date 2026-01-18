import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { verifyConnection, closeDriver, initializeSchema } from './db/neo4j';
import projectsRoutes from './routes/projects';
import conversationsRoutes from './routes/conversations';
import statsRoutes from './routes/stats';
import ingestRoutes from './routes/ingest';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:8430', 'http://localhost:5173'],
    credentials: true,
  })
);

// Health check
app.get('/health', async (c) => {
  const connected = await verifyConnection();
  return c.json({
    status: connected ? 'healthy' : 'unhealthy',
    neo4j: connected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.route('/api/projects', projectsRoutes);
app.route('/api/conversations', conversationsRoutes);
app.route('/api/stats', statsRoutes);
app.route('/api/ingest', ingestRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = parseInt(process.env.PORT || '8429', 10);

console.log(`Starting Rewind API on port ${port}...`);

// Verify Neo4j connection and initialize schema on startup
verifyConnection().then(async (connected) => {
  if (connected) {
    console.log('✓ Connected to Neo4j');
    // Initialize database schema (constraints & indexes)
    try {
      await initializeSchema();
      console.log('✓ Database schema initialized');
    } catch (error) {
      console.error('⚠ Failed to initialize schema:', error);
    }
  } else {
    console.warn('⚠ Could not connect to Neo4j - some features may not work');
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await closeDriver();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await closeDriver();
  process.exit(0);
});

serve({
  fetch: app.fetch,
  port,
});

console.log(`✓ Server running at http://localhost:${port}`);
