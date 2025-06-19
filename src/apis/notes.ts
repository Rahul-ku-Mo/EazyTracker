import { api } from '@/lib/api';

export const getNotes = async () => {
  try {
    const response = await api.get("/notes/categories");
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

export const getNote = async (id: string) => {
  try {
    const response = await api.get(`/notes/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching note ${id}:`, error);
    throw error;
  }
};

export const updateNote = async (id: string, data: any) => {
  try {
    const response = await api.put(`/notes/notes/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating note ${id}:`, error);
    throw error;
  }
};
