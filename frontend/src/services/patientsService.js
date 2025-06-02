import { supabase } from '../supabaseClient';

const patientsService = {
  // Buscar todos os pacientes com paginação, ordenação e filtros
  getPatients: async (
    page = 0,
    limit = 10,
    searchTerm = '',
    sortField = 'name',
    sortOrder = 'asc'
  ) => {
    try {
      // Calcula o número de registros a pular para paginação
      const from = page * limit;

      // Inicia a query
      let query = supabase.from('patients').select('*', { count: 'exact' });

      // Aplica o filtro de busca se existir
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      // Aplica ordenação e paginação
      const { data, error, count } = await query
        .order(sortField, { ascending: sortOrder === 'asc' })
        .range(from, from + limit - 1);

      if (error) throw error;

      return { data, count, error: null };
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error.message);
      return { data: null, count: 0, error };
    }
  },

  // Buscar um paciente pelo ID
  getPatientById: async id => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*, medical_records(*), appointments(*)')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar detalhes do paciente:', error.message);
      return { data: null, error };
    }
  },

  // Criar um novo paciente
  createPatient: async patientData => {
    try {
      const { data, error } = await supabase.from('patients').insert([patientData]).select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Erro ao criar paciente:', error.message);
      return { data: null, error };
    }
  },

  // Atualizar um paciente existente
  updatePatient: async (id, patientData) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error.message);
      return { data: null, error };
    }
  },

  // Excluir um paciente
  deletePatient: async id => {
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Erro ao excluir paciente:', error.message);
      return { error };
    }
  },

  // Adicionar um prontuário médico para um paciente
  addMedicalRecord: async (patientId, recordData) => {
    try {
      const record = {
        ...recordData,
        patient_id: patientId,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('medical_records').insert([record]).select();

      if (error) throw error;

      return { data: data[0], error: null };
    } catch (error) {
      console.error('Erro ao adicionar prontuário médico:', error.message);
      return { data: null, error };
    }
  },

  // Buscar prontuários médicos de um paciente
  getMedicalRecords: async patientId => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar prontuários:', error.message);
      return { data: null, error };
    }
  },
};

export default patientsService;
