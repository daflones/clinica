-- Setup para o CRM integrado com WhatsApp

-- Tabela de leads
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'novo',
    source TEXT DEFAULT 'whatsapp',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de interações (mensagens e contatos)
CREATE TABLE IF NOT EXISTS public.interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id),
    message TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT DEFAULT 'enviado',
    message_type TEXT DEFAULT 'text',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para leads
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Políticas RLS (Row Level Security)
-- Permitir acesso anônimo para testes iniciais
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura anônima (temporária para desenvolvimento)
CREATE POLICY "Permitir leitura anônima de leads" ON public.leads
    FOR SELECT USING (true);

CREATE POLICY "Permitir leitura anônima de interações" ON public.interactions
    FOR SELECT USING (true);

-- Política para permitir inserção anônima (temporária para desenvolvimento)
CREATE POLICY "Permitir inserção anônima de leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção anônima de interações" ON public.interactions
    FOR INSERT WITH CHECK (true);

-- Política para permitir atualização anônima (temporária para desenvolvimento)
CREATE POLICY "Permitir atualização anônima de leads" ON public.leads
    FOR UPDATE USING (true);

CREATE POLICY "Permitir atualização anônima de interações" ON public.interactions
    FOR UPDATE USING (true);

-- Dados de exemplo
INSERT INTO public.leads (name, phone, email, status)
VALUES ('Cliente Teste', '+5511999999999', 'teste@example.com', 'novo');

INSERT INTO public.interactions (lead_id, message, direction)
VALUES 
    ((SELECT id FROM public.leads WHERE phone = '+5511999999999'), 'Olá, gostaria de mais informações sobre o serviço.', 'inbound'),
    ((SELECT id FROM public.leads WHERE phone = '+5511999999999'), 'Olá! Obrigado pelo seu contato. Como podemos ajudar?', 'outbound');
