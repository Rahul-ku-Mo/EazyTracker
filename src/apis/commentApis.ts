import { apiClient } from './config';

export interface User {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  username?: string;
}

export interface Comment {
  id: number;
  content: string;
  cardId: number;
  userId: string;
  parentCommentId?: number;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedById?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  resolvedBy?: User;
  replies?: Comment[];
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: number;
}

export interface CommentResponse {
  status: number;
  message: string;
  data: Comment | Comment[];
}

// Get all comments for a card
export const fetchComments = async (cardId: number): Promise<Comment[]> => {
  try {
    const response = await apiClient.get(`/comments?cardId=${cardId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Create a new comment or reply
export const createComment = async (cardId: number, data: CreateCommentData): Promise<Comment> => {
  try {
    const response = await apiClient.post(`/comments?cardId=${cardId}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId: number, content: string): Promise<Comment> => {
  try {
    const response = await apiClient.patch(`/comments/${commentId}`, { content });
    return response.data.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    await apiClient.delete(`/comments/${commentId}`);
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Resolve a comment
export const resolveComment = async (commentId: number): Promise<Comment> => {
  try {
    const response = await apiClient.patch(`/comments/${commentId}/resolve`);
    return response.data.data;
  } catch (error) {
    console.error('Error resolving comment:', error);
    throw error;
  }
};

// Unresolve a comment
export const unresolveComment = async (commentId: number): Promise<Comment> => {
  try {
    const response = await apiClient.patch(`/comments/${commentId}/unresolve`);
    return response.data.data;
  } catch (error) {
    console.error('Error unresolving comment:', error);
    throw error;
  }
};

// Get a single comment with replies
export const fetchComment = async (commentId: number): Promise<Comment> => {
  try {
    const response = await apiClient.get(`/comments/${commentId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching comment:', error);
    throw error;
  }
};
