// src/components/InvoiceForm/utils/constants.js
export const initialFormData = {
    id:'',
    invoiceId: '',
    quotationNumber:'',
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    requester: '',
    po: '',
    status: 'draft',
    description: '',
    notes: '',
    terms: '',
    items: [],
    subtotal: 0,
    tax: 0,
    taxRate: 0,
    discount: 0,
    discountType: 'amount',
    totalAmount: 0,
    expectedIncome: 0,
  };
  
  export const pdfConstants = {
    margin: 12.7, // 0.5 inches = 12.7mm
    pageWidth: 210, // A4 width in mm
    pageHeight: 297, // A4 height in mm
  };