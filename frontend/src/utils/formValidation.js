/**
 * Utilitu00e1rios de validau00e7u00e3o de formulu00e1rios
 */

// Validau00e7u00e3o de email
export const isValidEmail = email => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validau00e7u00e3o de telefone brasileiro
export const isValidPhone = phone => {
  if (!phone) return false;
  // Remove caracteres nu00e3o numu00e9ricos
  const numericPhone = phone.replace(/\D/g, '');
  // Verifica se tem entre 10 e 11 du00edgitos (com ou sem DDD)
  return numericPhone.length >= 10 && numericPhone.length <= 11;
};

// Formatau00e7u00e3o de telefone
export const formatPhone = phone => {
  if (!phone) return '';
  const numericPhone = phone.replace(/\D/g, '');

  if (numericPhone.length === 11) {
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 7)}-${numericPhone.slice(7)}`;
  } else if (numericPhone.length === 10) {
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 6)}-${numericPhone.slice(6)}`;
  }

  return phone; // Retorna o original se nu00e3o reconhecer o padru00e3o
};

// Validau00e7u00e3o genu00e9rica de formulu00e1rio
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;

  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];

    // Verificar campo obrigatu00f3rio
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = fieldRules.requiredMessage || 'Este campo u00e9 obrigatu00f3rio';
      isValid = false;
      return;
    }

    // Skip other validations if field is empty and not required
    if (!value && !fieldRules.required) return;

    // Verificar email
    if (fieldRules.email && value && !isValidEmail(value)) {
      errors[field] = fieldRules.emailMessage || 'Email invu00e1lido';
      isValid = false;
      return;
    }

    // Verificar telefone
    if (fieldRules.phone && value && !isValidPhone(value)) {
      errors[field] = fieldRules.phoneMessage || 'Telefone invu00e1lido';
      isValid = false;
      return;
    }

    // Verificar tamanho mu00ednimo
    if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      errors[field] =
        fieldRules.minLengthMessage || `Deve ter pelo menos ${fieldRules.minLength} caracteres`;
      isValid = false;
      return;
    }

    // Verificar tamanho mu00e1ximo
    if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      errors[field] =
        fieldRules.maxLengthMessage || `Deve ter no mu00e1ximo ${fieldRules.maxLength} caracteres`;
      isValid = false;
      return;
    }

    // Verificar valor mu00ednimo (para campos numu00e9ricos)
    if (fieldRules.min !== undefined && value && Number(value) < fieldRules.min) {
      errors[field] = fieldRules.minMessage || `O valor mu00ednimo u00e9 ${fieldRules.min}`;
      isValid = false;
      return;
    }

    // Verificar valor mu00e1ximo (para campos numu00e9ricos)
    if (fieldRules.max !== undefined && value && Number(value) > fieldRules.max) {
      errors[field] = fieldRules.maxMessage || `O valor mu00e1ximo u00e9 ${fieldRules.max}`;
      isValid = false;
      return;
    }

    // Verificar padru00e3o personalizado
    if (fieldRules.pattern && value && !new RegExp(fieldRules.pattern).test(value)) {
      errors[field] = fieldRules.patternMessage || 'Formato invu00e1lido';
      isValid = false;
      return;
    }

    // Verificar validau00e7u00e3o personalizada
    if (fieldRules.custom && typeof fieldRules.custom === 'function') {
      const customValidation = fieldRules.custom(value, formData);
      if (customValidation !== true) {
        errors[field] = customValidation || 'Valor invu00e1lido';
        isValid = false;
        return;
      }
    }
  });

  return { isValid, errors };
};

// Exemplo de uso:
/*
const formRules = {
  name: { required: true, requiredMessage: 'Nome u00e9 obrigatu00f3rio' },
  email: { required: true, email: true },
  phone: { required: true, phone: true },
  age: { min: 18, max: 100 }
};

const { isValid, errors } = validateForm(formData, formRules);
*/
