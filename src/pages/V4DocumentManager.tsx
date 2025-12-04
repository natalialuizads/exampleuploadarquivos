import { useState, useCallback } from 'react';
import { DocumentFile, DocumentType, User } from '@/types/document';
import { UserSelector } from '@/components/documents/UserSelector';
import { DocumentTypeSelector } from '@/components/documents/DocumentTypeSelector';
import { FileListItem } from '@/components/documents/FileListItem';
import { ConfirmDialog } from '@/components/documents/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { mockUsers, mockSavedFiles } from '@/data/mockData';
import { Save, Upload, FileUp, Lock, FolderOpen } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export function V4DocumentManager() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [selectedType, setSelectedType] = useState<DocumentType>('RG');
  const [customType, setCustomType] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const stagingFiles = files.filter(f => f.isStaging);
  const savedFiles = files.filter(f => !f.isStaging);
  const hasPendingChanges = stagingFiles.length > 0;

  const handleUserChange = (user: User) => {
    if (hasPendingChanges && user.id !== selectedUser?.id) {
      setPendingUser(user);
      setShowConfirmDialog(true);
      return;
    }
    loadUserFiles(user);
  };

  const loadUserFiles = (user: User) => {
    setSelectedUser(user);
    const userFiles = mockSavedFiles[user.id] || [];
    setFiles(userFiles);
    setSelectedType('RG');
    setCustomType('');
  };

  const handleConfirmDiscard = () => {
    if (pendingUser) {
      loadUserFiles(pendingUser);
    }
    setShowConfirmDialog(false);
    setPendingUser(null);
  };

  const handleCancelDialog = () => {
    setShowConfirmDialog(false);
    setPendingUser(null);
  };

  const handleAddFiles = (newFiles: File[]) => {
    const documentFiles: DocumentFile[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: selectedType,
      customType: selectedType === 'Outros' ? customType : undefined,
      size: file.size,
      uploadedAt: new Date(),
      userId: selectedUser!.id,
      isStaging: true
    }));
    setFiles(prev => [...documentFiles, ...prev]);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = () => {
    setFiles(prev => prev.map(f => ({ ...f, isStaging: false })));
    toast({
      title: "Documentos enviados",
      description: `${stagingFiles.length} arquivo(s) salvo(s) com sucesso.`,
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (selectedUser) {
      const documentFiles: DocumentFile[] = acceptedFiles.map(file => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: selectedType,
        customType: selectedType === 'Outros' ? customType : undefined,
        size: file.size,
        uploadedAt: new Date(),
        userId: selectedUser.id,
        isStaging: true
      }));
      setFiles(prev => [...documentFiles, ...prev]);
    }
  }, [selectedUser, selectedType, customType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !selectedUser,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">V4 - Input em Cima</h2>
        <p className="text-muted-foreground text-sm">Área de upload primeiro, lista de arquivos abaixo</p>
      </div>

      {/* User Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <UserSelector
          users={mockUsers}
          selectedUser={selectedUser}
          onSelectUser={handleUserChange}
          hasPendingChanges={hasPendingChanges}
        />
        <DocumentTypeSelector
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          customType={customType}
          onCustomTypeChange={setCustomType}
          disabled={!selectedUser}
        />
      </div>

      {/* Unified Component - Input First, List Below */}
      <div className={`
        rounded-xl border-2 overflow-hidden transition-all duration-300
        ${!selectedUser 
          ? 'border-dashed border-muted bg-muted/30' 
          : stagingFiles.length > 0
            ? 'border-staging-border bg-card shadow-lg shadow-warning/5'
            : 'border-border bg-card shadow-sm'
        }
      `}>
        {/* Dropzone First */}
        <div
          {...getRootProps()}
          className={`
            relative p-8 transition-all duration-200 cursor-pointer
            ${!selectedUser 
              ? 'cursor-not-allowed opacity-60' 
              : isDragActive 
                ? 'bg-accent/10 border-b-2 border-accent' 
                : 'hover:bg-muted/50 border-b'
            }
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center text-center">
            {!selectedUser ? (
              <>
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-muted-foreground">
                  Selecione um colaborador para fazer upload
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Escolha um usuário no seletor acima
                </p>
              </>
            ) : (
              <>
                <div className={`
                  p-4 rounded-full mb-4 transition-all duration-300
                  ${isDragActive 
                    ? 'bg-accent/20 text-accent scale-110' 
                    : 'bg-primary/10 text-primary'
                  }
                `}>
                  {isDragActive ? (
                    <FileUp className="w-8 h-8" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>
                <p className="text-base font-medium">
                  {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tipo atual: <span className="font-semibold text-primary">
                    {selectedType === 'Outros' && customType ? customType : selectedType}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  PDF, DOC, DOCX, PNG, JPG até 10MB
                </p>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className={`
          px-4 py-3 border-b flex items-center justify-between
          ${stagingFiles.length > 0 ? 'bg-staging border-staging-border' : 'bg-muted/30'}
        `}>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Documentos do Colaborador
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {savedFiles.length > 0 && (
              <span>{savedFiles.length} salvo{savedFiles.length !== 1 ? 's' : ''}</span>
            )}
            {stagingFiles.length > 0 && (
              <span className="text-warning font-medium animate-pulse">
                {stagingFiles.length} pendente{stagingFiles.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* File List Below */}
        <ScrollArea className={hasFiles ? 'h-64' : 'h-24'}>
          <div className="p-2 space-y-1">
            {stagingFiles.map(file => (
              <FileListItem
                key={file.id}
                file={file}
                onRemove={() => handleRemoveFile(file.id)}
              />
            ))}
            {savedFiles.map(file => (
              <FileListItem key={file.id} file={file} />
            ))}
            {!hasFiles && selectedUser && (
              <div className="flex items-center justify-center h-16 text-sm text-muted-foreground">
                Nenhum documento ainda
              </div>
            )}
            {!selectedUser && (
              <div className="flex items-center justify-center h-16 text-sm text-muted-foreground">
                Selecione um colaborador
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!hasPendingChanges}
        className="w-full"
        size="lg"
      >
        <Save className="w-4 h-4 mr-2" />
        Salvar Documentos ({stagingFiles.length})
      </Button>

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDialog}
        pendingCount={stagingFiles.length}
        currentUserName={selectedUser?.name || ''}
        targetUserName={pendingUser?.name || ''}
      />
    </div>
  );
}

export default V4DocumentManager;