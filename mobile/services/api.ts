import axios from 'axios';
import { supabase } from '../lib/supabase';

// IMPORTANTE: No celular, 'localhost' não funciona. 
// Você deve usar o endereço IP da sua máquina no Wi-Fi (ex: 192.168.1.5)
// Ou a URL do Render após fazer o deploy do backend.
const API_URL = 'https://bg-domesticquest.onrender.com'; // URL do Render

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const taskService = {
  getAll: () => api.get('/tasks'),
  complete: (id: string) => api.post(`/tasks/${id}/complete`),
  create: (data: any) => api.post('/tasks', data),
  getRanking: () => api.get('/ranking'),
  getHistory: () => api.get('/tasks/history'),
  getPending: () => api.get('/tasks/pending'),
  approve: (id: string, decision: string) => api.post(`/tasks/${id}/approve`, { decision }),
  importJSON: (json: any) => api.post('/tasks/import', json),
  propose: (data: any) => api.post('/tasks/propose', data),
};

export const groupService = {
  create: (name: string) => api.post('/groups', { name }),
  join: (code: string) => api.post(`/groups/join/${code}`),
};

export default api;
