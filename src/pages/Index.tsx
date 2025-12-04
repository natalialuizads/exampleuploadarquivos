import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileStack, Shield, LayoutList, PanelRight, Columns, ArrowUpFromLine } from 'lucide-react';
import V1DocumentManager from './V1DocumentManager';
import V2DocumentManager from './V2DocumentManager';
import V3DocumentManager from './V3DocumentManager';
import V4DocumentManager from './V4DocumentManager';

const Index = () => {
  const [activeVersion, setActiveVersion] = useState('v1');

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
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeVersion} onValueChange={setActiveVersion} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 w-auto">
              <TabsTrigger value="v1" className="gap-2 px-4">
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">V1 - Cartões</span>
                <span className="sm:hidden">V1</span>
              </TabsTrigger>
              <TabsTrigger value="v2" className="gap-2 px-4">
                <PanelRight className="w-4 h-4" />
                <span className="hidden sm:inline">V2 - Side Sheet</span>
                <span className="sm:hidden">V2</span>
              </TabsTrigger>
              <TabsTrigger value="v3" className="gap-2 px-4">
                <Columns className="w-4 h-4" />
                <span className="hidden sm:inline">V3 - Split View</span>
                <span className="sm:hidden">V3</span>
              </TabsTrigger>
              <TabsTrigger value="v4" className="gap-2 px-4">
                <ArrowUpFromLine className="w-4 h-4" />
                <span className="hidden sm:inline">V4 - Input Topo</span>
                <span className="sm:hidden">V4</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="v1" className="max-w-3xl mx-auto animate-fade-in">
            <V1DocumentManager />
          </TabsContent>

          <TabsContent value="v2" className="max-w-4xl mx-auto animate-fade-in">
            <V2DocumentManager />
          </TabsContent>

          <TabsContent value="v3" className="animate-fade-in">
            <V3DocumentManager />
          </TabsContent>

          <TabsContent value="v4" className="max-w-3xl mx-auto animate-fade-in">
            <V4DocumentManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
