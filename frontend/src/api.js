const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  register: (data) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  login: (data) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  verify: (token) => fetch(`${API_URL}/auth/verify`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json())
};

export const productAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params);
    return fetch(`${API_URL}/products?${query}`).then(r => r.json());
  },
  
  getById: (id) => fetch(`${API_URL}/products/${id}`).then(r => r.json()),
  
  getPricing: (id) => fetch(`${API_URL}/products/${id}/pricing`).then(r => r.json()),
  
  create: (data, token) => fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  update: (id, data, token) => fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  delete: (id, token) => fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json())
};

export const quotationAPI = {
  create: (data, token) => fetch(`${API_URL}/quotations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  getAll: (params = {}, token) => {
    const query = new URLSearchParams(params);
    return fetch(`${API_URL}/quotations?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
  },
  
  getById: (id, token) => fetch(`${API_URL}/quotations/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  
  approve: (id, token) => fetch(`${API_URL}/quotations/${id}/approve`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  
  reject: (id, token) => fetch(`${API_URL}/quotations/${id}/reject`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  
  convertToOrder: (id, token) => fetch(`${API_URL}/quotations/${id}/convert-to-order`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json())
};

export const orderAPI = {
  create: (data, token) => fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  getAll: (params = {}, token) => {
    const query = new URLSearchParams(params);
    return fetch(`${API_URL}/orders?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
  },
  
  getById: (id, token) => fetch(`${API_URL}/orders/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()),
  
  updateStatus: (id, status, token) => fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  }).then(r => r.json())
};
