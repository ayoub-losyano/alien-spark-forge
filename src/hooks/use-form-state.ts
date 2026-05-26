// Form state management hook
import { useState, useCallback } from 'react';

type FormState<T> = {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isDirty: boolean;
  isSubmitting: boolean;
};

export function useFormState<T extends Record<string, any>>(initialValues: T) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {} as Partial<Record<keyof T, string>>,
    touched: {} as Partial<Record<keyof T, boolean>>,
    isDirty: false,
    isSubmitting: false,
  });

  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [key]: value },
      touched: { ...prev.touched, [key]: true },
      isDirty: true,
    }));
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      isDirty: true,
    }));
  }, []);

  const setError = useCallback(<K extends keyof T>(key: K, error: string | null) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [key]: error ?? undefined },
    }));
  }, []);

  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setState(prev => ({
      ...prev,
      errors: errors as Partial<Record<keyof T, string>>,
    }));
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const reset = useCallback((values?: T) => {
    setState({
      values: values ?? initialValues,
      errors: {} as Partial<Record<keyof T, string>>,
      touched: {} as Partial<Record<keyof T, boolean>>,
      isDirty: false,
      isSubmitting: false,
    });
  }, [initialValues]);

  const touchAll = useCallback(() => {
    const touched = Object.keys(state.values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setState(prev => ({ ...prev, touched }));
  }, [state.values]);

  return {
    ...state,
    setValue,
    setValues,
    setError,
    setErrors,
    setSubmitting,
    reset,
    touchAll,
  };
}
