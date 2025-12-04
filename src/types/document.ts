export type DocumentType = 
  | 'RG'
  | 'CPF'
  | 'CNH'
  | 'Contrato'
  | 'Comprovante de Residência'
  | 'Certidão'
  | 'Outros';

export interface DocumentFile {
  id: string;
  name: string;
  type: DocumentType;
  customType?: string;
  size: number;
  uploadedAt: Date;
  isStaging: boolean;
  file?: File;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
}
