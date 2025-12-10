import API from './apiConfig';

export const fetchDashboardSummary = async (params = {}) => {
  try {
    const response = await API.get('/api/dashboard/summary', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error?.message || error);
    throw error;
  }
};
