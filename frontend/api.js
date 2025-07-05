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

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getAuthToken();
};

// Get user data from localStorage
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Set user data in localStorage
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user data from localStorage
const removeUser = () => {
  localStorage.removeItem('user');
};

// Enhanced API request helper with better error handling
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
      // Handle specific error cases
      if (response.status === 401) {
        // Token expired or invalid
        removeAuthToken();
        removeUser();
        window.location.href = '/login.html';
        throw new Error('Session expired. Please login again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission for this action.');
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found.');
      }
      
      if (response.status === 429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      // Handle validation errors
      if (data.details && Array.isArray(data.details)) {
        const errorMessages = data.details.map(err => `${err.param}: ${err.msg}`).join(', ');
        throw new Error(errorMessages);
      }
      
      throw new Error(data.message || data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

// Show loading state
const showLoading = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.disabled = true;
    element.textContent = 'Loading...';
  }
};

// Hide loading state
const hideLoading = (elementId, originalText) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.disabled = false;
    element.textContent = originalText;
  }
};

// Show message to user
const showMessage = (message, type = 'error', duration = 5000) => {
  // Create message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;
  messageDiv.textContent = message;
  
  // Add styles
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
    ${type === 'error' ? 'background-color: #d32f2f;' : 'background-color: #388e3c;'}
  `;
  
  // Add to page
  document.body.appendChild(messageDiv);
  
  // Remove after duration
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.parentNode.removeChild(messageDiv);
    }
  }, duration);
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
      setUser(response.user);
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
      setUser(response.user);
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
      setUser(response.admin);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
    removeUser();
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    window.location.href = '/login.html';
  },

  verifyToken: async () => {
    try {
      const response = await apiRequest('/auth/verify');
      return response;
    } catch (error) {
      return { valid: false };
    }
  },

  isAuthenticated,
  getUser
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
  getCart: async () => {
    return await apiRequest('/cart');
  },

  addItem: async (productId, quantity = 1) => {
    return await apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  updateItem: async (itemId, quantity) => {
    return await apiRequest(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  removeItem: async (itemId) => {
    return await apiRequest(`/cart/remove/${itemId}`, {
      method: 'DELETE'
    });
  },

  clearCart: async () => {
    return await apiRequest('/cart/clear', {
      method: 'DELETE'
    });
  },

  // Legacy methods for backward compatibility
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
  getWishlist: async () => {
    return await apiRequest('/wishlist');
  },

  addItem: async (productId) => {
    return await apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  removeItem: async (productId) => {
    return await apiRequest(`/wishlist/remove/${productId}`, {
      method: 'DELETE'
    });
  },

  toggleItem: async (productId) => {
    try {
      // First check if item is in wishlist
      const isInWishlist = await apiRequest(`/wishlist/check/${productId}`);
      if (isInWishlist.inWishlist) {
        return await apiRequest(`/wishlist/remove/${productId}`, {
          method: 'DELETE'
        });
      } else {
        return await apiRequest('/wishlist/add', {
          method: 'POST',
          body: JSON.stringify({ productId })
        });
      }
    } catch (error) {
      throw error;
    }
  },

  checkItem: async (productId) => {
    return await apiRequest(`/wishlist/check/${productId}`);
  },

  // Legacy methods for backward compatibility
  get: async () => {
    return await apiRequest('/wishlist');
  },

  add: async (productId) => {
    return await apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
  },

  remove: async (productId) => {
    return await apiRequest(`/wishlist/remove/${productId}`, {
      method: 'DELETE'
    });
  },

  check: async (productId) => {
    return await apiRequest(`/wishlist/check/${productId}`);
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

// Utility functions
const utils = {
  showLoading,
  hideLoading,
  showMessage,
  formatPrice: (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  },
  
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Export all APIs
window.API = {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  orders: ordersAPI,
  utils
};