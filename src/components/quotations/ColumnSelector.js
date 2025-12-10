import React, { useState } from 'react';

const ColumnSelector = ({ isOpen, onClose, onConfirm, quotation }) => {
  // Available columns for quotation items table
  const availableColumns = [
    { key: 'item', label: 'Item Name', default: true },
    { key: 'description', label: 'Description', default: false },
    { key: 'partNumber', label: 'Part No', default: false },
    { key: 'manufacturer', label: 'Manufacturer', default: false },
    { key: 'quantity', label: 'Quantity', default: true },
    { key: 'unitPrice', label: 'Unit Price', default: true },
    { key: 'total', label: 'Total Price', default: true }
  ];

  // Initialize selected columns with defaults
  const [selectedColumns, setSelectedColumns] = useState(() => {
    const defaults = {};
    availableColumns.forEach(col => {
      defaults[col.key] = col.default;
    });
    return defaults;
  });

  const [printMode, setPrintMode] = useState(true); // true for print, false for download

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = {};
    availableColumns.forEach(col => {
      allSelected[col.key] = true;
    });
    setSelectedColumns(allSelected);
  };

  const handleSelectDefaults = () => {
    const defaults = {};
    availableColumns.forEach(col => {
      defaults[col.key] = col.default;
    });
    setSelectedColumns(defaults);
  };

  const handleClearAll = () => {
    const cleared = {};
    availableColumns.forEach(col => {
      cleared[col.key] = false;
    });
    setSelectedColumns(cleared);
  };

  const handleConfirm = () => {
    const selectedColumnsList = availableColumns.filter(col => selectedColumns[col.key]);
    onConfirm(selectedColumnsList, printMode);
    onClose();
  };

  const selectedCount = Object.values(selectedColumns).filter(Boolean).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Select PDF Columns
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Choose which columns to include in the PDF for: <strong>{quotation?.quotationId}</strong>
          </p>
        </div>

        <div className="px-6 py-4">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={handleSelectDefaults}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Defaults
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
            <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
              {selectedCount} selected
            </span>
          </div>

          {/* Column Selection */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableColumns.map((column) => (
              <label
                key={column.key}
                className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns[column.key]}
                  onChange={() => handleColumnToggle(column.key)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {column.label}
                  </span>
                  {column.default && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
                      Default
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* Output Mode Selection */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Output Mode</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="outputMode"
                  checked={printMode === true}
                  onChange={() => setPrintMode(true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Print PDF</span>
                  <p className="text-xs text-gray-500">Open print dialog</p>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="outputMode"
                  checked={printMode === false}
                  onChange={() => setPrintMode(false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Download PDF</span>
                  <p className="text-xs text-gray-500">Save to device</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              selectedCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Generate PDF ({selectedCount} columns)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnSelector;