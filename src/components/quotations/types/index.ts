// src/components/InvoiceForm/types/index.ts
export interface FormData {
    quotationId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    reference: string;
    attention: string;
    validUntil: string;
    status: string;
    description: string;
    notes: string;
    terms: string;
    items: Item[];
    subtotal: number;
    tax: number;
    taxRate: number;
    discount: number;
    discountType: 'amount' | 'percentage';
    totalAmount: number;
    expectedIncome: number;
  }
  
  export interface Item {
    id: number;
    productId: string;
    name: string;
    description: string;
    partNumber: string;
    manufacturer: string;
    quantity: number;
    price: number;
    normalPrice: number;
    totalPrice: number;
  }
  
  export interface Customer {
    id: string;
    name: string;
    email: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
  
  export interface Product {
    id: string;
    name: string;
    description: string;
    partNumber: string;
    manufacturer: string;
    sellingPrice: number;
    normalPrice: number;
    costPrice: number;
  }