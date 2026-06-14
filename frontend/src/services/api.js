import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Submit product image for YOLOv8 classification
  predict: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Retrieve current stock list
  getInventory: async () => {
    const response = await apiClient.get('/inventory');
    return response.data;
  },

  // Adjust stock values manually
  updateInventory: async (productName, quantity) => {
    const response = await apiClient.post('/inventory/update', {
      product_name: productName,
      quantity: quantity,
    });
    return response.data;
  },

  // Retrieve historical alerts
  getAlerts: async () => {
    const response = await apiClient.get('/alerts');
    return response.data;
  },
};

export default apiService;
