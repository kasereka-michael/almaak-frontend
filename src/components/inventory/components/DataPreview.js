import React from 'react';

const DataPreview = ({ preview }) => {
  if (!preview) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Preview ({preview.rows.length} of {preview.totalRows} rows)
      </h3>
      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {preview.headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-gray-900"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {preview.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {preview.headers.map((header) => (
                  <td
                    key={`${rowIndex}-${header}`}
                    className="whitespace-nowrap py-2 pl-4 pr-3 text-xs text-gray-500"
                  >
                    {row[header] !== undefined && row[header] !== null ? String(row[header]) : 'N/A'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataPreview;