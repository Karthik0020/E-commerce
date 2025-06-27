// Frontend API utility functions
const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
const authAPI = {
  register: async (userData) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  login: async (credentials) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  adminLogin: async (credentials) => {
    const response = await apiRequest('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
  }
};

// Products API
const productsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/products?${queryString}`);
  },

  getById: async (id) => {
    return await apiRequest(`/products/${id}`);
  },

  create: async (productData) => {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  update: async (id, productData) => {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  getCategories: async () => {
    return await apiRequest('/products/categories/all');
  }
};

// Cart API
const cartAPI = {
  get: async () => {
    return await apiRequest('/cart');
  },

  add: async (item) => {
    return await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  update: async (id, quantity) => {
    return await apiRequest(`/cart/update/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  remove: async (id) => {
    return await apiRequest(`/cart/remove/${id}`, {
      method: 'DELETE'
    });
  },

  clear: async () => {
    return await apiRequest('/cart/clear', {
      method: 'DELETE'
    });
  }
};

// Wishlist API
const wishlistAPI = {
  get: async () => {
    return await apiRequest('/wishlist');
  },

  add: async (productId) => {
    return await apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId })
    });
  },

  remove: async (productId) => {
    return await apiRequest(`/wishlist/remove/${productId}`, {
      method: 'DELETE'
    });
  }
};

// Orders API
const ordersAPI = {
  create: async (orderData) => {
    return await apiRequest('/orders/create', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  getMyOrders: async () => {
    return await apiRequest('/orders/my-orders');
  },

  getById: async (id) => {
    return await apiRequest(`/orders/${id}`);
  },

  // Admin functions
  getAllOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/orders/admin/all?${queryString}`);
  },

  updateStatus: async (id, status) => {
    return await apiRequest(`/orders/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
};

// Export all APIs
window.API = {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  orders: ordersAPI
};