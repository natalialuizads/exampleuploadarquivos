import { DocumentType } from '@/types/document';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FileText, CreditCard, Car, FileSignature, Home, Award, MoreHorizontal } from 'lucide-react';

interface DocumentTypeSelectorProps {
  selectedType: DocumentType;
  customType: string;
  onTypeChange: (type: DocumentType) => void;
  onCustomTypeChange: (value: string) => void;
  disabled?: boolean;
}

const documentTypes: { type: DocumentType; icon: React.ReactNode; label: string }[] = [
  { type: 'RG', icon: <CreditCard className="w-4 h-4" />, label: 'RG - Identidade' },
  { type: 'CPF', icon: <FileText className="w-4 h-4" />, label: 'CPF' },
  { type: 'CNH', icon: <Car className="w-4 h-4" />, label: 'CNH - Habilitação' },
  { type: 'Contrato', icon: <FileSignature className="w-4 h-4" />, label: 'Contrato' },
  { type: 'Comprovante de Residência', icon: <Home className="w-4 h-4" />, label: 'Comprovante de Residência' },
  { type: 'Certidão', icon: <Award className="w-4 h-4" />, label: 'Certidão' },
  { type: 'Outros', icon: <MoreHorizontal className="w-4 h-4" />, label: 'Outros' },
];

export function DocumentTypeSelector({
  selectedType,
  customType,
  onTypeChange,
  onCustomTypeChange,
  disabled
}: DocumentTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Tipo de Documento
      </label>
      
      <div className="flex gap-3">
        <Select
          value={selectedType}
          onValueChange={(value) => onTypeChange(value as DocumentType)}
          disabled={disabled}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {documentTypes.map(({ type, icon, label }) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  {icon}
                  <span>{label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedType === 'Outros' && (
          <Input
            placeholder="Especifique o tipo..."
            value={customType}
            onChange={(e) => onCustomTypeChange(e.target.value)}
            className="flex-1 animate-fade-in"
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
