import { NextResponse } from 'next/server';

export interface APISuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface APIErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export type APIResponse<T = any> = APISuccessResponse<T> | APIErrorResponse;

/**
 * Create a success response
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status = 200
): NextResponse<APISuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

/**
 * Create an error response
 */
export function errorResponse(
  error: string,
  status = 400,
  code?: string,
  details?: any
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    },
    { status }
  );
}

/**
 * Handle common error cases
 */
export function handleError(error: unknown, defaultStatus = 500): NextResponse<APIErrorResponse> {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return errorResponse(
      error.message || 'An error occurred',
      defaultStatus
    );
  }

  return errorResponse(
    'An unexpected error occurred',
    defaultStatus
  );
}

/**
 * Middleware for catching errors in API routes
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}
