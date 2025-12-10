import React, { memo, useCallback, useState, useEffect } from 'react';
import Select from 'react-select';
import { debounce } from 'lodash';
import { searchProductByName } from './../../services/api';

// Define debounced search function outside the component
const debouncedSearch = debounce(async (query, setSearchResults, setIsLoading) => {
  if (!query || query.length < 2) {
    setSearchResults([]);
    return;
  }
  try {
    setIsLoading(true);
    const results = await searchProductByName(query);
    const formattedResults = Array.isArray(results)
        ? results.map((product) => ({
          id: product.id?.toString() || '',
          name: product.name || 'Unnamed Product',
        }))
        : [];
    console.log('Formatted search results:', formattedResults);
    setSearchResults(formattedResults);
  } catch (error) {
    console.error('Error fetching search results:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
}, 300);

const ItemsTable = memo(({ formData, products = [], handleAddItem, handleRemoveItem, handleItemChange }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debug searchResults
  useEffect(() => {
    console.log('searchResults updated:', searchResults);
  }, [searchResults]);

  // Debug formData.items
  useEffect(() => {
    console.log('formData.items updated:', formData.items);
  }, [formData.items]);

  // Handle input change in Select
  const handleInputChange = useCallback((inputValue) => {
    debouncedSearch(inputValue, setSearchResults, setIsLoading);
    return inputValue;
  }, []); // Empty dependency array since debouncedSearch is stable

  // Handlers for text fields (description, manufacturer, partNumber)
  const handleItemChangeText = useCallback(
      (e, id, field) => {
        console.log('handleItemChangeText:', { field, value: e.target.value, id });
        handleItemChange(e, id, field);
      },
      [handleItemChange]
  );

  // Handlers for numeric fields (price, quantity)
  const handleItemChangeNumeric = useCallback(
      (e, id, field) => {
        console.log('handleItemChangeNumeric:', { field, value: e.target.value, id });
        handleItemChange(e, id, field);
      },
      [handleItemChange]
  );

  const selectStyles = {
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  return (
      <div className="md:col-span-2 border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Invoice Items</h2>
          <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
              />
            </svg>
            Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              {['No.', 'Description','Unit Price', 'Qty', 'Total', 'Actions'].map(
                  (title) => (
                      <th
                          key={title}
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {title}
                      </th>
                  )
              )}
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {formData.items.length > 0 ? (
                formData.items.map((item, index) => {
                  const selectedProduct = [...products, ...searchResults].find(
                      (p) => p.id?.toString() === item.productId?.toString()
                  );

                  return (
                      <tr key={item.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <Select
                              options={searchResults.map((product) => ({
                                value: product.id,
                                label: product.name,
                              }))}
                              value={
                                selectedProduct
                                    ? {
                                      value: selectedProduct.id,
                                      label: selectedProduct.name,
                                    }
                                    : null
                              }
                              onChange={(option) => {
                                const productId = option ? option.value : '';
                                console.log('Select onChange:', { productId, itemId: item.id });
                                handleItemChange({ target: { value: productId } }, item.id, 'productId');
                              }}
                              onInputChange={handleInputChange}
                              placeholder={isLoading ? 'Loading...' : 'Search Product...'}
                              isSearchable
                              isClearable
                              isLoading={isLoading}
                              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                              menuPosition="fixed"
                              styles={selectStyles}
                              className="block w-full"
                              classNamePrefix="react-select"
                              noOptionsMessage={() =>
                                  searchResults.length === 0 && !isLoading ? 'No matching products found' : null
                              }
                          />
                        </td>
                        {['id', 'description', 'price', 'quantity'].map((field) => (
                            <td key={field} className="px-3 py-4 whitespace-nowrap">
                              <input
                                  type={
                                    field === 'id' ? 'hidden' :
                                        field === 'price' || field === 'quantity' ? 'number' :
                                            'text'
                                  }
                                  min={field === 'quantity' || field === 'price' ? 1 : undefined}
                                  step={field === 'price' ? 0.01 : undefined}
                                  value={item[field] ?? ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    console.log('Input onChange:', { field, value, itemId: item.id });

                                    // Prevent invalid input for price or quantity fields
                                    if (field === 'price' && value && parseFloat(value) < 0) return;
                                    if (field === 'quantity' && value && parseInt(value) < 0) return;

                                    // Handle numeric and text changes accordingly
                                    if (['price', 'quantity'].includes(field)) {
                                      handleItemChangeNumeric(e, item.id, field);
                                    } else {
                                      handleItemChangeText(e, item.id, field);
                                    }
                                  }}
                                  className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  style={{ pointerEvents: 'auto' }} // Ensure no CSS restrictions
                              />
                            </td>
                        ))}
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(item.totalPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                  );
                })
            ) : (
                <tr>
                  <td colSpan="9" className="px-3 py-4 text-center text-sm text-gray-500">
                    No items added yet. Click "Add Item" to add items to this Invoice.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>
  );
});

export default ItemsTable;