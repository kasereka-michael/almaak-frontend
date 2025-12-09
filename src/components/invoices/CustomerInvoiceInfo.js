// src/components/QuotationForm/CustomerInfo.jsx
import React from 'react';

const CustomerInfo = ({ formData, customers, handleCustomerChange }) => (




  <div>
  
    <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
    <div className="space-y-4">
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
          Customer
        </label>
        <select
          name="customerId"
          id="customerId"
          required
          value={formData.id}
          onChange={handleCustomerChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >

          {
           
          
          console.log("here i am as customer :: ", customers)}

          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          name="customerName"
          id="customerName"
          readOnly
          value={formData.customerName}
          className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
          Customer Email
        </label>
        <input
          type="email"
          name="customerEmail"
          id="customerEmail"
          readOnly
          value={formData.customerEmail || ''}
          className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="customerAddress" className="block text-sm font-medium text-gray-700">
          Customer Address
        </label>
        <textarea
          name="customerAddress"
          id="customerAddress"
          readOnly
          value={formData.customerAddress}          
          rows="3"
          className="mt-1 bg-gray-50 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>
  </div>
);

export default CustomerInfo;