import React from 'react';

const FileUpload = ({ onFileChange, onDownloadTemplate, loading }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Select Excel File
    </label>
    <div className="flex items-center space-x-4">
      <input
        type="file"
        accept=".csv"
        onChange={onFileChange}
        disabled={loading}
        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
      />
      <button
        type="button"
        onClick={onDownloadTemplate}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Download Template
      </button>
    </div>
    <p className="mt-2 text-xs text-gray-500">
      File must contain columns: ProductName | productDescription | productPartNumber | productManufacturer | ProductNormalPrice | productSellingPrice
    </p>
  </div>
);

export default FileUpload;