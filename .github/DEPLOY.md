# GitHub Pages Deployment

Este projeto está configurado para deploy automático no GitHub Pages.

## Configuração Inicial

Para habilitar o GitHub Pages no seu repositório:

1. Vá para **Settings** > **Pages** no seu repositório GitHub
2. Em **Source**, selecione **GitHub Actions**
3. Salve as configurações

## Deploy Automático

O deploy acontece automaticamente quando você:
- Faz push para a branch `main`
- Ou executa manualmente o workflow em **Actions** > **Deploy to GitHub Pages** > **Run workflow**

## Workflow

O workflow realiza as seguintes etapas:

1. **Build**: 
   - Faz checkout do código
   - Instala as dependências com `npm ci`
   - Executa o build com `npm run build`
   - Gera os arquivos estáticos na pasta `dist`

2. **Deploy**:
   - Faz upload dos arquivos para GitHub Pages
   - Publica o site

## URL do Site

Após o deploy, seu site estará disponível em:
```
https://<seu-username>.github.io/exampleuploadarquivos/
```

## Desenvolvimento Local

Para testar localmente:
```bash
npm install
npm run dev
```

Para testar o build de produção:
```bash
npm run build
npm run preview
```
