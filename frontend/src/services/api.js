// src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// --- Model Run ---
// formData should now include modelName: 'YourModelIdentifier'
export const runModel = async (formData, onUploadProgress) => {
  try {
    // Ensure modelName is part of formData if your backend expects it in the body
    // If modelName is already in formData (e.g., from FileUpload component), this is fine.
    // Example: if (!formData.has('modelName')) formData.append('modelName', 'DefaultModel');
    const response = await apiClient.post('/model/run', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    console.error('Error running model:', error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || 'Network error for model run');
  }
};

// --- Feedback ---
export const submitOrUpdateFeedback = async (feedbackData) => {
  try {
    const response = await apiClient.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting/updating feedback:', error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || 'Could not submit or update feedback');
  }
};

export const getFeedbackForModel = async (modelName) => {
  try {
    const response = await apiClient.get(`/feedback/${modelName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching feedback for ${modelName}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || `Could not fetch feedback for ${modelName}`);
  }
};

export const getCurrentUserFeedbackForModel = async (modelName) => {
  try {
    const response = await apiClient.get(`/feedback/user/${modelName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user's feedback for ${modelName}:`, error.response?.data || error.message);
    if (error.response?.status !== 200 && error.response?.status !== 404) {
         throw error.response?.data || new Error(error.message || `Could not fetch your feedback for ${modelName}`);
    }
    return error.response?.data || { status: 'fail', message: error.message };
  }
};

// --- Simulation History ---
export const getSimulationHistory = async (modelName) => {
  try {
    const response = await apiClient.get(`/history/${modelName}`);
    return response.data; // Expected: { status: 'success', results: count, data: { history: [...] } }
  } catch (error) {
    console.error(`Error fetching simulation history for ${modelName}:`, error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || `Could not fetch simulation history for ${modelName}`);
  }
};


// --- Visitor Stats ---
// ... (rest of the stats and admin functions remain the same) ...
export const recordPageVisit = async (pagePath) => {
  try {
    const response = await apiClient.post('/stats/visit', { pagePath });
    return response.data;
  } catch (error) {
    console.warn('Could not record page visit:', error.response?.data?.message || error.message);
    return null;
  }
};

export const getVisitorStats = async () => {
  try {
    const response = await apiClient.get('/stats/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching visitor stats:', error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || 'Could not fetch site statistics');
  }
};

// --- Admin Panel Specific API Calls ---
export const getAdminDashboardStats = async () => {
  try {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || 'Could not fetch admin dashboard statistics');
  }
};

export const getAllFeedbackAdmin = async () => {
  try {
    const response = await apiClient.get('/admin/feedback');
    return response.data;
  } catch (error) {
    console.error('Error fetching all feedback (admin):', error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || 'Could not fetch feedback for admin');
  }
};

export const replyToFeedbackAdmin = async (feedbackId, adminReply) => {
  try {
    const response = await apiClient.put(`/admin/feedback/${feedbackId}/reply`, { adminReply });
    return response.data;
  } catch (error) {
    console.error('Error replying to feedback (admin):', error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || 'Could not reply to feedback');
  }
};

export const updateFeedbackStatusAdmin = async (feedbackId, status) => {
    try {
        const response = await apiClient.patch(`/admin/feedback/${feedbackId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updating feedback status (admin):', error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || 'Could not update feedback status');
    }
};

export const getAllUsersAdmin = async () => {
    try {
        const response = await apiClient.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching all users (admin):', error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || 'Could not fetch users for admin');
    }
};

export const updateUserRoleAdmin = async (userId, role) => {
    try {
        const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    } catch (error) {
        console.error('Error updating user role (admin):', error.response?.data || error.message);
        throw error.response?.data || new Error(error.message || 'Could not update user role');
    }
};


export default apiClient;
