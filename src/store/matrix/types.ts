export interface Matrix {
  id: string;
  name: string;
  questions: Question[];
  userId: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  responseType: 'text' | 'multiple' | 'number' | 'boolean';
}

export interface MatrixState {
  matrices: Matrix[];
  loading: boolean;
  error: string | null;
  fetchMatrices: (userId: string) => Promise<void>;
  saveAnalysis: (matrixId: string, fileId: string, userId: string, name: string, responses: Record<string, string>) => Promise<void>;
}