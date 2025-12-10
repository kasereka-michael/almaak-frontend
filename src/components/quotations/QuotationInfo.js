import React from 'react';

const QuotationInfo = ({ formData, handleChange }) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Set to tomorrow
  const minDate = tomorrow.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quotation Information</h2>
      <div className="space-y-4">
        <input type='hidden' name='id' id='id' value={formData.id} onChange={handleChange} />
        <div>
          <label htmlFor="quotationId" className="block text-sm font-medium text-gray-700">
            Quotation ID
          </label>
          <input
            type="text"
            name="quotationId"
            id="quotationId"
            required
            value={formData.quotationId}
            onChange={handleChange}
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
            Valid Until
          </label>
          <input
            type="date"
            name="validUntil"
            id="validUntil"
            required
            value={formData.validUntil}
            onChange={handleChange}
            min={minDate} // Restrict dates to tomorrow and beyond
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
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
      </div>
    </div>
  );
};

export default QuotationInfo;