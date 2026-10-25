// src/services/api.js
// The ONLY place that knows backend URLs. Components call these named functions.
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send/receive the httpOnly auth cookie
});

// Every call returns response.data, or throws an object/Error that always has `.message`.
const request = async (config, fallbackMessage) => {
  try {
    const response = await apiClient.request(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error(error.message || fallbackMessage || 'Network error');
  }
};

// --- Auth / profile ---
export const getMe = () => request({ method: 'get', url: '/users/me' }, 'Could not load your profile');
export const updateProfile = (data) => request({ method: 'patch', url: '/users/me', data }, 'Could not update your profile');
export const updatePassword = (data) => request({ method: 'patch', url: '/users/updateMyPassword', data }, 'Could not change your password');
export const getMySummary = () => request({ method: 'get', url: '/users/me/summary' }, 'Could not load your activity');
export const deleteAccount = (password) => request({ method: 'delete', url: '/users/me', data: { password } }, 'Could not delete your account');

// --- Model run & history ---
export const runModel = (formData, onUploadProgress) =>
  request({ method: 'post', url: '/model/run', data: formData, onUploadProgress }, 'Network error for model run');
export const getSimulationHistory = (modelName) => request({ method: 'get', url: `/history/${modelName}` }, 'Could not fetch simulation history');
export const deleteHistoryItem = (id) => request({ method: 'delete', url: `/history/item/${id}` }, 'Could not delete the saved run');

// --- Feedback ---
export const submitOrUpdateFeedback = (data) => request({ method: 'post', url: '/feedback', data }, 'Could not submit feedback');
export const getFeedbackForModel = (modelName) => request({ method: 'get', url: `/feedback/${modelName}` }, 'Could not fetch feedback');
export const getCurrentUserFeedbackForModel = (modelName) =>
  request({ method: 'get', url: `/feedback/user/${modelName}` }, 'Could not fetch your feedback');

// --- Contact ---
export const sendContactMessage = (data) => request({ method: 'post', url: '/contact', data }, 'Could not send your message');

// --- Stats ---
export const recordPageVisit = async (pagePath) => {
  try { return await request({ method: 'post', url: '/stats/visit', data: { pagePath } }); } catch { return null; }
};
export const getVisitorStats = () => request({ method: 'get', url: '/stats/summary' }, 'Could not fetch site statistics');

// --- AI ---
export const getAiStatus = async () => {
  try { return (await request({ method: 'get', url: '/ai/status' })).data.enabled; } catch { return false; }
};
export const aiExplainResults = (payload) => request({ method: 'post', url: '/ai/explain-results', data: payload }, 'AI request failed');
export const aiChat = (payload) => request({ method: 'post', url: '/ai/chat', data: payload }, 'AI request failed');
export const aiSummarizeFeedback = () => request({ method: 'post', url: '/ai/summarize-feedback' }, 'AI request failed');

// --- Admin ---
export const getAdminDashboardStats = () => request({ method: 'get', url: '/admin/stats' }, 'Could not fetch dashboard statistics');
export const getAllFeedbackAdmin = () => request({ method: 'get', url: '/admin/feedback' }, 'Could not fetch feedback');
export const replyToFeedbackAdmin = (id, adminReply) => request({ method: 'put', url: `/admin/feedback/${id}/reply`, data: { adminReply } }, 'Could not reply to feedback');
export const updateFeedbackStatusAdmin = (id, status) => request({ method: 'patch', url: `/admin/feedback/${id}/status`, data: { status } }, 'Could not update status');
export const getAllUsersAdmin = () => request({ method: 'get', url: '/admin/users' }, 'Could not fetch users');
export const updateUserRoleAdmin = (id, role) => request({ method: 'patch', url: `/admin/users/${id}/role`, data: { role } }, 'Could not update the role');
export const getContactMessagesAdmin = () => request({ method: 'get', url: '/admin/contact-requests' }, 'Could not fetch messages');
export const updateContactStatusAdmin = (id, status) => request({ method: 'patch', url: `/admin/contact-requests/${id}/status`, data: { status } }, 'Could not update the message');

export default apiClient;
