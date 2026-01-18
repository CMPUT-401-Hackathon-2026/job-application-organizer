const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

type ApiFetchOptions = RequestInit & {
  responseType?: 'json' | 'text' | 'blob';
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  const hasBody = !!options.body;
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  if (hasBody && !isFormData) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error('Network failure:', err);
    // DO NOT crash React
    return Promise.reject({
      status: 0,
      message: 'Network error',
    });
  }

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('user_profile');

    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }

    return Promise.reject({
      status: 401,
      message: 'Session expired',
    });
  }

  if (!response.ok) {
    let msg = `API error: ${response.status}`;
    try {
      const err = await response.json();
      msg = err.detail || err.message || err.error || msg;
    } catch {}

    //  DO NOT throw — return controlled rejection
    return Promise.reject({
      status: response.status,
      message: msg,
    });
  }

  const rt = options.responseType ?? 'json';
  if (rt === 'blob') return (await response.blob()) as T;
  if (rt === 'text') return (await response.text()) as T;
  return (await response.json()) as T;
}