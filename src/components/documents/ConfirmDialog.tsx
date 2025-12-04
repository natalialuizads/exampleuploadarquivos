import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  pendingCount: number;
  currentUserName: string;
  targetUserName: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  pendingCount,
  currentUserName,
  targetUserName
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <AlertDialogTitle>Alterações Pendentes</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-2">
            <p>
              Você tem <span className="font-semibold text-warning">{pendingCount} arquivo{pendingCount !== 1 ? 's' : ''}</span> aguardando envio para <span className="font-semibold">{currentUserName}</span>.
            </p>
            <p>
              O que deseja fazer antes de mudar para <span className="font-semibold">{targetUserName}</span>?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="sm:flex-1">
            Voltar e Revisar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="sm:flex-1 bg-destructive hover:bg-destructive/90"
          >
            Descartar e Trocar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
