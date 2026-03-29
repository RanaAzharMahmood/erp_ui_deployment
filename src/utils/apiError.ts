/**
 * Typed API error that carries the HTTP status code.
 * Thrown by the API client on non-2xx responses.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Returns a user-friendly message based on status code. */
export function getErrorMessage(error: unknown): { title: string; detail: string; retryable: boolean } {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 403:
        return {
          title: 'Access Denied',
          detail: error.message.startsWith('Access denied')
            ? `${error.message}. Contact your administrator to request the required permissions.`
            : error.message,
          retryable: false,
        };
      case 404:
        return {
          title: 'Not Found',
          detail: 'The requested data could not be found.',
          retryable: false,
        };
      case 401:
        return {
          title: 'Session Expired',
          detail: 'Your session has expired. Please log in again.',
          retryable: false,
        };
      default:
        return {
          title: 'Server Error',
          detail: error.message || 'Something went wrong on the server. Please try again.',
          retryable: true,
        };
    }
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
      return {
        title: 'Connection Error',
        detail: 'Unable to connect to the server. Check your internet connection.',
        retryable: true,
      };
    }
    return {
      title: 'Error',
      detail: error.message,
      retryable: true,
    };
  }

  return {
    title: 'Unexpected Error',
    detail: 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
}
