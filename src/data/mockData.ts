import { User, DocumentFile } from '@/types/document';

export const mockUsers: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@empresa.com', department: 'Recursos Humanos' },
  { id: '2', name: 'Carlos Santos', email: 'carlos.santos@empresa.com', department: 'Financeiro' },
  { id: '3', name: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', department: 'Comercial' },
  { id: '4', name: 'João Pereira', email: 'joao.pereira@empresa.com', department: 'TI' },
];

export const mockSavedFiles: Record<string, DocumentFile[]> = {
  '1': [
    { id: 'saved-1', name: 'RG_Ana_Silva.pdf', type: 'RG', size: 1024000, uploadedAt: new Date('2024-01-15'), isStaging: false },
    { id: 'saved-2', name: 'CPF_Ana_Silva.pdf', type: 'CPF', size: 512000, uploadedAt: new Date('2024-01-15'), isStaging: false },
  ],
  '2': [
    { id: 'saved-3', name: 'Contrato_Carlos.pdf', type: 'Contrato', size: 2048000, uploadedAt: new Date('2024-02-20'), isStaging: false },
  ],
  '3': [],
  '4': [
    { id: 'saved-4', name: 'CNH_Joao.pdf', type: 'CNH', size: 768000, uploadedAt: new Date('2024-03-10'), isStaging: false },
  ],
};
