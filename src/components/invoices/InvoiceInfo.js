// src/components/InvoiceForm/InvoiceInfo.jsx
import React from 'react';

const InvoiceInfo = ({ formData, handleChange }) => (
  <div>
    <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Information</h2>
    <div className="space-y-4">
      <input type='hidden' name='id' id='id' value={formData.id} onChange={handleChange}/>
      <div>
        <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700">
          Invoice ID
        </label>
        <input
          type="text"
          name="invoiceId"
          id="invoiceId"
          required
          value={formData.invoiceId}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
          Reference
        </label>
        <input
          type="text"
          name="reference"
          id="reference"
          value={formData.reference}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="attention" className="block text-sm font-medium text-gray-700">
          Attention
        </label>
        <input
          type="text"
          name="attention"
          id="attention"
          value={formData.attention}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
            Issue Date
          </label>
          <input
            type="date"
            name="issueDate"
            id="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          required
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <div>
        <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
          Quotation Number
        </label>
        <input
          type="text"
          name="reference"
          id="reference"
          value={formData.quotationNumber}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="attention" className="block text-sm font-medium text-gray-700">
          Requester
        </label>
        <input
          type="text"
          name="attention"
          id="attention"
          value={formData.requester}
          onChange={handleChange}
          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
      </div>
    </div>
  </div>
);

export default InvoiceInfo;