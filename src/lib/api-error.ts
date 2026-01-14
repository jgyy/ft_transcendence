export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function handleAPIError(response: Response): Promise<never> {
  const data = await response.json().catch(() => ({}));

  const message =
    data.error ||
    data.message ||
    {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      500: 'Server Error',
    }[response.status] ||
    'An error occurred';

  throw new APIError(response.status, message, data.details);
}

export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export const API_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'You need to sign in to perform this action.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data.',
  429: 'Too many requests. Please try again later.',
  500: 'Server error. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',
};

export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    return API_ERROR_MESSAGES[error.status] || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
