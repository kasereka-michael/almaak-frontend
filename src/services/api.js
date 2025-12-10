import API from './apiConfig'

// Keep only APIs for products, customers, quotations, and invoices.

// =============== Product Mapping ===============
const mapToFrontend = (product) => ({
  id: product.productId,
  productId: product.productId,
  name: product.productName || '',
  sku: product.productSKU || '',
  partNumber: product.productPartNumber || '',
  category: product.productCategory || '',
  manufacturer: product.productManufacturer || '',
  description: product.productDescription || '',
  sellingPrice: product.productSellingPrice || 0,
  costPrice: product.productCostPrice || 0,
  normalPrice: product.productNormalPrice || 0,
  quantity: product.productCurrentQuantity || 0,
  minQuantity: product.productMinimumQuantity || 0,
  location: product.storageLocation || '',
  supplierInfo: product.productSupplierInfo || '',
  notes: product.notes || '',
  status: product.productStatus || 'ACTIVE',
  createdAt: product.createdAt,
  updatedAt: product.updatedAt
});

const mapToBackend = (product) => ({
  productId: product.productId || product.id,
  productName: product.name,
  productPartNumber: product.partNumber,
  productSKU: product.sku,
  productCategory: product.category,
  productManufacturer: product.manufacturer,
  productDescription: product.description,
  productSellingPrice: parseFloat(product.sellingPrice) || 0,
  productCostPrice: parseFloat(product.costPrice) || 0,
  productNormalPrice: parseFloat(product.normalPrice) || parseFloat(product.costPrice) || 0,
  productCurrentQuantity: parseInt(product.quantity) || 0,
  productMinimumQuantity: parseInt(product.minQuantity) || 0,
  storageLocation: product.location,
  productSupplierInfo: product.supplierInfo,
  notes: product.notes,
  productStatus: product.status || 'ACTIVE'
});

// =============== Quotation Mapping ===============
const mapQuotationItemToFrontend = (quotationItem) => ({
  id: quotationItem.id,
  productId: quotationItem.product.productId,
  name: quotationItem.product.productName,
  description: quotationItem.product.productDescription,
  sku: quotationItem.product.productSKU,
  partNumber: quotationItem.product.productPartNumber,
  manufacturer: quotationItem.product.productManufacturer,
  category: quotationItem.product.productCategory,
  image: quotationItem.product.productImage,
  quantity: quotationItem.quantity,
  price: quotationItem.unitPrice,
  totalPrice: quotationItem.totalPrice,
  sellingPrice: quotationItem.product.productSellingPrice,
  normalPrice: quotationItem.product.productNormalPrice,
  costPrice: quotationItem.product.productCostPrice
});

const mapQuotationToFrontend = (quotation) => ({
  id: quotation.id || '',
  quotationId: quotation.quotationId || '',
  customerId: quotation.customerId || '',
  customerName: quotation.customerName || '',
  customerEmail: quotation.customerEmail || '',
  customerAddress: quotation.customerAddress || '',
  reference: quotation.reference || '',
  attention: quotation.attention || '',
  validUntil: quotation.validUntil,
  status: quotation.status ? quotation.status.toLowerCase() : 'draft',
  eta: quotation.eta || '',
  description: quotation.notes || '',
  notes: quotation.notes || '',
  terms: quotation.terms || '',
  items: quotation.quotationItems ? quotation.quotationItems.map(mapQuotationItemToFrontend) : [],
  subtotal: quotation.subtotal || 0,
  tax: quotation.tax || 0,
  taxRate: quotation.taxRate || 0,
  discount: quotation.discount || 0,
  discountType: quotation.discountType || 'amount',
  totalAmount: quotation.totalAmount || 0,
  expectedIncome: quotation.expectedIncome || 0,
});

const mapQuotationItemToBackend = (item) => ({
  productId: item.productId || item.id,
  productName: item.name,
  productDescription: item.description,
  productSKU: item.sku,
  productPartNumber: item.partNumber,
  quantity: parseInt(item.quantity) || 0,
  unitPrice: parseFloat(item.price) || 0,
  totalPrice: parseFloat(item.totalPrice) || 0,
  productManufacturer: item.manufacturer,
  productCategory: item.category,
  productImage: item.image
});

