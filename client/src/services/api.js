const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getStoredToken = () => localStorage.getItem('crm_token');
export const setStoredToken = (token) => localStorage.setItem('crm_token', token);
export const removeStoredToken = () => {
  localStorage.removeItem('crm_token');
  localStorage.removeItem('crm_user');
};

export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('crm_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('crm_user', JSON.stringify(user));
};

export async function apiRequest(endpoint, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Authentication API
export const authApi = {
  login: async (email, password) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.data.token);
    setStoredUser(res.data.user);
    return res.data;
  },
  register: async (userData) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    setStoredToken(res.data.token);
    setStoredUser(res.data.user);
    return res.data;
  },
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },
  logout: () => {
    removeStoredToken();
  },
};

// Customers API
export const customerApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.tag) query.append('tag', params.tag);
    if (params.status) query.append('status', params.status);
    if (params.sort) query.append('sort', params.sort);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString();
    return apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
  },
  getById: async (id) => {
    return apiRequest(`/customers/${id}`);
  },
  create: async (customerData) => {
    return apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },
  update: async (id, customerData) => {
    return apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  },
  delete: async (id) => {
    return apiRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
  getStats: async () => {
    return apiRequest('/customers/stats/summary');
  },
};

// Interactions API
export const interactionApi = {
  log: async (customerId, interactionData) => {
    return apiRequest(`/customers/${customerId}/interactions`, {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
  },
  getByCustomer: async (customerId) => {
    return apiRequest(`/customers/${customerId}/interactions`);
  },
  delete: async (id) => {
    return apiRequest(`/interactions/${id}`, {
      method: 'DELETE',
    });
  },
};

// Purchases API
export const purchaseApi = {
  record: async (customerId, purchaseData) => {
    return apiRequest(`/customers/${customerId}/purchases`, {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  },
  getByCustomer: async (customerId) => {
    return apiRequest(`/customers/${customerId}/purchases`);
  },
};

// Sales Analytics API (Owner Only)
export const salesApi = {
  getSummary: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.limit) query.append('limit', params.limit);
    const qs = query.toString();
    return apiRequest(`/sales-summary${qs ? `?${qs}` : ''}`);
  },
};
