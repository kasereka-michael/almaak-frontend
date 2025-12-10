import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPOs, deletePO, getPOFileUrl } from '../../services/api';

const POList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const params = {
          pageNo,
          pageSize,
          search: searchTerm || undefined,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
        };
        const data = await fetchPOs(params);
        if (Array.isArray(data)) {
          setItems(data);
          setPagination({ currentPage: 0, totalPages: 1, isFirst: true, isLast: true, hasNext: false, hasPrevious: false });
        } else {
          // Expect shape similar to quotations if backend supports it
          setItems(Array.isArray(data.items) ? data.items : []);
          setPagination({
            currentPage: data.currentPage ?? 0,
            totalPages: data.totalPages ?? 1,
            isFirst: data.isFirst ?? true,
            isLast: data.isLast ?? true,
            hasNext: data.hasNext ?? false,
            hasPrevious: data.hasPrevious ?? false,
          });
        }
        setError('');
      } catch (e) {
        setError('Failed to load POs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm, dateRange.start, dateRange.end, pageNo, pageSize]);

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PO?')) return;
    try {
      setLoading(true);
      await deletePO(id);
      setItems(prev => prev.filter(x => x.poiId !== id));
      setSuccess('PO deleted successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (e) {
      setError('Failed to delete PO. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(po => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return true;
    const poNum = String(po.poNumber || '').toLowerCase();
    const rfq = String(po.rfqNumber || '').toLowerCase();
    const quoteId = po.quotationId != null ? String(po.quotationId).toLowerCase() : '';
    return poNum.includes(q) || rfq.includes(q) || quoteId.includes(q);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Purchase Orders</h1>
        <div className="flex space-x-3">
          <Link
            to="/pos/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Create New PO
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
            </div>
            <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            </div>
            <div className="ml-3"><p className="text-sm text-green-700">{success}</p></div>
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
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search POs..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPageNo(0); }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Date</label>
                  <input
                    type="date"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={dateRange.start}
                    onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setPageNo(0); }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Date</label>
                  <input
                    type="date"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={dateRange.end}
                    onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setPageNo(0); }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
          <button
            disabled={pagination.isFirst}
            onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage + 1} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.isLast}
            onClick={() => setPageNo((p) => p + 1)}
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFQ Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotation ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Po Amount vs Income</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((po) => (
                  <tr key={po.poiId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{po.poNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{po.rfqNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{po.quotationId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${po.delivered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {po.delivered ? 'Delivered' : 'Pending'}
                      </span>
                      {po.deliveredAt && (
                        <div className="text-xs text-gray-500">{new Date(po.deliveredAt).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${po.paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {po.paid ? 'Paid' : 'Unpaid'}
                      </span>
                      {po.paidAt && (
                        <div className="text-xs text-gray-500">{new Date(po.paidAt).toLocaleDateString()}</div>
                      )}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{'$'}{po.poTotalAmount}</div>

                          {(() => {
                              const total = Number(po.poTotalAmount) || 0;
                              const income = Number(po.income) || 0;
                              const percent = total !== 0 ? (income / total) * 100 : 0;

                              let colorClass = '';

                              if (income < 0) {
                                  colorClass = 'bg-red-100 text-red-800';
                              } else if (percent < 10) {
                                  colorClass = 'bg-yellow-100 text-yellow-800';
                              } else if (percent >= 10 && percent <= 15) {
                                  colorClass = 'bg-green-100 text-green-800';
                              } else if (percent > 15) {
                                  colorClass = 'bg-green-200 text-green-900';
                              } else {
                                  colorClass = 'bg-gray-100 text-gray-800';
                              }

                              return (
                                  <span
                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}
                                  >
                            <div className="text-sm font-medium text-gray-900">{'$'}{po.income}</div>
                          </span>
                              );
                          })()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/pos/edit/${po.poiId}`} className="text-indigo-600 hover:text-indigo-900 mr-2">Edit</Link>
                      <button onClick={() => onDelete(po.poId)} className="text-red-600 hover:text-red-900 mr-2">Delete</button>
                      {po.fileUrl && (
                        <a className="text-green-700" href={getPOFileUrl(po.poId)} target="_blank" rel="noreferrer">View</a>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No POs found matching your search</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default POList;
