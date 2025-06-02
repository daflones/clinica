import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const SupabaseContext = createContext();

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase deve ser usado dentro de um SupabaseProvider');
  }
  return context;
}

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        setUser(session?.user || null);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setLoading(false);
      }
    };

    checkSession();

    // Configurar listener para mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Inscrever-se para atualizações na tabela de leads
    const leadsSubscription = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        payload => {
          fetchLeads();
        }
      )
      .subscribe();

    // Buscar leads iniciais
    fetchLeads();

    // Cleanup function
    return () => {
      leadsSubscription.unsubscribe();
      subscription?.unsubscribe();
    };
  }, []);

  // Função para buscar clientes com tratamento de erro melhorado
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar clientes:', error.message);
        throw error;
      }

      console.log('Clientes carregados com sucesso:', data?.length || 0);
      setLeads(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error.message);
      setLeads([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Login com email e senha
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao fazer login:', error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error.message);
    }
  };

  const value = {
    user,
    loading,
    leads,
    login,
    logout,
    refreshLeads: fetchLeads,
    supabase,
  };

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}
