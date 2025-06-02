# CRM Integrado

Sistema de gerenciamento de clientes e agendamentos com integração ao WhatsApp, n8n e Supabase.

## Pré-requisitos

- Node.js (versão 16 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Conta no Supabase
- Conta no serviço de mensageria (opcional)

## Configuração do Ambiente

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   - Crie um arquivo `.env` na raiz do projeto
   - Copie as variáveis do arquivo `.env.example` e preencha com suas credenciais

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   ```
   O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

## Scripts Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria uma versão otimizada para produção
- `npm test`: Executa os testes
- `npm run format`: Formata o código usando Prettier
- `npm run lint`: Verifica problemas de linting
- `npm run lint:fix`: Corrige problemas de linting automaticamente

## Estrutura do Projeto

- `/public`: Arquivos estáticos
- `/src`: Código-fonte do aplicativo
  - `/components`: Componentes reutilizáveis
  - `/contexts`: Contextos do React
  - `/pages`: Páginas do aplicativo
  - `/services`: Serviços e integrações
  - `/styles`: Estilos globais
  - `/utils`: Utilitários e funções auxiliares

## Configuração do Git Hooks

O projeto utiliza Husky para executar verificações antes de cada commit. As seguintes verificações são realizadas:

- Formatação do código com Prettier
- Verificação de erros com ESLint

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
