import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchCustomers, deleteCustomer } from '../../services/api';
import DataExport from '../common/DataExport';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const params = {
          pageNo,
          pageSize,
          search: searchTerm,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          industry: filterIndustry !== 'all' ? filterIndustry : undefined,
        };

        const data = await fetchCustomers(params);
        setCustomers(data.customers);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalItems: data.totalItems,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        });
        setError('');
      } catch (err) {
        setError('Failed to load customers. Please try again.');
        console.error('Error loading customers:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [pageNo, searchTerm, filterStatus, filterIndustry, pageSize]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        await deleteCustomer(id);
        setCustomers(customers.filter(customer => customer.id !== id));
      } catch (err) {
        setError('Failed to delete customer. Please try again.');
        console.error('Error deleting customer:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPageNo(newPage);
    }
  };

  // Get unique industries for filter
  const industries = [...new Set(customers.map(customer => customer.industry))].filter(Boolean);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Customers</h1>
        <Link
          to="/customers/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add New Customer
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                <select
                  id="statusFilter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lead">Lead</option>
                  <option value="prospect">Prospect</option>
                </select>
              </div>
              <div>
                <label htmlFor="industryFilter" className="mr-2 text-sm font-medium text-gray-700">Industry:</label>
                <select
                  id="industryFilter"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                >
                  <option value="all">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {pagination.totalItems} {pagination.totalItems === 1 ? 'customer' : 'customers'} found
              </div>
              <DataExport 
                data={customers}
                fileName={`customers-export-${new Date().toISOString().split('T')[0]}`}
                title="ALMAAKCORP Customers Report"
                columns={[
                  { header: 'Company Name', key: 'name' },
                  { header: 'Contact Person', key: 'contactPerson' },
                  { header: 'Email', key: 'email' },
                  { header: 'Phone', key: 'phone' },
                  { header: 'Industry', key: 'industry' },
                  { header: 'Status', key: 'status' },
                  { header: 'Website', key: 'website' },
                  { header: 'Address', key: 'address' },
                  { header: 'Last Interaction', key: 'lastInteraction', formatter: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
                  { header: 'Notes', key: 'notes' }
                ]}
                excelButtonText="Export to Excel"
                pdfButtonText="Export to PDF"
              />
            </div>
            <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
                            <button
                                disabled={pagination.isFirst}
                                onClick={() => handlePageChange(pageNo - 1)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
                            <button
                                disabled={pagination.isLast}
                                onClick={() => handlePageChange(pageNo + 1)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Interaction
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-800 font-medium text-lg">
                              {customer.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {customer.website || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.contactPerson || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{customer.email || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{customer.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.industry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 
                            customer.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                            customer.status === 'lead' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {customer.lastInteraction ? new Date(customer.lastInteraction).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/customers/edit/${customer.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {customers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No customers found matching your search criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
