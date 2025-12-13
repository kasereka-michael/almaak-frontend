import API from './apiConfig';

export const fetchTopQuotedProducts = async ({ start, end, limit = 10 }) => {
  const params = { start, end, limit };
  const { data } = await API.get('/api/report/v1/top-quoted-products', { params });
  return data;
};

export const fetchPOsReceived = async ({ start, end }) => {
  const params = { start, end };
  const { data } = await API.get('/api/report/v1/po/received', { params });
  return data;
};

export const fetchPOsPaidSummary = async ({ start, end }) => {
  const params = { start, end };
  const { data } = await API.get('/api/report/v1/po/paid/summary', { params });
  return data;
};

export const fetchRevenue = async ({ start, end }) => {
  const params = { start, end };
  const { data } = await API.get('/api/report/v1/revenue', { params });
  return data;
};

export const fetchExpenses = async ({ start, end }) => {
  const params = { start, end };
  const { data } = await API.get('/api/report/v1/expenses', { params });
  return data;
};

export const fetchQuotationsInPeriod = async ({ start, end }) => {
  const params = { start, end };
  const { data } = await API.get('/api/report/v1/quotations', { params });
  return data; // { list: [...], totals: { amount } }
};