const mapQuotationToBackend = (quotation) => ({
  quotationId: quotation.quotationId,
  customerId: quotation.customerId,
  customerName: quotation.customerName,
  customerEmail: quotation.customerEmail,
  customerAddress: quotation.customerAddress,
  reference: quotation.reference,
  attention: quotation.attention,
  validUntil: quotation.validUntil ? new Date(quotation.validUntil) : null,
  status: quotation.status ? quotation.status.toUpperCase() : 'DRAFT',
  eta: quotation.eta,
  notes: quotation.description || quotation.notes,
  terms: quotation.terms,
  items: quotation.items ? quotation.items.map(mapQuotationItemToBackend) : [],
  subtotal: quotation.subtotal,
  tax: quotation.tax,
  taxRate: quotation.taxRate,
  discount: quotation.discount,
  discountType: quotation.discountType,
  totalAmount: quotation.totalAmount,
  expectedIncome: quotation.expectedIncome,
});

// =============== Invoice Mapping ===============
const mapInvoiceItemToFrontend = (invoiceItem) => ({
  id: invoiceItem.id,
  productId: invoiceItem.product.productId,
  name: invoiceItem.product.productName,
  description: invoiceItem.product.productDescription,
  sku: invoiceItem.product.productSKU,
  partNumber: invoiceItem.product.productPartNumber,
  manufacturer: invoiceItem.product.productManufacturer,
  category: invoiceItem.product.productCategory,
  image: invoiceItem.product.productImage,
  quantity: invoiceItem.quantity,
  price: invoiceItem.unitPrice,
  totalPrice: invoiceItem.totalPrice,
  sellingPrice: invoiceItem.product.productSellingPrice,
  normalPrice: invoiceItem.product.productNormalPrice,
  costPrice: invoiceItem.product.productCostPrice
});

const mapInvoiceToFrontend = (invoice) => ({
  id: invoice.id || '',
  invoiceId: invoice.invoiceId || '',
  quotationId: invoice.quotationId || '',
  customerId: invoice.customerId || '',
  customerName: invoice.customerName || '',
  customerEmail: invoice.customerEmail || '',
  customerAddress: invoice.customerAddress || '',
  reference: invoice.reference || '',
  attention: invoice.attention || '',
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  status: invoice.status ? invoice.status.toLowerCase() : 'draft',
  description: invoice.notes || '',
  notes: invoice.notes || '',
  terms: invoice.terms || '',
  items: invoice.invoiceItems ? invoice.invoiceItems.map(mapInvoiceItemToFrontend) : [],
  subtotal: invoice.subtotal || 0,
  tax: invoice.tax || 0,
  taxRate: invoice.taxRate || 0,
  discount: invoice.discount || 0,
  discountType: invoice.discountType || 'amount',
  totalAmount: invoice.totalAmount || 0,
  paymentStatus: invoice.paymentStatus || 'unpaid',
  paymentMethod: invoice.paymentMethod || '',
  paymentDate: invoice.paymentDate || null,
});

const mapInvoiceItemToBackend = (item) => ({
  productId: item.productId || item.id,
  productName: item.name,
  productDescription: item.description,
  productSKU: item.sku,
  productPartNumber: item.partNumber,
  quantity: parseInt(item.quantity) || 0,
  unitPrice: parseFloat(item.price) || 0,
  totalPrice: parseFloat(item.totalPrice) || 0,
  productManufacturer: item.manufacturer,
  productCategory: item.category,
  productImage: item.image
});

const mapInvoiceToBackend = (invoice) => ({
  invoiceId: invoice.invoiceId,
  quotationId: invoice.quotationId,
  customerId: invoice.customerId,
  customerName: invoice.customerName,
  customerEmail: invoice.customerEmail,
  customerAddress: invoice.customerAddress,
  reference: invoice.reference,
  attention: invoice.attention,
  issueDate: invoice.issueDate ? new Date(invoice.issueDate) : null,
  dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
  status: invoice.status ? invoice.status.toUpperCase() : 'DRAFT',
  notes: invoice.description || invoice.notes,
  terms: invoice.terms,
  items: invoice.items ? invoice.items.map(mapInvoiceItemToBackend) : [],
  subtotal: invoice.subtotal,
  tax: invoice.tax,
  taxRate: invoice.taxRate,
  discount: invoice.discount,
  discountType: invoice.discountType,
  totalAmount: invoice.totalAmount,
  paymentStatus: invoice.paymentStatus ? invoice.paymentStatus.toUpperCase() : 'UNPAID',
  paymentMethod: invoice.paymentMethod,
  paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate) : null,
});

