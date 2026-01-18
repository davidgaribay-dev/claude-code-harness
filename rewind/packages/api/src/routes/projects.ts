import { Hono } from 'hono';
import { getProjects, getProject, getProjectConversations } from '../db/queries';

const app = new Hono();

// GET /api/projects - List all projects
app.get('/', async (c) => {
  try {
    const projects = await getProjects();
    return c.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// GET /api/projects/:id - Get single project
app.get('/:id', async (c) => {
  try {
    const project = await getProject(c.req.param('id'));
    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }
    return c.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// GET /api/projects/:id/conversations - Get project conversations
app.get('/:id/conversations', async (c) => {
  try {
    const conversations = await getProjectConversations(c.req.param('id'));
    return c.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

export default app;
