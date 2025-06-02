# Configurau00e7u00e3o do n8n

Este guia explica como configurar o n8n para processar leads do WhatsApp via Evolution API e armazenu00e1-los no Supabase.

## 1. Instalar o n8n no EasyPanel

1. Acesse seu EasyPanel na VPS
2. Adicione um novo aplicativo, busque por "n8n" nas opções
3. Configure as variáveis de ambiente e portas conforme necessário
4. Inicie o aplicativo

## 2. Configurar o n8n

### Acessando o n8n

1. Acesse a interface web do n8n (normalmente em `http://seu-dominio:porta`)
2. Crie uma conta de administrador para gerenciar o n8n

### Configurando credenciais

Você precisará configurar as seguintes credenciais no n8n:

1. **Supabase**: 
   - Acesse "Settings" > "Credentials" 
   - Adicione uma nova credencial do tipo "Supabase"
   - Insira a URL e a chave API do seu projeto Supabase

2. **Webhook (para Evolution API)**:
   - Não é necessário configurar credenciais específicas, apenas criar um nó de webhook para receber dados

## 3. Criar fluxo de trabalho para processamento de leads

### Fluxo principal de processamento de leads

1. Crie um novo workflow no n8n
2. Adicione um nó de "Webhook" como trigger (este será o endpoint que receberá as mensagens da Evolution API)
3. Configure o webhook para método POST e note a URL gerada

### Processamento de mensagem com IA

1. Adicione um nó "Function" para extrair dados da mensagem do WhatsApp

```javascript
return {
  json: {
    telefone: $input.item.json.from || $input.item.json.sender || '',
    mensagem: $input.item.json.body || $input.item.json.message || '',
    timestamp: $input.item.json.timestamp || new Date().toISOString(),
    // Extrair outros dados relevantes conforme o formato da mensagem
  }
}
```

2. Adicione um nó "HTTP Request" ou "ChatGPT" para processar a mensagem com IA
   - Configure para usar um modelo de linguagem como ChatGPT para analisar a mensagem
   - Extraia informações como nome, interesse, etc.

3. Adicione um nó de decisão ("IF") para verificar se é um lead válido

4. Adicione um nó "Supabase" para inserir o lead no banco de dados
   - Configure para inserir na tabela "leads"
   - Mapeie os campos adequadamente

5. Adicione outro nó "HTTP Request" para enviar uma resposta ao WhatsApp via Evolution API

## 4. Integração com Evolution API

1. Na Evolution API, configure um webhook para encaminhar mensagens para o n8n
2. Use a URL do webhook gerada no n8n como endpoint
3. Certifique-se de que a Evolution API esteja enviando os dados no formato esperado pelo n8n

## 5. Testes e monitoramento

1. Envie uma mensagem de teste pelo WhatsApp
2. Verifique se o webhook no n8n está recebendo os dados
3. Acompanhe a execução do fluxo para verificar se todos os nós estão funcionando corretamente
4. Verifique se o lead foi adicionado ao Supabase

## Exemplo de fluxo completo

```
Webhook (recebe mensagem) → 
Function (extrai dados) → 
ChatGPT (analisa conteúdo) → 
IF (verifica se é lead) → 
Supabase (insere lead) → 
HTTP Request (responde ao cliente)
```

## Recursos adicionais

- [Documentação do n8n](https://docs.n8n.io/)
- [Integrações com IA no n8n](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/)
