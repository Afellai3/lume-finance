import { useState, useCallback } from 'react';

export type ValidationRule<T = any> = {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  custom?: (value: T) => string | undefined;
};

export type FormRules<T> = { [K in keyof T]?: ValidationRule<T[K]> };
export type FormErrors<T> = { [K in keyof T]?: string };
export type TouchedFields<T> = { [K in keyof T]?: boolean };

interface UseFormValidationReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldTouched: (field: keyof T, isTouched?: boolean) => void;
  validateForm: () => boolean;
  resetForm: (newValues?: Partial<T>) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>(options: {
  initialValues: T;
  validationRules: FormRules<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}): UseFormValidationReturn<T> => {
  const { initialValues, validationRules, validateOnChange = true, validateOnBlur = true } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback((field: keyof T): string | undefined => {
    const value = values[field];
    const rules = validationRules[field];
    if (!rules) return undefined;

    if (rules.required) {
      const isEmpty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
      if (isEmpty) return typeof rules.required === 'string' ? rules.required : 'Campo obbligatorio';
    }

    if (value === '' || value === null || value === undefined) return undefined;

    if (rules.min !== undefined && typeof value === 'number') {
      const minValue = typeof rules.min === 'number' ? rules.min : rules.min.value;
      const message = typeof rules.min === 'object' ? rules.min.message : `Minimo ${minValue}`;
      if (value < minValue) return message;
    }

    if (rules.max !== undefined && typeof value === 'number') {
      const maxValue = typeof rules.max === 'number' ? rules.max : rules.max.value;
      const message = typeof rules.max === 'object' ? rules.max.message : `Massimo ${maxValue}`;
      if (value > maxValue) return message;
    }

    if (rules.pattern && typeof value === 'string') {
      const regex = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
      const message = rules.pattern instanceof RegExp ? 'Formato non valido' : rules.pattern.message;
      if (!regex.test(value)) return message;
    }

    if (rules.custom) return rules.custom(value);

    return undefined;
  }, [values, validationRules]);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;
    (Object.keys(validationRules) as Array<keyof T>).forEach((field) => {
      const error = validateField(field);
      if (error) { newErrors[field] = error; isValid = false; }
    });
    setErrors(newErrors);
    return isValid;
  }, [validateField, validationRules]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (validateOnChange) {
      setTimeout(() => {
        const error = validateField(field);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }, 0);
    }
  }, [validateOnChange, validateField]);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
    if (validateOnBlur && isTouched) {
      const error = validateField(field);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [validateOnBlur, validateField]);

  const resetForm = useCallback((newValues?: Partial<T>) => {
    setValues(newValues ? { ...initialValues, ...newValues } : initialValues);
    setErrors({}); setTouched({}); setIsDirty(false);
  }, [initialValues]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void | Promise<void>) => {
    return async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {} as TouchedFields<T>);
      setTouched(allTouched);
      const isValid = validateForm();
      if (isValid) await onSubmit(values);
    };
  }, [values, validateForm]);

  const isValid = Object.keys(errors).length === 0;

  return { values, errors, touched, isValid, isDirty, setFieldValue, setFieldTouched, validateForm, resetForm, handleSubmit };
};
