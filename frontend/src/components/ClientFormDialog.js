import React, { useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import FormDialog from './FormDialog';
import useForm from '../hooks/useForm';
import { formatPhone } from '../utils/formValidation';
import clientsService from '../services/clientsService';

/**
 * Componente de dialog para criar ou editar clientes
 */
const ClientFormDialog = ({ open, onClose, client = null, onSuccess, onError }) => {
  // Definir valores iniciais e regras de validau00e7u00e3o
  const initialValues = {
    name: '',
    email: '',
    phone: '',
    status: 'lead',
    notes: '',
    created_at: new Date().toISOString(),
  };

  const validationRules = {
    name: {
      required: true,
      minLength: 3,
      requiredMessage: 'Nome u00e9 obrigatu00f3rio',
      minLengthMessage: 'Nome deve ter pelo menos 3 caracteres',
    },
    email: {
      email: true,
      emailMessage: 'Email invu00e1lido',
    },
    phone: {
      required: true,
      phone: true,
      requiredMessage: 'Telefone u00e9 obrigatu00f3rio',
      phoneMessage: 'Telefone invu00e1lido (Ex: 11 98765-4321)',
    },
  };

  // Funu00e7u00e3o para lidar com o envio do formulu00e1rio
  const handleSubmitForm = async formData => {
    try {
      let result;

      if (client?.id) {
        // Atualizar cliente existente
        result = await clientsService.updateClient(client.id, formData);
      } else {
        // Criar novo cliente
        result = await clientsService.createClient(formData);
      }

      if (result.error) {
        throw result.error;
      }

      // Notificar sucesso
      if (onSuccess) {
        onSuccess(result.data, client?.id ? 'update' : 'create');
      }

      // Resetar formulu00e1rio e fechar dialog
      resetForm();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      if (onError) {
        onError(error.message || 'Erro ao salvar cliente');
      }
    }
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    hasError,
    getError,
    setMultipleValues,
    resetForm,
    submitting,
  } = useForm(initialValues, validationRules, handleSubmitForm);

  // Preencher formulu00e1rio se for ediu00e7u00e3o
  useEffect(() => {
    if (client) {
      setMultipleValues({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        status: client.status || 'lead',
        notes: client.notes || '',
        created_at: client.created_at || new Date().toISOString(),
      });
    }
  }, [client, setMultipleValues]);

  // Formatar telefone enquanto digita
  const handlePhoneChange = e => {
    const formattedPhone = formatPhone(e.target.value);
    const event = {
      target: {
        name: 'phone',
        value: formattedPhone,
      },
    };
    handleChange(event);
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={client?.id ? 'Editar Cliente' : 'Novo Cliente'}
      subtitle={client?.id ? `Editando ${client.name}` : 'Preencha os dados do novo cliente'}
      onSubmit={handleSubmit}
      loading={submitting}
      submitLabel={client?.id ? 'Atualizar' : 'Salvar'}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Nome completo"
            name="name"
            fullWidth
            required
            variant="outlined"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={hasError('name')}
            helperText={getError('name')}
            placeholder="Ex: Maria Silva"
            disabled={submitting}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={hasError('email')}
            helperText={getError('email')}
            placeholder="Ex: maria@exemplo.com"
            disabled={submitting}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            label="Telefone"
            name="phone"
            fullWidth
            required
            variant="outlined"
            value={values.phone}
            onChange={handlePhoneChange}
            onBlur={handleBlur}
            error={hasError('phone')}
            helperText={getError('phone')}
            placeholder="Ex: (11) 98765-4321"
            disabled={submitting}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" disabled={submitting}>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={values.status} label="Status" onChange={handleChange}>
              <MenuItem value="lead">Lead (Prospecto)</MenuItem>
              <MenuItem value="active">Cliente Ativo</MenuItem>
              <MenuItem value="inactive">Cliente Inativo</MenuItem>
            </Select>
            {hasError('status') && <FormHelperText error>{getError('status')}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Observau00e7u00f5es"
            name="notes"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={values.notes}
            onChange={handleChange}
            placeholder="Informau00e7u00f5es adicionais sobre o cliente..."
            disabled={submitting}
          />
        </Grid>
      </Grid>
    </FormDialog>
  );
};

export default ClientFormDialog;
