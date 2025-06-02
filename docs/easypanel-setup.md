# Implantau00e7u00e3o no EasyPanel

Este guia explica como implantar todos os componentes do CRM integrado no EasyPanel em sua VPS.

## 1. Configurau00e7u00e3o inicial da VPS

### Requisitos mu00ednimos

- VPS com pelo menos 2GB de RAM e 2 nuu00facleos de CPU
- Ubuntu 20.04 ou superior
- Domiu00ednio configurado para apontar para o IP da VPS

### Instalar o EasyPanel

```bash
ssh root@seu-ip-da-vps

# Instalar o Docker se ainda nu00e3o estiver instalado
apt update
apt install -y docker.io docker-compose

# Instalar o EasyPanel
curl -sSL https://get.easypanel.io | sh
```

Apu00f3s a instalau00e7u00e3o, acesse `http://seu-ip-da-vps:3000` para configurar o EasyPanel.

## 2. Configurar projetos no EasyPanel

### Implantar o Supabase

1. No EasyPanel, clique em "New Project"
2. Selecione "Docker Compose"
3. Nomeie o projeto como "supabase"
4. Cole a configurau00e7u00e3o do Docker Compose do Supabase (disponiu00edvel em `config/supabase-docker-compose.yml`)
5. Configure as variu00e1veis de ambiente conforme necessu00e1rio
6. Clique em "Deploy"

### Implantar o n8n

1. No EasyPanel, clique em "New Project"
2. Procure por "n8n" no catu00e1logo de aplicativos
3. Nomeie o projeto como "n8n"
4. Configure as seguintes variu00e1veis de ambiente:
   - `N8N_PORT`: 5678
   - `N8N_PROTOCOL`: http
   - `N8N_HOST`: seu-dominio.com (ou o IP)
   - `WEBHOOK_URL`: http://seu-dominio.com:5678/
   - `DB_TYPE`: sqlite
5. Configure o port forward: 5678:5678
6. Clique em "Deploy"

### Implantar a Evolution API

1. No EasyPanel, clique em "New Project"
2. Selecione "Docker"
3. Nomeie o projeto como "evolution-api"
4. Use a imagem Docker: `atendai/evolution-api:latest` ou outra imagem oficial
5. Configure as variu00e1veis de ambiente:
   - `API_KEY`: sua-chave-api-secreta
   - `PORT`: 8080
   - `AUTHENTICATION_TYPE`: apikey
6. Configure o port forward: 8080:8080
7. Clique em "Deploy"

### Implantar o Frontend do CRM

1. No EasyPanel, clique em "New Project"
2. Selecione "Static Site"
3. Nomeie o projeto como "crm-frontend"
4. Configure o diretório de build: `/build`
5. Configure o comando de build: 
   ```
   npm install && npm run build
   ```
6. Configure as variáveis de ambiente:
   - `REACT_APP_SUPABASE_URL`: URL do seu Supabase
   - `REACT_APP_SUPABASE_ANON_KEY`: Chave anônima do Supabase
7. Configure o port forward: 80:80
8. Clique em "Deploy"

## 3. Configurar proxy reverso (opcional)

Se você quiser usar um único domínio para todos os serviços, pode configurar um proxy reverso como Nginx ou Traefik.

### Exemplo com Traefik (já integrado ao EasyPanel)

1. No EasyPanel, vá para "Settings" > "Traefik"
2. Configure os domínios para cada serviço:
   - `crm.seu-dominio.com` -> Frontend do CRM
   - `n8n.seu-dominio.com` -> n8n
   - `api.seu-dominio.com` -> Evolution API
   - `supabase.seu-dominio.com` -> Supabase

## 4. Verificação e teste

Depois de implantar todos os componentes:

1. Verifique se todos os serviços estão em execução no painel do EasyPanel
2. Teste o acesso a cada um dos serviços pelos URLs configurados
3. Configure o Supabase conforme o guia `supabase-setup.md`
4. Configure a Evolution API conforme o guia `evolution-api-setup.md`
5. Configure o n8n conforme o guia `n8n-setup.md`
6. Acesse o frontend do CRM e verifique se ele está se conectando corretamente ao Supabase

## 5. Backups e manutenção

### Configurar backups automáticos

1. No EasyPanel, vá para "Settings" > "Backup"
2. Configure backups periódicos dos volumes de dados
3. Opcionalmente, configure o armazenamento externo para os backups (S3, FTP, etc.)

### Monitoramento

1. No EasyPanel, vá para "Settings" > "Monitoring"
2. Ative o monitoramento para acompanhar o uso de recursos
3. Configure alertas para ser notificado em caso de problemas

## Recursos adicionais

- [Documentação oficial do EasyPanel](https://easypanel.io/docs)
- [Guia de segurança para VPS](https://www.digitalocean.com/community/tutorials/recommended-security-measures-for-linux-vps-cloud-servers)
- [Otimização de performance para Docker](https://docs.docker.com/config/containers/resource_constraints/)
