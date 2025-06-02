import { createClient } from '@supabase/supabase-js';

// Essas variáveis devem ser substituídas pelas suas credenciais do Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example-key';

// Cria o cliente do Supabase
// Usando try/catch para evitar erros de URL inválida
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error('Erro ao criar cliente Supabase:', error);
  // Cria um cliente mock para evitar quebrar a aplicação
  supabase = {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      order: () => ({ data: [], error: null }),
      single: () => ({ data: null, error: null }),
    }),
    auth: {
      signIn: () => Promise.resolve({ user: null, error: null }),
      signUp: () => Promise.resolve({ user: null, error: null }),
      signOut: () => Promise.resolve(),
      onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
      getSession: () => ({ user: null }),
    },
    channel: () => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => {},
        }),
      }),
    }),
  };
}

// Exportar o cliente Supabase
export { supabase };

// Funções para interagir com o Supabase

// Buscar todos os leads
export const getLeads = async () => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar leads:', error);
    throw error;
  }

  return data;
};

// Buscar um lead específico por ID
export const getLeadById = async id => {
  const { data, error } = await supabase.from('leads').select('*').eq('id', id).single();

  if (error) {
    console.error(`Erro ao buscar lead com ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Atualizar um lead
export const updateLead = async (id, updates) => {
  const { data, error } = await supabase.from('leads').update(updates).eq('id', id);

  if (error) {
    console.error(`Erro ao atualizar lead com ID ${id}:`, error);
    throw error;
  }

  return data;
};

// Buscar histórico de interações de um lead
export const getLeadInteractions = async leadId => {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Erro ao buscar interações para o lead ${leadId}:`, error);
    throw error;
  }

  return data;
};

// Adicionar uma nova interação
export const addInteraction = async interaction => {
  const { data, error } = await supabase.from('interactions').insert([interaction]);

  if (error) {
    console.error('Erro ao adicionar interação:', error);
    throw error;
  }

  return data;
};
