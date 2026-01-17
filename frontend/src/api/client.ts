// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// /**
//  * Get authentication token from localStorage
//  */
// function getAuthToken(): string | null {
//   return localStorage.getItem('auth_token');
// }

// /**
//  * Fetch wrapper that automatically includes authentication token
//  * Compatible with Django REST Framework token authentication
//  */
// export async function apiFetch<T>(
//   endpoint: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   try {
//     const token = getAuthToken();
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json',
//       ...(options.headers as Record<string, string>),
//     };

//     // Add Authorization header if token exists (Django REST Framework format)
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...options,
//       headers,
//     });

//     // Handle 401 Unauthorized - token might be expired
//     if (response.status === 401) {
//       // Clear invalid token
//       localStorage.removeItem('auth_token');
//       localStorage.removeItem('auth_user');
//       localStorage.removeItem('user_profile');
//       // Redirect to login if not already there
//       if (!window.location.pathname.includes('/auth')) {
//         window.location.href = '/auth';
//       }
//       throw new Error('Unauthorized - please login again');
//     }

//     if (!response.ok) {
//       // Try to parse error message from response
//       let errorMessage = `API error: ${response.status}`;
//       try {
//         const errorData = await response.json();
//         if (errorData.detail || errorData.message || errorData.error) {
//           errorMessage = errorData.detail || errorData.message || errorData.error;
//         }
//       } catch {
//         // If response is not JSON, use default message
//       }
//       throw new Error(errorMessage);
//     }

//     return response.json();
//   } catch (error) {
//     // Fallback to mock data - will be handled by api functions
//     throw error;
//   }
// }

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

type ApiFetchOptions = RequestInit & {
  responseType?: 'json' | 'blob' | 'text';
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { responseType = 'json', ...fetchOptions } = options;

  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Only set JSON header when sending JSON
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // Handle auth expiry
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_profile');

    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }

    throw new Error('Unauthorized - please login again');
  }

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        errorMessage;
    } catch {
      // non-JSON error
    }
    throw new Error(errorMessage);
  }

  // RESPONSE TYPE HANDLING
  if (responseType === 'blob') {
    return (await response.blob()) as T;
  }

  if (responseType === 'text') {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}
