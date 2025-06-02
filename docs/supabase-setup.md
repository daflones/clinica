# Configurau00e7u00e3o do Supabase

Este guia explica como configurar o Supabase para o CRM integrado.

## 1. Criar uma conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto e anote a URL e a chave anu00f4nima

## 2. Configurar o banco de dados

Acesse o editor SQL do Supabase e execute o seguinte cu00f3digo para criar as tabelas necessu00e1rias:

```sql
-- Criar tabela de leads
CREATE TABLE public.leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT,
    telefone TEXT,
    email TEXT,
    status TEXT DEFAULT 'novo',
    fonte TEXT DEFAULT 'whatsapp',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de interau00e7u00f5es
CREATE TABLE public.interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Criar polu00edticas de acesso para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler leads" 
    ON public.leads FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir leads" 
    ON public.leads FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar leads" 
    ON public.leads FOR UPDATE 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem ler interau00e7u00f5es" 
    ON public.interactions FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir interau00e7u00f5es" 
    ON public.interactions FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
```

## 3. Configurar autenticau00e7u00e3o

1. No painel do Supabase, acesse "Authentication" > "Settings"
2. Habilite o provedor de e-mail/senha
3. Se desejado, configure as notificau00e7u00f5es por e-mail

## 4. Criar um usuario admin

1. Acesse "Authentication" > "Users"
2. Clique em "Invite" e adicione um e-mail para o administrador
3. Depois que o usuário for criado, você poderá usar essas credenciais para fazer login no CRM

## 5. Configurar as variu00e1veis de ambiente no frontend

No diretório do frontend, crie um arquivo `.env.local` com as seguintes variáveis:

```
REACT_APP_SUPABASE_URL=sua_url_do_supabase
REACT_APP_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

Essas informau00e7u00f5es podem ser encontradas no painel do Supabase em "Settings" > "API".
