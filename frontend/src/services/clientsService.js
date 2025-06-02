import { supabase } from './supabase';

/**
 * Serviu00e7o para operau00e7u00f5es relacionadas a clientes no Supabase
 */
const clientsService = {
  /**
   * Busca todos os clientes
   * @param {Object} options - Opu00e7u00f5es de busca
   * @returns {Promise<{data, error}>} Dados dos clientes ou erro
   */
  getAllClients: async (options = {}) => {
    console.log('=== INÍCIO DA BUSCA DE CLIENTES ===');
    console.log('Opções recebidas:', JSON.stringify(options, null, 2));

    try {
      // Verificar se o cliente Supabase está configurado corretamente
      if (!supabase) {
        const error = new Error('Cliente Supabase não está configurado');
        console.error('Erro:', error);
        throw error;
      }

      // Verificar autenticação
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('Sessão do usuário:', session ? 'Autenticado' : 'Não autenticado');

      let query = supabase.from('clients').select('*');

      // Aplicar ordenação
      if (options.sortBy) {
        console.log(`Aplicando ordenação: ${options.sortBy} (${options.sortOrder || 'desc'})`);
        query = query.order(options.sortBy, {
          ascending: options.sortOrder !== 'desc',
          nullsFirst: true,
        });
      } else {
        // Ordenação padrão por data de criação
        console.log('Aplicando ordenação padrão: created_at (desc)');
        query = query.order('created_at', { ascending: false });
      }

      // Aplicar filtros
      if (options.filter) {
        console.log('Aplicando filtros:', options.filter);

        if (options.filter.status && options.filter.status !== 'all') {
          console.log(`Filtrando por status: ${options.filter.status}`);
          query = query.eq('status', options.filter.status);
        }

        if (options.filter.search) {
          const searchTerm = `%${options.filter.search}%`;
          console.log(`Aplicando busca: ${searchTerm}`);
          query = query.or(
            `name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
          );
        }
      }

      console.log('Executando query no Supabase...');
      const { data, error, count } = await query;

      if (error) {
        console.error('Erro na query do Supabase:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      console.log(`✅ Sucesso! Encontrados ${data ? data.length : 0} clientes`);
      console.log('=== FIM DA BUSCA DE CLIENTES (SUCESSO) ===');

      return {
        data: data || [],
        count: count || (data ? data.length : 0),
        error: null,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar clientes:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      console.log('=== FIM DA BUSCA DE CLIENTES (ERRO) ===');

      return {
        data: [],
        count: 0,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Busca um cliente por ID
   * @param {string|number} id - ID do cliente
   * @returns {Promise<{data, error}>} Dados do cliente ou erro
   */
  getClientById: async id => {
    if (!id) return { data: null, error: new Error('ID do cliente não fornecido') };

    try {
      console.log(`Buscando cliente com ID: ${id}`);

      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não encontrado
          console.log(`Cliente com ID ${id} não encontrado`);
          return { data: null, error: null };
        }
        throw error;
      }

      console.log('Dados do cliente encontrado:', data);
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar cliente ID ${id}:`, error);
      return { data: null, error };
    }
  },

  /**
   * Cria um novo cliente
   * @param {Object} clientData - Dados do cliente
   * @returns {Promise<{data, error}>} Dados do cliente criado ou erro
   */
  createClient: async clientData => {
    if (!clientData) return { data: null, error: new Error('Dados do cliente não fornecidos') };

    try {
      // Validação básica
      if (!clientData.name || clientData.name.trim() === '') {
        throw new Error('Nome do cliente é obrigatório');
      }

      // Garantir que o status seja válido
      const validStatuses = ['lead', 'active', 'inactive'];
      if (clientData.status && !validStatuses.includes(clientData.status)) {
        clientData.status = 'lead'; // Valor padrão
      } else if (!clientData.status) {
        clientData.status = 'lead'; // Valor padrão se não houver status
      }

      // Formatar dados
      const formattedData = {
        ...clientData,
        name: clientData.name.trim(),
        email: clientData.email ? clientData.email.trim().toLowerCase() : null,
        phone: clientData.phone ? clientData.phone.replace(/\D/g, '') : null,
        created_at: clientData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Criando cliente com dados:', formattedData);

      const { data, error } = await supabase.from('clients').insert([formattedData]).select('*');

      if (error) {
        console.error('Erro ao criar cliente no Supabase:', error);
        throw error;
      }

      console.log('Cliente criado com sucesso:', data);
      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null,
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Atualiza um cliente existente
   * @param {string|number} id - ID do cliente
   * @param {Object} clientData - Dados atualizados do cliente
   * @returns {Promise<{data, error}>} Dados do cliente atualizado ou erro
   */
  updateClient: async (id, clientData) => {
    if (!id) return { data: null, error: new Error('ID do cliente não fornecido') };
    if (!clientData) return { data: null, error: new Error('Dados do cliente não fornecidos') };

    try {
      // Validação básica
      if (clientData.name && clientData.name.trim() === '') {
        throw new Error('Nome do cliente não pode estar vazio');
      }

      // Garantir que o status seja válido se fornecido
      if (clientData.status) {
        const validStatuses = ['lead', 'active', 'inactive'];
        if (!validStatuses.includes(clientData.status)) {
          throw new Error('Status do cliente inválido');
        }
      }

      // Formatar dados para atualização
      const dataToUpdate = {
        ...clientData,
        updated_at: new Date().toISOString(),
      };

      // Apenas atualizar campos que foram fornecidos
      if (dataToUpdate.name) dataToUpdate.name = dataToUpdate.name.trim();
      if (dataToUpdate.email) dataToUpdate.email = dataToUpdate.email.trim().toLowerCase();
      if (dataToUpdate.phone) dataToUpdate.phone = dataToUpdate.phone.replace(/\D/g, '');

      console.log(`Atualizando cliente ${id} com dados:`, dataToUpdate);

      const { data, error } = await supabase
        .from('clients')
        .update(dataToUpdate)
        .eq('id', id)
        .select('*');

      if (error) {
        console.error('Erro ao atualizar cliente no Supabase:', error);
        throw error;
      }

      console.log('Cliente atualizado com sucesso:', data);
      return {
        data: data && data.length > 0 ? data[0] : null,
        error: null,
      };
    } catch (error) {
      console.error(`Erro ao atualizar cliente ID ${id}:`, error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  /**
   * Remove um cliente
   * @param {string|number} id - ID do cliente
   * @returns {Promise<{success, error}>} Status de sucesso ou erro
   */
  deleteClient: async id => {
    if (!id) return { success: false, error: new Error('ID do cliente nu00e3o fornecido') };

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao excluir cliente ID ${id}:`, error.message);
      return { success: false, error };
    }
  },
};

export default clientsService;