// =============== Interceptors and helpers ===============
API.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// =============== Customer APIs ===============
export const fetchCustomers = async (params = {}) => {
  try {
    const response = await API.get(`/customer/v1/find-all`, { params });
    return {
      customers: Array.isArray(response.data.customer) ? response.data.customer : [],
      currentPage: response.data.currentPage,
      totalItems: response.data.totalItems,
      totalPages: response.data.totalPages,
      isFirst: response.data.isFirst,
      isLast: response.data.isLast,
      hasNext: response.data.hasNext,
      hasPrevious: response.data.hasPrevious,
    };
  } catch (error) {
    console.error('Failed to fetch customers:', error.message);
    return {
      customers: [],
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    };
  }
};

export const fetchCustomer = async (id) => {
  const response = await API.get(`/customer/v1/find-by-id/${id}`);
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await API.post('/customer/v1/save-customer', customerData);
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await API.put(`/customer/v1/update/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await API.delete(`/customers/${id}`);
  return response.data;
};

// =============== Product APIs ===============
export const getProductById = async (id) => {
  try {
    const response = await API.get(`/product/v1/get-product-by-id/${id}`);
    return mapToFrontend(response.data);
  } catch (error) {
    throw new Error('Failed to fetch product: ' + error.message);
  }
};

export const createProduct = async (productData) => {
  const response = await API.post('/product/v1/save-product', mapToBackend(productData));
  return response.data;
};

export const searchProductByName = async (query) => {
  try {
    const response = await API.get(`/product/v1/search-by-name?query=${encodeURIComponent(query)}&limit=5`);
    const results = Array.isArray(response.data) ? response.data.map(mapToFrontend) : [];
    return results;
  } catch (error) {
    console.error('Error searching products:', error.message, error.response?.data || error);
    return [];
  }
};

export const fetchProducts = async (params = {}) => {
  try {
    const response = await API.get(`/product/v1/find-all`, { params });
    return {
      products: Array.isArray(response.data.products) ? response.data.products.map(mapToFrontend) : [],
      currentPage: response.data.currentPage,
      totalItems: response.data.totalItems,
      totalPages: response.data.totalPages,
      isFirst: response.data.isFirst,
      isLast: response.data.isLast,
      hasNext: response.data.hasNext,
      hasPrevious: response.data.hasPrevious,
    };
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
    return {
      products: [],
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    };
  }
};

export const sendExcelFileToBackend = async (file) => {
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file: Please provide a valid Excel file.');
  }
  const formData = new FormData();
  formData.append('file', file);
  const response = await API.post('/product/v1/batch-excel-save', formData);
  if (!response.data) throw new Error('No data received from the backend.');
  return response.data;
};

export const updateProduct = async (id, product) => {
  await API.put(`/product/v1/update/${id}`, mapToBackend(product));
};

export const deleteProduct = async (id) => {
  await API.delete(`/product/v1/${id}`);
};

export const searchProductByPartNumber = async (partNumber) => {
  try {
    const response = await API.get(`/product/v1/search`, { params: { partNumber } });
    return mapToFrontend(response.data);
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw new Error('Failed to search product: ' + error.message);
  }
};

// =============== Quotation APIs ===============
export const fetchQuotations = async (params = {}) => {
  try {
    const response = await API.get(`/quotation/v1/find-all`, { params });
    return {
      quotations: Array.isArray(response.data.quotation) ? response.data.quotation : [],
      currentPage: response.data.currentPage,
      totalItems: response.data.totalItems,
      totalPages: response.data.totalPages,
      isFirst: response.data.isFirst,
      isLast: response.data.isLast,
      hasNext: response.data.hasNext,
      hasPrevious: response.data.hasPrevious,
    };
  } catch (_) {
    return {
      quotations: [],
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    };
  }
};

export const fetchQuotation = async (id) => {
  const response = await API.get(`/quotation/v1/find/${id}`);
  return mapQuotationToFrontend(response.data);
};

export const createQuotation = async (quotationData) => {
  const response = await API.post('/quotation/v1/save-quotation', mapQuotationToBackend(quotationData));
  return response.data;
};

export const getLastQuotationId = async () => {
  const response = await API.get('/quotation/v1/get-last-id');
  return response.data;
};

export const updateQuotation = async (id, quotationData) => {
  const response = await API.put(`/quotation/v1/update/${id}`, mapQuotationToBackend(quotationData));
  return response.data;
};

export const deleteQuotation = async (id) => {
  const response = await API.delete(`/quotation/v1/delete/${id}`);
  return response.data;
};

export const restoreQuotation = async (quotationData) => {
  const response = await API.post('/quotation/v1/restore', quotationData);
  return response.data;
};

export const printAndSendQuotation = async (quotation, printAndSendData) => {
  const quotationId = typeof quotation === 'string' ? quotation : (quotation?.quotationId || quotation?.id);
  if (!quotationId) throw new Error('Invalid quotation reference: missing quotationId');
  const payload = {
    quotation: typeof quotation === 'string' ? { quotationId } : mapQuotationToBackend(quotation),
    request: printAndSendData,
  };
  const response = await API.post(`/quotation/v1/print-and-send/${encodeURIComponent(quotationId)}`, payload);
  return response.data;
};

// =============== PO APIs ===============
export const fetchPOs = async (params = {}) => {
  const response = await API.get('/po/v1/find-all', { params });
  // Backend returns plain list; adapt to list result
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchPO = async (id) => {
  const response = await API.get(`/po/v1/find/${id}`);
  return response.data;
};

export const createPO = async (po, file) => {
  const form = new FormData();
  form.append('po', new Blob([JSON.stringify(po)], { type: 'application/json' }));
  if (file) form.append('file', file);
  const response = await API.post('/po/v1/save', form);
  return response.data;
};

export const updatePO = async (id, po, file) => {
  const form = new FormData();
  form.append('po', new Blob([JSON.stringify(po)], { type: 'application/json' }));
  if (file) form.append('file', file);
  const response = await API.put(`/po/v1/update/${id}`, form);
  return response.data;
};

export const deletePO = async (id) => {
  await API.delete(`/po/v1/delete/${id}`);
};

export const uploadPOFile = async (id, file) => {
  const form = new FormData();
  form.append('file', file);
  const response = await API.post(`/po/v1/${id}/upload-file`, form);
  return response.data; // returns URL
};

export const getPOFileUrl = (id) => `/po/v1/${id}/file`;

// Expenses
export const listPOExpenses = async (poId) => {
  const response = await API.get(`/po/v1/${poId}/expenses`);
  return Array.isArray(response.data) ? response.data : [];
};

export const createPOExpense = async (poId, expense) => {
  const response = await API.post(`/po/v1/${poId}/expenses`, expense);
  return response.data;
};

export const updatePOExpense = async (expenseId, expense) => {
  const response = await API.put(`/po/v1/expenses/${expenseId}`, expense);
  return response.data;
};

export const deletePOExpense = async (expenseId) => {
  await API.delete(`/po/v1/expenses/${expenseId}`);
};

// =============== Invoice APIs ===============
export const fetchInvoices = async (params = {}) => {
  try {
    const response = await API.get(`/invoice/v1/find-all`, { params });
    return {
      invoices: Array.isArray(response.data.invoice) ? response.data.invoice : [],
      currentPage: response.data.currentPage,
      totalItems: response.data.totalItems,
      totalPages: response.data.totalPages,
      isFirst: response.data.isFirst,
      isLast: response.data.isLast,
      hasNext: response.data.hasNext,
      hasPrevious: response.data.hasPrevious,
    };
  } catch (error) {
    console.error('Failed to fetch invoices:', error.message);
    return {
      invoices: [],
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
      hasNext: false,
      hasPrevious: false,
    };
  }
};

export const fetchInvoice = async (id) => {
  const response = await API.get(`/invoice/v1/find-by-id/${id}`);
  return mapInvoiceToFrontend(response.data);
};

export const fetchInvoiceById = async (id) => {
  const response = await API.get(`/invoice/v1/find/${id}`);
  return mapInvoiceToFrontend(response.data);
};

export const createInvoice = async (invoiceData) => {
  const response = await API.post('/invoice/v1/save-invoice', mapInvoiceToBackend(invoiceData));
  return response.data;
};

export const getLastInvoiceId = async () => {
  const response = await API.get('/invoice/v1/get-last-id');
  return response.data;
};

export const updateInvoice = async (id, invoiceData) => {
  const response = await API.put(`/invoice/v1/update/${id}`, mapInvoiceToBackend(invoiceData));
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await API.delete(`/invoice/v1/delete/${id}`);
  return response.data;
};

export const updateInvoicePaymentStatus = async (id, paymentStatus, paymentMethod, paymentDate) => {
  const response = await API.put(`/invoice/v1/update-payment/${id}`, {
    paymentStatus,
    paymentMethod,
    paymentDate: paymentDate ? new Date(paymentDate) : null,
  });
  return response.data;
};
