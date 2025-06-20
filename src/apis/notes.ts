import { api } from '@/lib/api';
import { Note, Category } from '@/interfaces/notes';

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
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching note ${id}:`, error);
    throw error;
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/notes/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

const createCategory = async (data: { name: string; hoverColor?: string }): Promise<Category> => {
  try {
    const response = await api.post('/notes/categories', data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await api.delete(`/notes/categories/${categoryId}`);
  } catch (error) {
    console.error(`Error deleting category ${categoryId}:`, error);
    throw error;
  }
};

const createNote = async (data: { categoryId: string; title: string; content?: string; icon?: string; iconColor?: string; isPublic?: boolean }): Promise<Note> => {
  try {
    const response = await api.post('/notes', data);
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

const updateNote = async (data: { id: string; isPublic?: boolean; title?: string; content?: string }): Promise<Note> => {
  try {
    const response = await api.put(`/notes/${data.id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating note ${data.id}:`, error);
    throw error;
  }
};

const deleteNote = async (noteId: string): Promise<void> => {
  try {
    await api.delete(`/notes/${noteId}`);
  } catch (error) {
    console.error(`Error deleting note ${noteId}:`, error);
    throw error;
  }
};

export { fetchCategories, createCategory, deleteCategory, createNote, updateNote, deleteNote };