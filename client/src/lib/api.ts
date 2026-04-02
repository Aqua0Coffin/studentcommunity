import { createClient } from './supabase';

// Re-export the supabase client as the default API interface.
// Use this throughout the app instead of the old axios-based api.
export const supabase = createClient();

// Temporary mock layer to prevent legacy axios calls from crashing dashboard pages dont forget to remove em later adithya san
const api = {
  get: async (url: string) => ({ data: [] }),
  post: async (url: string, body?: any) => ({ data: {} }),
  patch: async (url: string, body?: any) => ({ data: {} }),
  put: async (url: string, body?: any) => ({ data: {} }),
  delete: async (url: string) => ({ data: {} }),
};

export default api;
