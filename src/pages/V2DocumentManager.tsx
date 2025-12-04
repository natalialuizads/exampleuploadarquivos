import { useState, useCallback } from 'react';
import { User, DocumentFile, DocumentType } from '@/types/document';
import { DocumentTypeSelector } from '@/components/documents/DocumentTypeSelector';
import { FileListItem } from '@/components/documents/FileListItem';
import { ConfirmDialog } from '@/components/documents/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { Save, Loader2, Upload, FileUp, Users, FolderOpen, X, AlertTriangle } from 'lucide-react';
import { mockUsers, mockSavedFiles } from '@/data/mockData';

const V2DocumentManager = () => {
  const { toast } = useToast();
  
  const [sheetOpen, setSheetOpen] = useState(false);
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

  const handleSelectUser = useCallback((userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return;

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

  const handleCloseSheet = () => {
    if (hasPendingChanges) {
      toast({
        title: "Atenção",
        description: "Você tem arquivos pendentes. Salve ou descarte antes de fechar.",
        variant: "destructive"
      });
      return;
    }
    setSheetOpen(false);
    setSelectedUser(null);
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* User Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mockUsers.map((user) => (
          <Sheet key={user.id} open={sheetOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
            if (open) {
              setSheetOpen(true);
              handleSelectUser(user.id);
            } else {
              handleCloseSheet();
            }
          }}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-auto p-4 flex items-center gap-4 justify-start hover:border-accent hover:bg-accent/5 transition-all"
              >
                <Avatar className="h-12 w-12 border-2 border-muted">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.department}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {(mockSavedFiles[user.id] || []).length} docs
                </Badge>
              </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-lg flex flex-col">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-accent/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {selectedUser ? getInitials(selectedUser.name) : ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-left">{selectedUser?.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedUser?.department}</p>
                  </div>
                  {hasPendingChanges && (
                    <Badge className="ml-auto bg-warning text-warning-foreground gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {stagingFiles.length} pendente{stagingFiles.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </SheetHeader>

              <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
                {/* Document Type Selector */}
                <DocumentTypeSelector
                  selectedType={selectedType}
                  customType={customType}
                  onTypeChange={setSelectedType}
                  onCustomTypeChange={setCustomType}
                  disabled={!selectedUser}
                />

                {/* File List */}
                <div className="flex-1 flex flex-col min-h-0 border rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-muted/30 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Documentos</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {savedFiles.length} salvo{savedFiles.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {stagingFiles.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-warning px-2 py-1">Novos</p>
                          {stagingFiles.map(file => (
                            <FileListItem
                              key={file.id}
                              file={file}
                              onRemove={() => handleRemoveFile(file.id)}
                            />
                          ))}
                        </div>
                      )}
                      {savedFiles.length > 0 && (
                        <div>
                          {stagingFiles.length > 0 && (
                            <p className="text-xs font-medium text-muted-foreground px-2 py-1">Salvos</p>
                          )}
                          {savedFiles.map(file => (
                            <FileListItem key={file.id} file={file} />
                          ))}
                        </div>
                      )}
                      {files.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhum documento ainda
                        </p>
                      )}
                    </div>
                  </ScrollArea>

                  {/* Dropzone */}
                  <div
                    {...getRootProps()}
                    className={`
                      p-4 border-t border-dashed cursor-pointer transition-all
                      ${isDragActive ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center text-center">
                      <div className={`p-2 rounded-full mb-2 ${isDragActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                        {isDragActive ? <FileUp className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                      </div>
                      <p className="text-sm font-medium">
                        {isDragActive ? 'Solte aqui' : 'Arraste ou clique'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tipo: {selectedType === 'Outros' && customType ? customType : selectedType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4">
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
            </SheetContent>
          </Sheet>
        ))}
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

export default V2DocumentManager;
