import { supabase } from './supabase';

/**
 * Serviço para operações relacionadas a agendamentos no Supabase
 */
const appointmentsService = {
  /**
   * Busca todos os agendamentos
   * @param {Object} options - Opções de busca
   * @returns {Promise<{data, error}>} Dados dos agendamentos ou erro
   */
  getAllAppointments: async (options = {}) => {
    const { sortBy = 'date', sortOrder = 'desc', limit = 100, filter = {} } = options;

    try {
      let query = supabase
        .from('appointments')
        .select(
          `
          *,
          client:clients!appointments_client_id_fkey (id, name, email, phone)
        `
        )
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .limit(limit);

      // Aplicar filtros se houver
      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.clientId) {
        query = query.eq('client_id', filter.clientId);
      }

      if (filter.dateFrom) {
        query = query.gte('date', filter.dateFrom);
      }

      if (filter.dateTo) {
        query = query.lte('date', filter.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Busca um agendamento por ID
   * @param {string|number} id - ID do agendamento
   * @returns {Promise<{data, error}>} Dados do agendamento ou erro
   */
  getAppointmentById: async id => {
    if (!id) return { data: null, error: new Error('ID do agendamento não fornecido') };

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          *,
          client:clients!appointments_client_id_fkey (id, name, email, phone)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar agendamento ID ${id}:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Cria um novo agendamento
   * @param {Object} appointmentData - Dados do agendamento
   * @returns {Promise<{data, error}>} Dados do agendamento criado ou erro
   */
  createAppointment: async appointmentData => {
    if (!appointmentData)
      return { data: null, error: new Error('Dados do agendamento não fornecidos') };
    if (!appointmentData.client_id)
      return { data: null, error: new Error('ID do cliente não fornecido') };

    try {
      // Verificar se o cliente existe
      const { data: clientExists, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', appointmentData.client_id)
        .single();

      if (clientError || !clientExists) {
        throw new Error(`Cliente com ID ${appointmentData.client_id} não encontrado`);
      }

      // Adicionar timestamp de criação se não existir
      const dataToInsert = {
        ...appointmentData,
        created_at: appointmentData.created_at || new Date().toISOString(),
      };

      const { data, error } = await supabase.from('appointments').insert([dataToInsert]).select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Erro ao criar agendamento:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Atualiza um agendamento existente
   * @param {string|number} id - ID do agendamento
   * @param {Object} appointmentData - Dados atualizados do agendamento
   * @returns {Promise<{data, error}>} Dados do agendamento atualizado ou erro
   */
  updateAppointment: async (id, appointmentData) => {
    if (!id) return { data: null, error: new Error('ID do agendamento não fornecido') };
    if (!appointmentData)
      return { data: null, error: new Error('Dados do agendamento não fornecidos') };

    try {
      // Se estiver atualizando o client_id, verificar se o cliente existe
      if (appointmentData.client_id) {
        const { data: clientExists, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('id', appointmentData.client_id)
          .single();

        if (clientError || !clientExists) {
          throw new Error(`Cliente com ID ${appointmentData.client_id} não encontrado`);
        }
      }

      // Adicionar timestamp de atualização
      const dataToUpdate = {
        ...appointmentData,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('appointments')
        .update(dataToUpdate)
        .eq('id', id)
        .select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error(`Erro ao atualizar agendamento ID ${id}:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Remove um agendamento
   * @param {string|number} id - ID do agendamento
   * @returns {Promise<{success, error}>} Status de sucesso ou erro
   */
  deleteAppointment: async id => {
    if (!id) return { success: false, error: new Error('ID do agendamento não fornecido') };

    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao excluir agendamento ID ${id}:`, error.message);
      return { success: false, error };
    }
  },

  /**
   * Busca agendamentos de um cliente específico
   * @param {string|number} clientId - ID do cliente
   * @returns {Promise<{data, error}>} Dados dos agendamentos ou erro
   */
  getAppointmentsByClientId: async clientId => {
    if (!clientId) return { data: null, error: new Error('ID do cliente não fornecido') };

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar agendamentos do cliente ID ${clientId}:`, error.message);
      return { data: null, error };
    }
  },
};

export default appointmentsService;
