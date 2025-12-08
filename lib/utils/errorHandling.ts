// Enhanced Error Handling and Loading States for Basketball Tournament App

export interface ApiError {
  message: string;
  status?: number;
  details?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  hasError: boolean;
}

export const createLoadingState = (isLoading = false): LoadingState => ({
  isLoading,
  error: null,
  hasError: false,
});

export const setLoadingState = (loading: boolean): LoadingState => ({
  isLoading: loading,
  error: null,
  hasError: false,
});

export const setErrorState = (error: string): LoadingState => ({
  isLoading: false,
  error,
  hasError: true,
});

export const setSuccessState = (): LoadingState => ({
  isLoading: false,
  error: null,
  hasError: false,
});

// API Response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export const apiRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Fallback to status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }

      return {
        data: null,
        error: errorMessage,
        success: false,
      };
    }

    const data = await response.json();
    return {
      data,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      success: false,
    };
  }
};

// Toast notification helpers
export const showSuccessToast = (message: string, description?: string) => {
  if (typeof window !== 'undefined') {
    const { toast } = require('sonner');
    toast.success(message, description ? { description } : undefined);
  }
};

export const showErrorToast = (message: string, description?: string) => {
  if (typeof window !== 'undefined') {
    const { toast } = require('sonner');
    toast.error(message, description ? { description } : undefined);
  }
};

export const showInfoToast = (message: string, description?: string) => {
  if (typeof window !== 'undefined') {
    const { toast } = require('sonner');
    toast.info(message, description ? { description } : undefined);
  }
};

// Retry mechanism
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// Network status checker
export const checkNetworkStatus = (): boolean => {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

// Error boundary helper
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Ein unbekannter Fehler ist aufgetreten';
};

// Validation helpers
export const validateGameId = (gameId: string): boolean => {
  return !!(gameId && gameId.length === 24 && /^[a-fA-F0-9]+$/.test(gameId));
};

export const validateTournamentId = (tournamentId: string): boolean => {
  return !!(tournamentId && tournamentId.length === 24 && /^[a-fA-F0-9]+$/.test(tournamentId));
};