export interface FormError {
  field?: string;
  message: string;
}

export function parseFormError(error: unknown): FormError {
  if (typeof error === 'string') {
    return { message: error };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    if (err.error) {
      return {
        field: err.field,
        message: err.error,
      };
    }
    if (err.message) {
      return {
        field: err.field,
        message: err.message,
      };
    }
  }

  return { message: 'An unexpected error occurred' };
}

export function getFieldError(
  errors: Record<string, any>,
  fieldName: string
): string | undefined {
  const error = errors[fieldName];
  if (!error) return undefined;

  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (Array.isArray(error) && error[0]?.message) return error[0].message;

  return undefined;
}
