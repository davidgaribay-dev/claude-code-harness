import type { Project, Conversation } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8429';

async function handleResponse<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `${errorMessage}: ${response.statusText}`);
  }
  return response.json();
}

export async function getAllProjects(): Promise<Project[]> {
  const response = await fetch(`${API_URL}/api/projects`);
  return handleResponse<Project[]>(response, 'Failed to fetch projects');
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await fetch(`${API_URL}/api/projects/${projectId}`);
  return handleResponse<Project>(response, 'Failed to fetch project');
}

export async function getConversationsByProjectId(projectId: string): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/api/projects/${projectId}/conversations`);
  return handleResponse<Conversation[]>(response, 'Failed to fetch conversations');
}

export async function getConversationById(conversationId: string): Promise<Conversation> {
  const response = await fetch(`${API_URL}/api/conversations/${conversationId}`);
  return handleResponse<Conversation>(response, 'Failed to fetch conversation');
}

export async function searchConversations(
  query: string,
  projectId?: string
): Promise<Conversation[]> {
  const params = new URLSearchParams({ q: query });
  if (projectId) {
    params.append('projectId', projectId);
  }

  const response = await fetch(`${API_URL}/api/conversations/search?${params}`);
  return handleResponse<Conversation[]>(response, 'Failed to search conversations');
}

export async function getRecentConversations(limit = 100): Promise<(Conversation & { projectId: string; starred?: boolean; customName?: string })[]> {
  const response = await fetch(`${API_URL}/api/conversations/recent?limit=${limit}`);
  return handleResponse<(Conversation & { projectId: string; starred?: boolean; customName?: string })[]>(response, 'Failed to fetch recent conversations');
}

export async function toggleConversationStar(sessionId: string): Promise<{ starred: boolean }> {
  const response = await fetch(`${API_URL}/api/conversations/${sessionId}/star`, {
    method: 'POST',
  });
  return handleResponse<{ starred: boolean }>(response, 'Failed to toggle star');
}

export async function renameConversation(sessionId: string, customName: string | null): Promise<{ customName: string | null }> {
  const response = await fetch(`${API_URL}/api/conversations/${sessionId}/rename`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customName }),
  });
  return handleResponse<{ customName: string | null }>(response, 'Failed to rename conversation');
}

export const apiClient = {
  getAllProjects,
  getProjectById,
  getConversationsByProjectId,
  getConversationById,
  searchConversations,
  getRecentConversations,
  toggleConversationStar,
  renameConversation,
};
