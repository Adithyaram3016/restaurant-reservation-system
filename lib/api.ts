const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token: string | null): void => {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }
};

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

export const api = {
  auth: {
    login: (credentials: any) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (details: any) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(details) }),
    getMe: () => request('/auth/me', { method: 'GET' }),
    listUsers: () => request('/auth/users', { method: 'GET' }),
  },
  reservations: {
    create: (reservationData: any) =>
      request('/reservations', { method: 'POST', body: JSON.stringify(reservationData) }),
    list: (date?: string) =>
      request(`/reservations${date ? `?date=${date}` : ''}`, { method: 'GET' }),
    update: (id: string, updateData: any) =>
      request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify(updateData) }),
    cancel: (id: string) =>
      request(`/reservations/${id}/cancel`, { method: 'PATCH' }),
  },
  tables: {
    list: () => request('/tables', { method: 'GET' }),
    create: (tableData: any) =>
      request('/tables', { method: 'POST', body: JSON.stringify(tableData) }),
    update: (id: string, tableData: any) =>
      request(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(tableData) }),
    delete: (id: string) =>
      request(`/tables/${id}`, { method: 'DELETE' }),
  },
};
