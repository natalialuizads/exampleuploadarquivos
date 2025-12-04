import { useState, useCallback } from 'react';
import { User, DocumentFile, DocumentType } from '@/types/document';
import { UserSelector } from '@/components/documents/UserSelector';
import { DocumentTypeSelector } from '@/components/documents/DocumentTypeSelector';
import { UnifiedFileManager } from '@/components/documents/UnifiedFileManager';
import { ConfirmDialog } from '@/components/documents/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileStack, Save, Loader2, Shield, Building2 } from 'lucide-react';

// Mock users data
const mockUsers: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@empresa.com', department: 'Recursos Humanos' },
  { id: '2', name: 'Carlos Santos', email: 'carlos.santos@empresa.com', department: 'Financeiro' },
  { id: '3', name: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', department: 'Comercial' },
  { id: '4', name: 'João Pereira', email: 'joao.pereira@empresa.com', department: 'TI' },
];

// Mock saved files per user
const mockSavedFiles: Record<string, DocumentFile[]> = {
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

const Index = () => {
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('RG');
  const [customType, setCustomType] = useState('');
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingUserSwitch, setPendingUserSwitch] = useState<User | null>(null);

  const stagingFiles = files.filter(f => f.isStaging);
  const hasPendingChanges = stagingFiles.length > 0;

  const handleSelectUser = useCallback((user: User) => {
    if (hasPendingChanges && selectedUser && user.id !== selectedUser.id) {
      setPendingUserSwitch(user);
      setConfirmDialogOpen(true);
      return;
    }

    setSelectedUser(user);
    setFiles(mockSavedFiles[user.id] || []);
    setSelectedType('RG');
    setCustomType('');
  }, [hasPendingChanges, selectedUser]);

  const handleConfirmSwitch = useCallback(() => {
    if (pendingUserSwitch) {
      setSelectedUser(pendingUserSwitch);
      setFiles(mockSavedFiles[pendingUserSwitch.id] || []);
      setSelectedType('RG');
      setCustomType('');
      setPendingUserSwitch(null);
      setConfirmDialogOpen(false);
      
      toast({
        title: "Usuário alterado",
        description: `Alterações anteriores foram descartadas. Agora editando ${pendingUserSwitch.name}.`,
      });
    }
  }, [pendingUserSwitch, toast]);

  const handleCancelSwitch = useCallback(() => {
    setPendingUserSwitch(null);
    setConfirmDialogOpen(false);
  }, []);

  const handleAddFiles = useCallback((newFiles: File[]) => {
    const documentFiles: DocumentFile[] = newFiles.map(file => ({
      id: `staging-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: selectedType,
      customType: selectedType === 'Outros' ? customType : undefined,
      size: file.size,
      uploadedAt: new Date(),
      isStaging: true,
      file,
    }));

    setFiles(prev => [...documentFiles, ...prev]);
    
    toast({
      title: "Arquivos adicionados",
      description: `${newFiles.length} arquivo${newFiles.length !== 1 ? 's' : ''} adicionado${newFiles.length !== 1 ? 's' : ''} à lista de espera.`,
    });
  }, [selectedType, customType, toast]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedUser || stagingFiles.length === 0) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Move staging files to saved
    setFiles(prev => prev.map(f => f.isStaging ? { ...f, isStaging: false } : f));
    
    setIsSubmitting(false);
    
    toast({
      title: "Documentos enviados!",
      description: `${stagingFiles.length} documento${stagingFiles.length !== 1 ? 's' : ''} salvo${stagingFiles.length !== 1 ? 's' : ''} para ${selectedUser.name}.`,
    });
  }, [selectedUser, stagingFiles, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <FileStack className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Gestor de Documentos</h1>
                <p className="text-sm text-muted-foreground">Gerenciamento centralizado de arquivos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Administrador</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="space-y-6">
          {/* User Context Card */}
          <Card className={`p-6 transition-all duration-300 ${
            hasPendingChanges 
              ? 'border-staging-border shadow-lg shadow-warning/10' 
              : 'border-border'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Contexto do Usuário</span>
              {hasPendingChanges && (
                <Badge className="ml-auto bg-warning text-warning-foreground">
                  {stagingFiles.length} pendente{stagingFiles.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            <UserSelector
              users={mockUsers}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
              hasPendingChanges={hasPendingChanges}
            />
          </Card>

          {/* Document Controls */}
          <Card className={`p-6 transition-opacity duration-300 ${!selectedUser ? 'opacity-50' : ''}`}>
            <DocumentTypeSelector
              selectedType={selectedType}
              customType={customType}
              onTypeChange={setSelectedType}
              onCustomTypeChange={setCustomType}
              disabled={!selectedUser}
            />
          </Card>

          {/* Unified File Manager */}
          <UnifiedFileManager
            files={files}
            onAddFiles={handleAddFiles}
            onRemoveFile={handleRemoveFile}
            disabled={!selectedUser}
            selectedType={selectedType}
            customType={customType}
          />

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!selectedUser || stagingFiles.length === 0 || isSubmitting}
            className="w-full h-12 text-base font-medium bg-primary hover:bg-primary/90 disabled:opacity-50"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Documentos de {selectedUser?.name || 'Colaborador'}
                {stagingFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-primary-foreground/20 text-primary-foreground">
                    {stagingFiles.length}
                  </Badge>
                )}
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
        pendingCount={stagingFiles.length}
        currentUserName={selectedUser?.name || ''}
        targetUserName={pendingUserSwitch?.name || ''}
      />
    </div>
  );
};

export default Index;
