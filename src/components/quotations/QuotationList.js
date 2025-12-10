import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchQuotation, fetchQuotations, deleteQuotation } from '../../services/api';
import { generateQuotationPdf, generateSentQuotationsSummaryPdf } from '../../utils/exportUtils';
import QuotationPreviewModal from '../quotations/utils/QuotationPreviewModal';
import ColumnSelector from './ColumnSelector';
import { TrashService } from '../../services/trashService';

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

  // Column selector state
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [quotationToPrint, setQuotationToPrint] = useState(null);

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
    const quotation = quotations.find(q => q.id === id);
    const quotationName = quotation ? `${quotation.quotationId} - ${quotation.customerName}` : `Quotation ${id}`;
    
    if (window.confirm(`Are you sure you want to delete ${quotationName}? It will be moved to trash and can be restored later.`)) {
      try {
        setLoading(true);
        await deleteQuotation(id);
        setQuotations(quotations.filter((quotation) => quotation.id !== id));
          setSuccess(`Quotation ${quotation.id} has been moved to trash successfully.`);
        
        // Show notification
        TrashService.showNotification(
          `Quotation moved to trash successfully. You can restore it from the trash if needed.`,
          'success'
        );
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      } catch (err) {
        setError('Failed to delete quotation. Please try again.');
        console.error('Error deleting quotation:', err);
        
        // Show error notification
        TrashService.showNotification(
          'Failed to delete quotation. Please try again.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTestTrash = async () => {
    try {
      setLoading(true);
      const testItem = await TrashService.createTestTrashItem();
      setSuccess(`Test trash item created successfully: ${testItem.entityName}`);
      
      // Show notification
      TrashService.showNotification(
        `Test trash item created successfully! Check the trash to see it.`,
        'success'
      );
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Failed to create test trash item. Please try again.');
      console.error('Error creating test trash item:', err);
      
      // Show error notification
      TrashService.showNotification(
        'Failed to create test trash item. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
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

  const handlePrintQuotation = async (id) => {
    try {
      setLoading(true);
      console.log('Fetching quotation data for ID:', id);
      const quotationData = await fetchQuotation(id);
      console.log('Quotation data received:', quotationData);
      if (!quotationData) {
        throw new Error('No quotation data received');
      }
      
      // Store quotation data and open column selector
      setQuotationToPrint(quotationData);
      setIsColumnSelectorOpen(true);
    } catch (err) {
      setError('Failed to load quotation data. Please try again.');
      console.error('Error fetching quotation data:', err);
      alert(`Error: ${err.message || 'Failed to load quotation'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSelectorConfirm = async (selectedColumns, printMode) => {
    try {
      if (!quotationToPrint) {
        throw new Error('No quotation data available');
      }
      
      console.log('Generating PDF with selected columns:', selectedColumns);
      await generateQuotationPdf(quotationToPrint, printMode, selectedColumns);
      console.log('PDF generation successful');
      setSuccess('PDF generated successfully!');
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('Error generating quotation PDF:', err);
      alert(`Error: ${err.message || 'Failed to generate PDF'}`);
    }
  };

  const handleColumnSelectorClose = () => {
    setIsColumnSelectorOpen(false);
    setQuotationToPrint(null);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value,
    });
  };

  // Client-side filtering for display (only for search and status if needed)
  // Strengthened search: ensure string-based ID matching, include attention/reference,
  // and support strong (exact) and swift (prefix/contains) matching.
  const filteredQuotations = quotations.filter((quotation) => {
    // Always treat all fields as strings for comparison
    const idRaw = quotation?.id != null ? String(quotation.id) : '';
    const quotationIdRaw = quotation?.quotationId != null ? String(quotation.quotationId) : '';
    // Build a canonical public ID as string
    const canonicalId = quotationIdRaw || (idRaw ? `QT-${idRaw.padStart(5, '0')}` : '');

    const customerName = quotation?.customerName ? String(quotation.customerName) : '';
    const description = quotation?.description ? String(quotation.description) : '';
    const attention = quotation?.attention ? String(quotation.attention) : '';
    const reference = quotation?.reference ? String(quotation.reference) : '';

    const status = quotation?.status ? String(quotation.status).toLowerCase() : '';

    const q = (searchTerm || '').trim().toLowerCase();

    // If no search term, only apply status filter
    if (!q) {
      const matchesStatusOnly = filterStatus === 'all' || status === filterStatus.toLowerCase();
      return matchesStatusOnly;
    }

    // Pre-normalize searchable fields once (swift)
    const idLower = canonicalId.toLowerCase();
    const customerLower = customerName.toLowerCase();
    const descriptionLower = description.toLowerCase();
    const attentionLower = attention.toLowerCase();
    const referenceLower = reference.toLowerCase();

    // Strong exact match first for ID and reference-like tokens
    const strongMatch =
      q === idLower ||
      q === referenceLower ||
      // Also support exact match on raw numeric id as string (e.g., "123" matches id 123)
      q === idRaw.toLowerCase();

    // Swift prefix or contains matching across key fields
    const swiftMatch =
      idLower.startsWith(q) ||
      referenceLower.startsWith(q) ||
      customerLower.includes(q) ||
      descriptionLower.includes(q) ||
      attentionLower.includes(q);

    const matchesSearch = strongMatch || swiftMatch;
    const matchesStatus = filterStatus === 'all' || status === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Quotations</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleTestTrash}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Test Trash
          </button>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                // Determine last 7 days
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - 6); // include today + previous 6 days

                // Attempt to fetch quotations with server-side filtering (status=sent, date range)
                // Fallback to client-side filter on current page data if backend doesn't support
                let sentQuotations = [];
                try {
                  const params = {
                    pageNo: 0,
                    pageSize: 1000,
                    status: 'sent',
                    startDate: start.toISOString().slice(0, 10),
                    endDate: end.toISOString().slice(0, 10),
                  };
                  const data = await fetchQuotations(params);
                  sentQuotations = Array.isArray(data.quotations) ? data.quotations : [];
                } catch (e) {
                  console.warn('Fallback to client-side filtering for sent quotations summary:', e);
                  sentQuotations = quotations
                    .filter(q => (q.status || '').toLowerCase() === 'sent')
                    .filter(q => {
                      const created = q.createdAt ? new Date(q.createdAt) : null;
                      if (!created) return false;
                      return created >= start && created <= end;
                    });
                }

                await generateSentQuotationsSummaryPdf(sentQuotations, {
                  startDate: start.toISOString().slice(0, 10),
                  endDate: end.toISOString().slice(0, 10),
                });
              } catch (err) {
                setError('Failed to generate sent quotations summary.');
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center"
            title="Print summary of sent quotations for the last 7 days"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8M6 6h12v4H6zM6 14h12v4H6z" />
            </svg>
            Print 7-day Sent Summary
          </button>
          <Link
            to="/trash"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            View Trash
          </Link>
          <Link
            to="/quotations/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Create New Quotation
          </Link>
        </div>
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

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
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
                        to={`/quotations/edit/${quotation.id}`}
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
                        onClick={() => handlePrintQuotation(quotation.id)}
                        className="text-green-600 hover:text-green-900 mr-2"
                        title="Print with column selection"
                      >
                        📄 Print
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

      {/* Column Selector Modal */}
      <ColumnSelector
        isOpen={isColumnSelectorOpen}
        onClose={handleColumnSelectorClose}
        onConfirm={handleColumnSelectorConfirm}
        quotation={quotationToPrint}
      />
    </div>
  );
};

export default QuotationList;