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
import { Save, Loader2, Building2 } from 'lucide-react';
import { mockUsers, mockSavedFiles } from '@/data/mockData';

const V1DocumentManager = () => {
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('RG');
  const [customType, setCustomType] = useState('');
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
        description: `Alterações anteriores foram descartadas.`,
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
      description: `${newFiles.length} arquivo${newFiles.length !== 1 ? 's' : ''} na lista de espera.`,
    });
  }, [selectedType, customType, toast]);

  const handleRemoveFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedUser || stagingFiles.length === 0) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setFiles(prev => prev.map(f => f.isStaging ? { ...f, isStaging: false } : f));
    setIsSubmitting(false);
    
    toast({
      title: "Documentos enviados!",
      description: `${stagingFiles.length} documento${stagingFiles.length !== 1 ? 's' : ''} salvo${stagingFiles.length !== 1 ? 's' : ''}.`,
    });
  }, [selectedUser, stagingFiles, toast]);

  return (
    <div className="space-y-6">
      <Card className={`p-6 transition-all duration-300 ${
        hasPendingChanges ? 'border-staging-border shadow-lg shadow-warning/10' : ''
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

      <Card className={`p-6 transition-opacity duration-300 ${!selectedUser ? 'opacity-50' : ''}`}>
        <DocumentTypeSelector
          selectedType={selectedType}
          customType={customType}
          onTypeChange={setSelectedType}
          onCustomTypeChange={setCustomType}
          disabled={!selectedUser}
        />
      </Card>

      <UnifiedFileManager
        files={files}
        onAddFiles={handleAddFiles}
        onRemoveFile={handleRemoveFile}
        disabled={!selectedUser}
        selectedType={selectedType}
        customType={customType}
      />

      <Button
        onClick={handleSubmit}
        disabled={!selectedUser || stagingFiles.length === 0 || isSubmitting}
        className="w-full h-12 text-base font-medium"
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

export default V1DocumentManager;
