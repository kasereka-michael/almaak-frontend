import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchQuotation, fetchQuotations, deleteQuotation ,fetchQuotationyById} from '../../services/api';
import { generateQuotationPdf } from '../../utils/exportUtils';
import QuotationPreviewModal from '../quotations/utils/QuotationPreviewModal';

const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  });
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);

  // Modal state
  const [previewQuotation, setPreviewQuotation] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    const loadQuotations = async () => {
      try {
        setLoading(true);
        const params = {
          pageNo,
          pageSize,
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
        };
        const data = await fetchQuotations(params);
        console.info('Quotations data:', data);
        setQuotations(data.quotations);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          isFirst: data.isFirst,
          isLast: data.isLast,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        });
        setError('');
      } catch (err) {
        setError('Failed to load quotations. Please try again.');
        console.error('Error loading quotations:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();
  }, [pageNo, searchTerm, filterStatus, dateRange.start, dateRange.end]);

  const handlePageChange = (newPage) => {
    setPageNo(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        setLoading(true);
        await deleteQuotation(id);
        setQuotations(quotations.filter((quotation) => quotation.id !== id));
      } catch (err) {
        setError('Failed to delete quotation. Please try again.');
        console.error('Error deleting quotation:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreViewQuotation = async (id) => {
    try {
      setPreviewLoading(true);
      setPreviewError('');
      const quotation = await fetchQuotation(id);
      console.log('Preview quotation data:', quotation);
      if (!quotation || Object.keys(quotation).length === 0) {
        throw new Error('No quotation data received');
      }
      setPreviewQuotation(quotation);
      setIsPreviewModalOpen(true);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load quotation preview. Please try again.';
      setPreviewError(errorMessage);
      console.error('Error fetching quotation for preview:', err);
      setIsPreviewModalOpen(true); // Show error in modal
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewQuotation(null);
    setPreviewError('');
  };

  const handlePrintQuotation = async (id, printMode = true) => {
    try {
      setLoading(true);
      console.log('Fetching quotation data for ID:', id);
      const quotationData = await fetchQuotationyById(id);
      console.log('Quotation data received:', quotationData);
      if (!quotationData) {
        throw new Error('No quotation data received');
      }
      const result = generateQuotationPdf(quotationData, printMode);
      if (!result) {
        throw new Error('PDF generation failed');
      }
      console.log('PDF generation successful');
    } catch (err) {
      setError('Failed to generate printable quotation. Please try again.');
      console.error('Error generating quotation PDF:', err);
      alert(`Error: ${err.message || 'Failed to generate PDF'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value,
    });
  };

  // Client-side filtering for display (only for search and status if needed)
  const filteredQuotations = quotations.filter((quotation) => {
    const quotationId = quotation.quotationId || `QT-${quotation.id.toString().padStart(5, '0')}`;
    const customerName = quotation.customerName || '';
    const description = quotation.description || '';
    const status = quotation.status ? quotation.status.toLowerCase() : '';

    const matchesSearch =
      quotationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || status === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Quotations</h1>
        <Link
          to="/quotations/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create New Quotation
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search quotations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-700">
                  From Date
                </label>
                <input
                  type="date"
                  name="start"
                  id="start"
                  value={dateRange.start}
                  onChange={handleDateRangeChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-700">
                  To Date
                </label>
                <input
                  type="date"
                  name="end"
                  id="end"
                  value={dateRange.end}
                  onChange={handleDateRangeChange}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
          <button
            disabled={pagination.isFirst}
            onClick={() => handlePageChange(pageNo - 1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage + 1} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.isLast}
            onClick={() => handlePageChange(pageNo + 1)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quotation ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Attention / RFQ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.quotationId || `QT-${quotation.id.toString().padStart(5, '0')}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quotation.customerName}</div>
                      {quotation.customerEmail && (
                        <div className="text-xs text-gray-500">{quotation.customerEmail}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Valid until:{' '}
                        {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{quotation.attention}</div>
                      {quotation.reference && (
                        <div className="text-xs text-gray-500">{quotation.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${typeof (quotation.totalAmount || quotation.total) === 'number'
                          ? (quotation.totalAmount || quotation.total).toFixed(2)
                          : '0.00'}
                      </div>
                      <div className="text-xs font-medium text-green-800">
                        Expected Income: $
                        {typeof (quotation.expectedIncome || quotation.total) === 'number'
                          ? (quotation.expectedIncome || quotation.total).toFixed(2)
                          : '0.00'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          !quotation.status
                            ? 'bg-gray-100 text-gray-800'
                            : quotation.status.toLowerCase() === 'accepted' ||
                              quotation.status.toLowerCase() === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : quotation.status.toLowerCase() === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : quotation.status.toLowerCase() === 'sent' ||
                              quotation.status.toLowerCase() === 'pending'
                            ? 'bg-blue-100 text-blue-800'
                            : quotation.status.toLowerCase() === 'expired'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quotation.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/quotations/edit/${quotation.quotationId}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(quotation.id)}
                        className="text-red-600 hover:text-red-900 mr-2"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handlePrintQuotation(quotation.id, true)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Print
                      </button>
                      <button
                        onClick={() => handlePreViewQuotation(quotation.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredQuotations.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      No quotations found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <QuotationPreviewModal
        quotation={previewQuotation}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreviewModal}
        loading={previewLoading}
        error={previewError}
      />
    </div>
  );
};

export default QuotationList;