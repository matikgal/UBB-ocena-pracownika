

export interface UserData {
  email: string;
  name: string;
  lastName?: string;
  roles?: string[];
  avatar?: string;
}

export interface Article {
  id?: string;
  title: string;
  authors?: string[];
  oa_info?: string;
  pk?: string;
  ww?: string;
  journal?: string;
  year?: number;
  points: number;
  url?: string;
}

export interface UserResponse {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  articles?: Article[];
  createdAt?: Date;
  updatedAt?: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string | null;
}

export interface Question {
  id: string;
  title: string;
  points: number | string;
  tooltip: string[];
  category?: string;
  categoryId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  isLibraryEvaluated?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuestionState {
  checked: boolean;
  value: string;
}