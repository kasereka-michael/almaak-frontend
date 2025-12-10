import React from 'react';

const ActionButtons = ({ onReset, onImport, loading, preview }) => (
  <div className="flex justify-end space-x-4">
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Reset
    </button>
    <button
      type="button"
      onClick={onImport}
      disabled={loading || !preview || preview.totalRows === 0}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        loading || !preview || preview.totalRows === 0 ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Importing...' : 'Import Products'}
    </button>
  </div>
);

export default ActionButtons;