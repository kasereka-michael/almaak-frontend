// src/components/QuotationForm/TotalsSection.jsx
import React from 'react';

const TotalsSection = ({ formData, handleChange }) => (
  <div className="md:col-span-2 border-t border-gray-200 pt-6">
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">


      <div>
          <label htmlFor="attention" className="block text-sm font-medium text-gray-700">
            ETA: 
          </label>
          <input
            type="text"
            name="eta"
            id="attention"
            value={formData.eta}
            onChange={handleChange}
            className="mt-1 focus:ring-indigo-500 mb-5 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>




        <h2 className="text-lg font-medium text-gray-900 mb-4">Terms & Notes</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows="3"
              value={formData.notes || ''}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Any notes for the customer"
            />
          </div>
          <div>
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <textarea
              name="terms"
              id="terms"
              rows="3"
              value={formData.terms || ''}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Terms and conditions for this quotation"
            />
          </div>
        </div>
      </div>
      <div className="w-full md:w-80">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Totals</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Subtotal:</span>
              <span className="text-sm font-medium">${(formData.subtotal || 0).toFixed(2)}</span>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Discount:</span>
                <div className="flex items-center space-x-2">
                  <select
                    name="discountType"
                    value={formData.discountType || 'amount'}
                    onChange={handleChange}
                    className="block py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  >
                    <option value="amount">$</option>
                    <option value="percentage">%</option>
                  </select>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    step={formData.discountType === 'percentage' ? '0.1' : '0.01'}
                    value={formData.discount === '' ? '' : formData.discount || 0}
                    onChange={handleChange}
                    className="block w-20 py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-sm font-medium">-${(formData.discount || 0).toFixed(2)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tax:</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    name="taxRate"
                    min="0"
                    step="0.1"
                    value={formData.taxRate === '' ? '' : formData.taxRate || 0}
                    onChange={handleChange}
                    className="block w-16 py-1 px-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <div className="flex justify-end">
                <span className="text-sm font-medium">${(formData.tax || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                <span className="text-base font-bold text-gray-900">${(formData.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200 bg-gray-100 p-2 rounded">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Expected Income:</span>
                <span className="text-sm font-medium text-green-600">${(formData.expectedIncome || 0).toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                (This information is not shown on customer quotations)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TotalsSection;