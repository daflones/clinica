import { useState, useCallback } from 'react';
import { validateForm } from '../utils/formValidation';

/**
 * Hook personalizado para gerenciar estados e validau00e7u00e3o de formulu00e1rios
 *
 * @param {Object} initialValues - Valores iniciais do formulu00e1rio
 * @param {Object} validationRules - Regras de validau00e7u00e3o
 * @param {Function} onSubmit - Funu00e7u00e3o a ser executada no envio do formulu00e1rio
 * @returns {Object} Mu00e9todos e estados do formulu00e1rio
 */
const useForm = (initialValues = {}, validationRules = {}, onSubmit = () => {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Atualiza um campo do formulu00e1rio
  const handleChange = useCallback(
    e => {
      const { name, value, type, checked } = e.target;

      setValues(prevValues => ({
        ...prevValues,
        [name]: type === 'checkbox' ? checked : value,
      }));

      // Marca o campo como tocado ao ser alterado
      setTouched(prevTouched => ({
        ...prevTouched,
        [name]: true,
      }));

      // Limpa o erro se o campo for alterado
      if (errors[name]) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  // Atualiza um campo do formulu00e1rio programaticamente
  const setValue = useCallback((name, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  // Atualiza mu00faltiplos campos do formulu00e1rio
  const setMultipleValues = useCallback(newValues => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues,
    }));
  }, []);

  // Marca um campo como tocado
  const handleBlur = useCallback(
    e => {
      const { name } = e.target;

      setTouched(prevTouched => ({
        ...prevTouched,
        [name]: true,
      }));

      // Valida apenas o campo que perdeu o foco
      if (validationRules[name]) {
        const fieldValidation = validateForm(
          { [name]: values[name] },
          { [name]: validationRules[name] }
        );

        if (!fieldValidation.isValid) {
          setErrors(prevErrors => ({
            ...prevErrors,
            ...fieldValidation.errors,
          }));
        }
      }
    },
    [values, validationRules]
  );

  // Reseta o formulu00e1rio para os valores iniciais
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, [initialValues]);

  // Valida todo o formulu00e1rio
  const validateAll = useCallback(() => {
    const { isValid, errors: validationErrors } = validateForm(values, validationRules);
    setErrors(validationErrors);
    return isValid;
  }, [values, validationRules]);

  // Lida com o envio do formulu00e1rio
  const handleSubmit = useCallback(
    async e => {
      if (e) e.preventDefault();

      // Marca todos os campos como tocados
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});

      setTouched(allTouched);
      setSubmitted(true);

      const isValid = validateAll();

      if (isValid) {
        setSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Erro ao enviar formulu00e1rio:', error);
        } finally {
          setSubmitting(false);
        }
      }
    },
    [values, validateAll, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    submitting,
    submitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    setMultipleValues,
    resetForm,
    validateAll,
    // Helper para verificar se um campo tem erro e foi tocado
    hasError: useCallback(
      fieldName => {
        return Boolean(touched[fieldName] && errors[fieldName]);
      },
      [touched, errors]
    ),
    // Helper para obter a mensagem de erro de um campo
    getError: useCallback(
      fieldName => {
        return touched[fieldName] ? errors[fieldName] : '';
      },
      [touched, errors]
    ),
  };
};

export default useForm;
