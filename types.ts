
export type ProcessingStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'error';

export interface ProcessedImage {
  id: string;
  originalUrl: string;
  processedUrl?: string;
  status: ProcessingStatus;
  error?: string;
  name: string;
}

export enum ModelName {
  IMAGE_EDIT = 'gemini-2.5-flash-image'
}
