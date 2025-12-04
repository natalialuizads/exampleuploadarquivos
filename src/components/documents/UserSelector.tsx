import { User } from '@/types/document';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCircle, AlertTriangle } from 'lucide-react';

interface UserSelectorProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  hasPendingChanges: boolean;
  disabled?: boolean;
}

export function UserSelector({ 
  users, 
  selectedUser, 
  onSelectUser, 
  hasPendingChanges,
  disabled 
}: UserSelectorProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-foreground">
          Colaborador
        </label>
        {hasPendingChanges && (
          <Badge variant="outline" className="bg-staging border-staging-border text-warning gap-1 animate-pulse-subtle">
            <AlertTriangle className="w-3 h-3" />
            Alterações pendentes
          </Badge>
        )}
      </div>
      
      <Select
        value={selectedUser?.id || ''}
        onValueChange={(value) => {
          const user = users.find(u => u.id === value);
          if (user) onSelectUser(user);
        }}
        disabled={disabled}
      >
        <SelectTrigger 
          className={`w-full h-14 ${
            hasPendingChanges 
              ? 'border-staging-border bg-staging' 
              : selectedUser 
                ? 'border-accent/30 bg-card' 
                : 'border-dashed'
          }`}
        >
          <SelectValue placeholder="Selecione um colaborador para iniciar">
            {selectedUser && (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border-2 border-accent/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{selectedUser.name}</span>
                  <span className="text-xs text-muted-foreground">{selectedUser.department}</span>
                </div>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id} className="py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedUser && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <UserCircle className="w-4 h-4" />
          Selecione um colaborador para gerenciar seus documentos
        </p>
      )}
    </div>
  );
}
