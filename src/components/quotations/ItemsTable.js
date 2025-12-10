import React, { memo, useCallback, useState, useEffect } from 'react';
import Select from 'react-select';
import { debounce } from 'lodash';
import { searchProductByName } from '../../services/api';

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

  // Debounced search function to fetch products from the backend
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce(async (query) => {
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
    }, 300),
    []
  );

  // Handle input change in Select
  const handleInputChange = (inputValue) => {
    debouncedSearch(inputValue);
    return inputValue;
  };

  // Handlers for text fields (description, manufacturer, partNumber)
  const handleItemChangeText = useCallback((e, id, field) => {
    console.log('handleItemChangeText:', { field, value: e.target.value, id });
    handleItemChange(e, id, field);
  }, [handleItemChange]);

  // Handlers for numeric fields (price, quantity)
  const handleItemChangeNumeric = useCallback((e, id, field) => {
    console.log('handleItemChangeNumeric:', { field, value: e.target.value, id });
    handleItemChange(e, id, field);
  }, [handleItemChange]);

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
        <h2 className="text-lg font-medium text-gray-900">Quotation Items</h2>
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
        {/* Header */}
        <div className="grid grid-cols-[2%_15%_24%_12%_12%_12%_9%_6%_4%] gap-2 items-center bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-3 rounded-t">
          <div>No.</div>
          <div>Product</div>
          <div>Description</div>
          <div>Part No. / Sku</div>
          <div>Manufacturer</div>
          <div>Price</div>
          <div>Qty</div>
          <div className="text-right">Total</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-200 bg-white">
          {formData.items.length > 0 ? (
            formData.items.map((item, index) => {
              const selectedProduct = [...products, ...searchResults].find(
                (p) => p.id?.toString() === item.productId?.toString()
              );

              return (
                <div key={item.id} className="grid grid-cols-[2%_15%_24%_12%_12%_12%_9%_6%_4%] gap-2 items-center px-3 py-3">
                  {/* No. */}
                  <div className="text-sm text-gray-500">{index + 1}</div>

                  {/* Product */}
                  <div>
                    <Select
                      options={searchResults.map((product) => ({ value: product.id, label: product.name }))}
                      value={
                        selectedProduct
                          ? { value: selectedProduct.id, label: selectedProduct.name }
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
                      noOptionsMessage={() => (searchResults.length === 0 && !isLoading ? 'No matching products found' : null)}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <input
                      type="text"
                      value={item.description ?? ''}
                      onChange={(e) => handleItemChangeText(e, item.id, 'description')}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm truncate"
                    />
                  </div>

                  {/* Part No. / Sku */}
                  <div>
                    <input
                      type="text"
                      value={item.partNumber ?? ''}
                      onChange={(e) => handleItemChangeText(e, item.id, 'partNumber')}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm truncate"
                    />
                  </div>

                  {/* Manufacturer */}
                  <div>
                    <input
                      type="text"
                      value={item.manufacturer ?? ''}
                      onChange={(e) => handleItemChangeText(e, item.id, 'manufacturer')}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm truncate"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.price ?? ''}
                      onChange={(e) => handleItemChangeNumeric(e, item.id, 'price')}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                  </div>

                  {/* Qty */}
                  <div>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={item.quantity ?? ''}
                      onChange={(e) => handleItemChangeNumeric(e, item.id, 'quantity')}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                  </div>

                  {/* Total */}
                  <div className="text-right text-sm text-gray-900 font-semibold">
                    ${(item.totalPrice || 0).toFixed(2)}
                  </div>

                  {/* Actions */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              No items added yet. Click "Add Item" to add items to this quotation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ItemsTable;