-- Criação da tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar a performance de buscas
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para a tabela de clientes
CREATE TRIGGER set_clients_timestamp
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Habilitar RLS (Row Level Security) para a tabela de clientes
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para a tabela de clientes
-- Permite leitura para todos os usuários autenticados
CREATE POLICY "Permitir leitura de clientes para usuários autenticados" 
ON public.clients
FOR SELECT 
TO authenticated
USING (true);

-- Permite inserção para usuários autenticados
CREATE POLICY "Permitir inserção de clientes para usuários autenticados" 
ON public.clients
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Permite atualização para usuários autenticados
CREATE POLICY "Permitir atualização de clientes para usuários autenticados" 
ON public.clients
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- Permite exclusão para usuários autenticados
CREATE POLICY "Permitir exclusão de clientes para usuários autenticados" 
ON public.clients
FOR DELETE 
TO authenticated
USING (true);

-- Para desenvolvimento, também podemos permitir operações anônimas (remover em produção)
CREATE POLICY "Permitir todas as operações para anônimos (apenas desenvolvimento)" 
ON public.clients
FOR ALL 
TO anon
USING (true)
WITH CHECK (true);

-- Comentário para documentação
COMMENT ON TABLE public.clients IS 'Armazena informações dos clientes do sistema';

-- Dados de exemplo para testes
INSERT INTO public.clients (name, email, phone, status, notes)
VALUES 
    ('João Silva', 'joao@example.com', '11999998888', 'active', 'Cliente desde 2023'),
    ('Maria Oliveira', 'maria@example.com', '21988887777', 'lead', 'Interessada em procedimentos estéticos'),
    ('Carlos Santos', 'carlos@example.com', '11977776666', 'inactive', 'Último contato em janeiro/2023')
ON CONFLICT DO NOTHING;
