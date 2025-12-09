// src/components/QuotationForm/FormActions.jsx
import React from 'react';

const FormActions = ({ loading, isEditMode, navigate }) => (
  
  <div className="mt-8 flex justify-end space-x-3">
    <button
      type="button"
      onClick={() => navigate('/quotations')}
      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading}
      className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        loading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {isEditMode ? 'Updating...' : 'Creating...'
          }
        </span>
      ) : isEditMode ? (
        'Update Quotation'
      ) : (
        'Create Quotation'
      )}

    </button>
  </div>
);

export default FormActions;