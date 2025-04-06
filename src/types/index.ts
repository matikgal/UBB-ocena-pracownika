// Common types used across the application

export interface UserData {
  email: string;
  name: string;
  lastName?: string;
  roles?: string[];
  avatar?: string;
}

export interface Article {
  title: string;
  journal?: string;
  year?: number;
  points: number;
}

export interface UserResponse {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  articles?: Article[];
}

export interface Question {
  id: string;
  title: string;
  points: number | string;
  tooltip: string[];
  category?: string;
}