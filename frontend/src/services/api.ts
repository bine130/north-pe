import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Keyword {
  id?: number;
  keyword: string;
  topic_id?: number;
}

export interface Mnemonic {
  id?: number;
  mnemonic: string;
  full_text: string;
  topic_id?: number;
}

export interface ExamHistory {
  id?: number;
  exam_round: string;
  question_number: string;
  score?: number;
  topic_id?: number;
}

export interface Topic {
  id?: number;
  title: string;
  category?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  keywords?: Keyword[];
  mnemonics?: Mnemonic[];
  exam_histories?: ExamHistory[];
}

export interface TopicCreate {
  title: string;
  category?: string;
  content?: string;
  keywords?: string[];
  mnemonics?: Mnemonic[];
}

export interface TopicUpdate {
  title?: string;
  category?: string;
  content?: string;
  keywords?: string[];
  mnemonics?: Mnemonic[];
  change_reason?: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  parent_id?: number;
  created_at?: string;
  children?: Category[];
}

export interface CategoryCreate {
  name: string;
  description?: string;
  parent_id?: number;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  parent_id?: number;
}

export interface Template {
  id?: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateCreate {
  name: string;
  description?: string;
  content: string;
  category?: string;
}

export interface TemplateUpdate {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
}

export const topicApi = {
  getAll: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.get<Topic[]>('/topics', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Topic>(`/topics/${id}`);
    return response.data;
  },

  create: async (topic: TopicCreate) => {
    const response = await api.post<Topic>('/topics', topic);
    return response.data;
  },

  update: async (id: number, topic: TopicUpdate) => {
    const response = await api.put<Topic>(`/topics/${id}`, topic);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/topics/${id}`);
  },

  search: async (query: string, searchType: string = 'all') => {
    const response = await api.get<Topic[]>('/topics/search', {
      params: { q: query, search_type: searchType },
    });
    return response.data;
  },

  getVersions: async (id: number) => {
    const response = await api.get(`/topics/${id}/versions`);
    return response.data;
  },
};

export const categoryApi = {
  getAll: async () => {
    const response = await api.get<Category[]>('/categories/');
    return response.data;
  },

  getTree: async () => {
    const response = await api.get<Category[]>('/categories/tree');
    return response.data;
  },

  create: async (category: CategoryCreate) => {
    const response = await api.post<Category>('/categories/', category);
    return response.data;
  },

  update: async (id: number, category: CategoryUpdate) => {
    const response = await api.put<Category>(`/categories/${id}`, category);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/categories/${id}`);
  },
};

export const templateApi = {
  getAll: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.get<Template[]>('/templates/', { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Template>(`/templates/${id}`);
    return response.data;
  },

  create: async (template: TemplateCreate) => {
    const response = await api.post<Template>('/templates/', template);
    return response.data;
  },

  update: async (id: number, template: TemplateUpdate) => {
    const response = await api.put<Template>(`/templates/${id}`, template);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/templates/${id}`);
  },
};

export default api;