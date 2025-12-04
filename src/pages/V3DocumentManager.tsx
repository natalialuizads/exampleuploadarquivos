import { useState, useCallback } from 'react';
import { User, DocumentFile, DocumentType } from '@/types/document';
import { DocumentTypeSelector } from '@/components/documents/DocumentTypeSelector';
import { FileListItem } from '@/components/documents/FileListItem';
import { ConfirmDialog } from '@/components/documents/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { Save, Loader2, Upload, FileUp, FolderOpen, ChevronLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { mockUsers, mockSavedFiles } from '@/data/mockData';

const V3DocumentManager = () => {
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType>('RG');
  const [customType, setCustomType] = useState('');
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingUserSwitch, setPendingUserSwitch] = useState<User | null>(null);

  const stagingFiles = files.filter(f => f.isStaging);
  const savedFiles = files.filter(f => !f.isStaging);
  const hasPendingChanges = stagingFiles.length > 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

  const handleBack = () => {
    if (hasPendingChanges) {
      toast({
        title: "Atenção",
        description: "Salve ou descarte os arquivos pendentes antes de voltar.",
        variant: "destructive"
      });
      return;
    }
    setSelectedUser(null);
    setFiles([]);
  };

  const handleAddFiles = useCallback((newFiles: File[]) => {
    if (!selectedUser) return;
    
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
  }, [selectedUser, selectedType, customType, toast]);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleAddFiles,
    disabled: !selectedUser,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  // Split View Layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      {/* Left Panel - User List */}
      <div className={`lg:col-span-4 space-y-3 transition-all duration-300 ${selectedUser ? 'hidden lg:block' : ''}`}>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Selecione um colaborador</h3>
        {mockUsers.map((user) => {
          const isSelected = selectedUser?.id === user.id;
          const docCount = (mockSavedFiles[user.id] || []).length;
          
          return (
            <Card
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className={`
                p-4 cursor-pointer transition-all duration-200 hover:shadow-md
                ${isSelected 
                  ? 'border-accent bg-accent/5 shadow-md ring-2 ring-accent/20' 
                  : 'hover:border-muted-foreground/30'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Avatar className={`h-11 w-11 border-2 ${isSelected ? 'border-accent' : 'border-muted'}`}>
                  <AvatarFallback className={`font-medium ${isSelected ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'}`}>
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.department}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                    {docCount} doc{docCount !== 1 ? 's' : ''}
                  </Badge>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-accent" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Right Panel - Document Manager */}
      <div className={`lg:col-span-8 ${!selectedUser ? 'hidden lg:flex lg:items-center lg:justify-center' : ''}`}>
        {!selectedUser ? (
          <div className="text-center text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Selecione um colaborador</p>
            <p className="text-sm">para gerenciar seus documentos</p>
          </div>
        ) : (
          <Card className={`h-full flex flex-col overflow-hidden ${hasPendingChanges ? 'border-staging-border' : ''}`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center gap-3 ${hasPendingChanges ? 'bg-staging' : 'bg-muted/30'}`}>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Avatar className="h-10 w-10 border-2 border-accent/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(selectedUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
              {hasPendingChanges && (
                <Badge className="bg-warning text-warning-foreground gap-1 animate-pulse-subtle">
                  <AlertTriangle className="w-3 h-3" />
                  {stagingFiles.length} pendente{stagingFiles.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
              <DocumentTypeSelector
                selectedType={selectedType}
                customType={customType}
                onTypeChange={setSelectedType}
                onCustomTypeChange={setCustomType}
              />

              {/* File List */}
              <div className="flex-1 flex flex-col min-h-0 border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-muted/30 border-b flex items-center justify-between">
                  <span className="text-sm font-medium">Documentos ({files.length})</span>
                </div>

                <ScrollArea className="flex-1">
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
                    {files.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Nenhum documento
                      </p>
                    )}
                  </div>
                </ScrollArea>

                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={`
                    p-5 border-t border-dashed cursor-pointer transition-all
                    ${isDragActive ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2.5 rounded-full mb-2 ${isDragActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                      {isDragActive ? <FileUp className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                    </div>
                    <p className="text-sm font-medium">
                      {isDragActive ? 'Solte os arquivos' : 'Arraste arquivos ou clique'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tipo: <span className="font-medium">{selectedType === 'Outros' && customType ? customType : selectedType}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-card">
              <Button
                onClick={handleSubmit}
                disabled={stagingFiles.length === 0 || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Documentos
                    {stagingFiles.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary-foreground/20 text-primary-foreground">
                        {stagingFiles.length}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

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

export default V3DocumentManager;
