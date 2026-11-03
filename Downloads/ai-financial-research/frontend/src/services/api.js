import axios from 'axios';

// Base API URL defaults to relative path in web preview, or custom URL if configured
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const apiService = {
  // Start a new research task
  startResearch: async (symbol) => {
    const response = await apiClient.post('/api/research', { symbol: symbol.trim().toUpperCase() });
    return response.data;
  },

  // Get full research results
  getResearch: async (researchId) => {
    const response = await apiClient.get(`/api/research/${researchId}`);
    return response.data;
  },

  // Get agent execution status
  getResearchStatus: async (researchId) => {
    const response = await apiClient.get(`/api/research/${researchId}/status`);
    return response.data;
  },

  // Get historical generated reports list
  getReports: async () => {
    const response = await apiClient.get('/api/reports');
    return response.data;
  },

  // Get single full report by report ID
  getReportById: async (reportId) => {
    const response = await apiClient.get(`/api/reports/${reportId}`);
    return response.data;
  },

  // Get stock overview & time series directly
  getStockInfo: async (symbol) => {
    const response = await apiClient.get(`/api/stocks/${symbol.trim().toUpperCase()}`);
    return response.data;
  },

  // Health check
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default apiService;
