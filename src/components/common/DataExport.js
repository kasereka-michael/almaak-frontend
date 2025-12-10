import React, { useState } from 'react';
import { exportToExcel, exportToPdf } from '../../utils/exportUtils';

const DataExport = ({ 
  data, 
  fileName, 
  columns, 
  title,
  showExcelButton = true,
  showPdfButton = true,
  excelButtonText = "Export to Excel", 
  pdfButtonText = "Export to PDF" 
}) => {
  const [exporting, setExporting] = useState({ excel: false, pdf: false });

  const handleExcelExport = () => {
    try {
      setExporting({ ...exporting, excel: true });
      exportToExcel(data, fileName, columns);
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
      alert('Failed to export data to Excel. Please try again.');
    } finally {
      setExporting({ ...exporting, excel: false });
    }
  };

  const handlePdfExport = () => {
    try {
      setExporting({ ...exporting, pdf: true });
      exportToPdf(data, fileName, columns, title || `${fileName} Data`);
    } catch (error) {
      console.error('Error exporting data to PDF:', error);
      alert('Failed to export data to PDF. Please try again.');
    } finally {
      setExporting({ ...exporting, pdf: false });
    }
  };

  const isDisabled = !data || data.length === 0;

  return (
    <div className="flex space-x-2">
      {showExcelButton && (
        <button
          onClick={handleExcelExport}
          disabled={exporting.excel || isDisabled}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            exporting.excel || isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {exporting.excel ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {excelButtonText}
            </>
          )}
        </button>
      )}
      
      {showPdfButton && (
        <button
          onClick={handlePdfExport}
          disabled={exporting.pdf || isDisabled}
          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            exporting.pdf || isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {exporting.pdf ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {pdfButtonText}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default DataExport;