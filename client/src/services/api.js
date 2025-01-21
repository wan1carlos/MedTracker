import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3100/api';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (userData) => {
  try {
    console.log('Sending registration data:', userData);
    // Convert the data format to match backend expectations
    const formattedData = {
      first_name: userData.firstName,
      middle_name: userData.middleName,
      last_name: userData.lastName,
      email: userData.email,
      password: userData.password,
      address: userData.address,
      gender: userData.gender,
      date_of_birth: userData.dateOfBirth
    };

    console.log('Formatted data:', formattedData);
    const response = await apiClient.post('/users/register', formattedData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error details:', error);
    throw error.response?.data || error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/users/login', credentials);
    if (response.data.token) {
      console.log('User data from login:', response.data.user);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error.response?.data || error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common['Authorization'];
};

export const getHealthData = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching health data:', error);
    throw error.response?.data || error;
  }
};

export const addHealthData = async (healthData) => {
  try {
    const response = await apiClient.post('/health', healthData);
    return response.data;
  } catch (error) {
    console.error('Error adding health data:', error);
    throw error.response?.data || error;
  }
};

export const deleteHealthData = async (id) => {
  try {
    const response = await apiClient.delete(`/health/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting health data:', error);
    throw error.response?.data || error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error.response?.data || error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await apiClient.put('/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error.response?.data || error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data || error;
  }
};

export const getUserHealthData = async (userId) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}/health`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user health data:', error);
    throw error.response?.data || error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/users/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error.response?.data || error;
  }
};

export const deleteHealthRecord = async (userId, recordId) => {
  try {
    const response = await apiClient.delete(`/admin/users/${userId}/health/${recordId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting health record:', error);
    throw error.response?.data || error;
  }
};

export const loginAdmin = async (credentials) => {
  try {
    const response = await apiClient.post('/admin/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        type: 'admin'
      }));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    throw error.response?.data || error;
  }
};

export const getUserDetails = async () => {
  try {
    const response = await apiClient.get('/users/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error.response?.data || error;
  }
};

export const updatePassword = async (passwordData) => {
  try {
    const response = await apiClient.put('/users/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error.response?.data || error;
  }
};