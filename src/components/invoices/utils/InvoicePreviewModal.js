import React from 'react';
import PropTypes from 'prop-types';

const QuotationPreviewModal = ({ quotation, isOpen, onClose, loading, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Quotation Preview: {quotation?.quotationId || 'N/A'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={loading}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Quotation Content */}
        {!loading && !error && quotation && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-medium text-gray-700">Customer Information</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Name:</span> {quotation.customerName || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {quotation.customerEmail || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Address:</span> {quotation.customerAddress || 'N/A'}
                </p>
              </div>
            </div>

            {/* Quotation Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-700">Quotation Details</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Quotation ID:</span> {quotation.quotationId || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span>{' '}
                  {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Valid Until:</span>{' '}
                  {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Attention:</span> {quotation.attention || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">RFQ:</span> {quotation.reference || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      quotation.status?.toLowerCase() === 'accepted' ||
                      quotation.status?.toLowerCase() === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : quotation.status?.toLowerCase() === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : quotation.status?.toLowerCase() === 'sent' ||
                          quotation.status?.toLowerCase() === 'pending'
                        ? 'bg-blue-100 text-blue-800'
                        : quotation.status?.toLowerCase() === 'expired'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {quotation.status || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-700">Items</h3>
              {quotation.items && quotation.items.length > 0 ? (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quotation.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.description || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity || 0}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ${typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : '0.00'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            ${typeof item.total === 'number' ? item.total.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">No items found.</p>
              )}
            </div>

            {/* Financial Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-700">Financial Summary</h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Subtotal:</span>{' '}
                  ${typeof quotation.subtotal === 'number' ? quotation.subtotal.toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Discount:</span>{' '}
                  ${typeof quotation.discount === 'number' ? quotation.discount.toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tax:</span>{' '}
                  ${typeof quotation.tax === 'number' ? quotation.tax.toFixed(2) : '0.00'} (
                  {typeof quotation.taxRate === 'number' ? `${quotation.taxRate}%` : '0%'})
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  <span className="font-semibold">Total Amount:</span>{' '}
                  ${typeof quotation.totalAmount === 'number' ? quotation.totalAmount.toFixed(2) : '0.00'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Expected Income:</span>{' '}
                  ${typeof quotation.expectedIncome === 'number' ? quotation.expectedIncome.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

QuotationPreviewModal.propTypes = {
  quotation: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default QuotationPreviewModal;