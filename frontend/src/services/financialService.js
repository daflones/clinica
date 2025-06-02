import { supabase } from '../supabaseClient';

const financialService = {
  // Buscar transações financeiras com paginação, ordenação e filtros
  getTransactions: async (
    page = 0,
    limit = 10,
    filters = {},
    sortField = 'date',
    sortOrder = 'desc'
  ) => {
    try {
      // Calcula o número de registros a pular para paginação
      const from = page * limit;

      // Inicia a query
      let query = supabase
        .from('financial_transactions')
        .select('*, patient:patient_id(id, name), appointment:appointment_id(id, scheduled_at)', {
          count: 'exact',
        });

      // Aplica filtros
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }

      if (filters.type) {
        query = query.eq('transaction_type', filters.type);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }

      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }

      // Aplica ordenação e paginação
      const { data, error, count } = await query
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(from, from + limit - 1);

      if (error) throw error;

      return { data, count, error: null };
    } catch (error) {
      console.error('Erro ao buscar transações financeiras:', error.message);
      return { data: null, count: 0, error };
    }
  },

  // Buscar um transação pelo ID
  getTransactionById: async id => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*, patient:patient_id(id, name), appointment:appointment_id(id, scheduled_at)')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar detalhes da transação:', error.message);
      return { data: null, error };
    }
  },

  // Criar uma nova transação
  createTransaction: async transactionData => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([transactionData])
        .select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Erro ao criar transação:', error.message);
      return { data: null, error };
    }
  },

  // Atualizar uma transação existente
  updateTransaction: async (id, transactionData) => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update(transactionData)
        .eq('id', id)
        .select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error.message);
      return { data: null, error };
    }
  },

  // Excluir uma transação
  deleteTransaction: async id => {
    try {
      const { error } = await supabase.from('financial_transactions').delete().eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Erro ao excluir transação:', error.message);
      return { error };
    }
  },

  // Buscar resumo financeiro (dashboard)
  getFinancialSummary: async (startDate, endDate) => {
    try {
      // Receitas
      const { data: revenue, error: revenueError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('transaction_type', 'income')
        .eq('status', 'completed');

      if (revenueError) throw revenueError;

      // Despesas
      const { data: expenses, error: expensesError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('transaction_type', 'expense')
        .eq('status', 'completed');

      if (expensesError) throw expensesError;

      // Pagamentos pendentes
      const { data: pending, error: pendingError } = await supabase
        .from('financial_transactions')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('transaction_type', 'income')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Calcular totais
      const totalRevenue = revenue?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const totalExpenses = expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const totalPending = pending?.reduce((sum, item) => sum + item.amount, 0) || 0;

      return {
        totalRevenue,
        totalExpenses,
        totalPending,
        netProfit: totalRevenue - totalExpenses,
        error: null,
      };
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error.message);
      return {
        totalRevenue: 0,
        totalExpenses: 0,
        totalPending: 0,
        netProfit: 0,
        error,
      };
    }
  },

  // Buscar dados para relatórios financeiros
  getFinancialReports: async (reportType, startDate, endDate) => {
    try {
      // Implementar diferentes tipos de relatórios
      switch (reportType) {
        case 'revenue_by_category':
          const { data: revenueByCategory, error: revenueByCategoryError } = await supabase
            .from('financial_transactions')
            .select('category, amount')
            .gte('date', startDate)
            .lte('date', endDate)
            .eq('transaction_type', 'income');

          if (revenueByCategoryError) throw revenueByCategoryError;

          // Processar dados agrupando por categoria
          const categories = {};
          revenueByCategory?.forEach(item => {
            if (!categories[item.category]) {
              categories[item.category] = 0;
            }
            categories[item.category] += item.amount;
          });

          return { data: categories, error: null };

        case 'expenses_by_month':
          // Implementar lógica para agrupar despesas por mês
          // ...

          return { data: {}, error: null };

        default:
          throw new Error('Tipo de relatório não suportado');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error.message);
      return { data: null, error };
    }
  },
};

export default financialService;
