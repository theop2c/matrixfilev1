export interface Matrix {
  id: string;
  name: string;
  questions: Question[];
  userId: string;
  createdAt: Date | string; // Allow both Date and string for flexibility
}

export interface Question {
  id: string;
  text: string;
  responseType: 'text' | 'multiple' | 'number' | 'boolean';
}

export interface MatrixResponse {
  questionId: string;
  response: string;
}

export interface MatrixAnalysis {
  id: string;
  matrixId: string;
  fileId: string;
  userId: string;
  name: string;
  responses: MatrixResponse[];
  createdAt: Date;
}