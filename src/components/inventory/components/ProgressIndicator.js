import React from 'react';

const ProgressIndicator = ({ loading, importProgress, importTotal, isUploading }) => {
  if (!loading) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-medium text-gray-700">
          {isUploading ? 'Saving data...' : 'Processing'}
        </div>
        {importTotal > 0 && (
          <div className="text-sm font-medium text-gray-500">
            {importProgress} of {importTotal}
          </div>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{
            width: importTotal > 0 ? `${Math.floor((importProgress / importTotal) * 100)}%` : '100%',
            transition: 'width 0.3s ease',
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;