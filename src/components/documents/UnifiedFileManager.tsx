import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentFile, DocumentType } from '@/types/document';
import { FileListItem } from './FileListItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileUp, FolderOpen, Lock } from 'lucide-react';

interface UnifiedFileManagerProps {
  files: DocumentFile[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  disabled?: boolean;
  selectedType: DocumentType;
  customType: string;
}

export function UnifiedFileManager({
  files,
  onAddFiles,
  onRemoveFile,
  disabled,
  selectedType,
  customType
}: UnifiedFileManagerProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!disabled) {
      onAddFiles(acceptedFiles);
    }
  }, [disabled, onAddFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  const stagingFiles = files.filter(f => f.isStaging);
  const savedFiles = files.filter(f => !f.isStaging);
  const hasFiles = files.length > 0;

  return (
    <div className={`
      rounded-xl border-2 overflow-hidden transition-all duration-300
      ${disabled 
        ? 'border-dashed border-muted bg-muted/30' 
        : stagingFiles.length > 0
          ? 'border-staging-border bg-card shadow-lg shadow-warning/5'
          : 'border-border bg-card shadow-sm'
      }
    `}>
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
            <span className="text-warning font-medium">
              {stagingFiles.length} pendente{stagingFiles.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* File List */}
      <ScrollArea className={hasFiles ? 'h-64' : 'h-0'}>
        <div className="p-2 space-y-1">
          {stagingFiles.map(file => (
            <FileListItem
              key={file.id}
              file={file}
              onRemove={() => onRemoveFile(file.id)}
            />
          ))}
          {savedFiles.map(file => (
            <FileListItem key={file.id} file={file} />
          ))}
        </div>
      </ScrollArea>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          relative p-6 transition-all duration-200 cursor-pointer
          ${hasFiles ? 'border-t border-dashed' : ''}
          ${disabled 
            ? 'cursor-not-allowed opacity-60' 
            : isDragActive 
              ? 'bg-accent/5 border-accent' 
              : 'hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          {disabled ? (
            <>
              <div className="p-3 rounded-full bg-muted mb-3">
                <Lock className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                Selecione um colaborador para fazer upload
              </p>
            </>
          ) : (
            <>
              <div className={`
                p-3 rounded-full mb-3 transition-colors
                ${isDragActive ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}
              `}>
                {isDragActive ? (
                  <FileUp className="w-6 h-6" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-medium">
                {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tipo atual: <span className="font-medium text-foreground">
                  {selectedType === 'Outros' && customType ? customType : selectedType}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, DOC, DOCX, PNG, JPG até 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
