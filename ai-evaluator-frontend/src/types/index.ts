export interface Document {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  uploadedAt: string;
  aiOutput: Record<string, any>;
  isSubmitted: boolean;
  submittedAt?: string;
}

export interface Feedback {
  id: string;
  documentId: string;
  fieldPath: string;
  fieldName: string;
  aiValue: string;
  isCorrect: boolean;
  correctValue?: string;
  confidence?: number;
  comment?: string;
  createdAt: string;
}

export interface FieldValidation {
  fieldPath: string;
  fieldName: string;
  aiValue: string;
  isCorrect: boolean;
  correctValue?: string;
  confidence?: number;
  comment?: string;
}