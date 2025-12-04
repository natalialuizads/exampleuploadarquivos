import { DocumentFile } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FileListItemProps {
  file: DocumentFile;
  onRemove?: () => void;
}

export function FileListItem({ file, onRemove }: FileListItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeLabel = () => {
    if (file.type === 'Outros' && file.customType) {
      return file.customType;
    }
    return file.type;
  };

  return (
    <div 
      className={`
        group flex items-center gap-3 p-3 rounded-lg transition-all duration-200
        ${file.isStaging 
          ? 'bg-staging border border-staging-border animate-slide-up' 
          : 'bg-card hover:bg-secondary/50 border border-transparent'
        }
      `}
    >
      <div className={`
        p-2 rounded-lg transition-colors
        ${file.isStaging ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}
      `}>
        <FileText className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{file.name}</p>
          {file.isStaging ? (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs shrink-0">
              <Clock className="w-3 h-3 mr-1" />
              Novo
            </Badge>
          ) : (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="secondary" className="text-xs font-normal">
            {getTypeLabel()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
          <span className="text-xs text-muted-foreground">
            • {format(file.uploadedAt, "dd MMM yyyy, HH:mm", { locale: ptBR })}
          </span>
        </div>
      </div>

      {file.isStaging && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
