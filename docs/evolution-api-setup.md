# Configurau00e7u00e3o da Evolution API

Este guia explica como configurar a Evolution API para integrar o WhatsApp com o n8n e o CRM.

## 1. Instalar a Evolution API no EasyPanel

1. Acesse seu EasyPanel na VPS
2. Adicione um novo aplicativo, busque por "Evolution API" ou use uma imagem Docker personalizada
3. Configure as variu00e1veis de ambiente conforme necessu00e1rio
4. Inicie o aplicativo

## 2. Configurar a API

### Configurau00e7u00e3o inicial

1. Acesse a interface web da Evolution API (normalmente em `http://seu-dominio:porta`)
2. Configure a chave de API geral nas configurau00e7u00f5es (se disponuível)

### Criar uma instu00e2ncia do WhatsApp

1. Use a API para criar uma nova instu00e2ncia do WhatsApp:

```bash
curl --location 'http://seu-servidor:porta/api/instance/create' \
--header 'Content-Type: application/json' \
--header 'apikey: SUA_CHAVE_API' \
--data '{
    "instanceName": "crm-whatsapp",
    "webhook": "http://seu-n8n:porta/webhook/WEBHOOK_ID",
    "webhookByEvents": true,
    "events": [
        "messages.upsert",
        "messages.create",
        "messages.update"
    ]
}'
```

Substitua:
- `seu-servidor:porta` pelo endereço da sua Evolution API
- `SUA_CHAVE_API` pela chave de API configurada
- `seu-n8n:porta/webhook/WEBHOOK_ID` pela URL do webhook configurado no n8n

## 3. Conectar o WhatsApp

1. Depois de criar a instu00e2ncia, use o seguinte endpoint para obter o QR code:

```bash
curl --location 'http://seu-servidor:porta/api/instance/connect/crm-whatsapp' \
--header 'apikey: SUA_CHAVE_API'
```

2. Escaneie o QR code com o WhatsApp do seu celular para conectar a conta

## 4. Configurar webhooks para o n8n

### Configurau00e7u00e3o de webhook

1. Atualize a configurau00e7u00e3o do webhook para apontar para o n8n:

```bash
curl --location --request PUT 'http://seu-servidor:porta/api/instance/webhook/crm-whatsapp' \
--header 'Content-Type: application/json' \
--header 'apikey: SUA_CHAVE_API' \
--data '{
    "url": "http://seu-n8n:porta/webhook/WEBHOOK_ID",
    "events": [
        "messages.upsert",
        "messages.create",
        "messages.update"
    ]
}'
```

## 5. Enviar mensagens via API

Para enviar mensagens a partir do n8n de volta para os clientes no WhatsApp, use o seguinte formato de requisiu00e7u00e3o:

```javascript
// Exemplo de nu00f3 HTTP Request no n8n
{
  "url": "http://seu-servidor:porta/api/messages/send",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "apikey": "SUA_CHAVE_API"
  },
  "body": {
    "number": "{{$node["Anterior"].json["telefone"]}}",
    "options": {
      "delay": 1200
    },
    "textMessage": {
      "text": "Olá! Recebemos sua mensagem e um de nossos atendentes entrará em contato em breve."
    }
  }
}
```

## 6. Verificau00e7u00e3o do status da conexu00e3o

Para verificar o status da conexu00e3o do WhatsApp:

```bash
curl --location 'http://seu-servidor:porta/api/instance/connectionState/crm-whatsapp' \
--header 'apikey: SUA_CHAVE_API'
```

## 7. Testando a integração

1. Envie uma mensagem para o nu00famero de WhatsApp conectado
2. Verifique se a mensagem aparece nos logs da Evolution API
3. Verifique se o webhook do n8n recebe a notificau00e7u00e3o
4. Confirme que o fluxo de trabalho no n8n é executado corretamente
5. Verifique se o lead é criado no Supabase

## Problemas comuns e soluu00e7u00f5es

1. **Webhook nu00e3o recebe eventos**: Verifique se as URLs estu00e3o corretamente configuradas e se a rede permite a comunicau00e7u00e3o entre os servidores

2. **QR code expira rapidamente**: Tente gerar um novo QR code e escaneie rapidamente

3. **WhatsApp desconecta**: Certifique-se de que a api estu00e1 sempre em execuu00e7u00e3o e verifique se o celular com o WhatsApp conectado tem uma conexu00e3o estável com a internet

## Recursos adicionais

- [Documentau00e7u00e3o oficial da Evolution API](https://github.com/evolution-api/evolution-api)
- [Guia de webhooks do WhatsApp](https://github.com/evolution-api/evolution-api)
