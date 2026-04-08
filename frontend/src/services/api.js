import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Em produção, mude para a URL do Render

const api = axios.create({
  baseURL: API_URL,
});

// Adiciona o token do Supabase em todas as requisições
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await (await import('../lib/supabase')).supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const taskService = {
  getAll: () => api.get('/tasks'),
  complete: (id) => api.post(`/tasks/${id}/complete`),
  create: (data) => api.post('/tasks', data),
  getRanking: () => api.get('/ranking'),
  getHistory: () => api.get('/tasks/history'),
  getPending: () => api.get('/tasks/pending'),
  approve: (id, decision) => api.post(`/tasks/${id}/approve`, { decision }),
  importJSON: (json) => api.post('/tasks/import', json),
};

export const groupService = {
  create: (name) => api.post('/groups', { name }),
  join: (code) => api.post(`/groups/join/${code}`),
};

export default api;
