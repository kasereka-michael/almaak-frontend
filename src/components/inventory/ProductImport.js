import React, { useState } from 'react';
import { parseExcelFile, mapExcelDataToModel } from '../../utils/exportUtils'; // parseCSVFile replaces parseExcelFile
import { createProduct, sendExcelFileToBackend } from '../../services/api';
import { columnMapping } from './constants/columnMapping';
import FileUpload from './components/FileUpload';
import ProgressIndicator from './components/ProgressIndicator';
import SuccessMessage from './components/SuccessMessage';
import ErrorMessages from './components/ErrorMessages';
import DataPreview from './components/DataPreview';
import ActionButtons from './components/ActionButtons';

const ProductImport = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importTotal, setImportTotal] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Please select a valid CSV file (.csv)']);
      return;
    }

    setFile(selectedFile);
    setErrors([]);
    setSuccess(false);
    setPreview(null);

    try {
      setLoading(true);
      const { headers, data, errors: parseErrors } = await parseExcelFile(selectedFile);

      if (parseErrors.length > 0) {
        setErrors(parseErrors.map(err => err.message || err));
        return;
      }

      const requiredHeaders = Object.entries(columnMapping)
        .filter(([_, config]) => config.required)
        .map(([header]) => header);

      const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

      if (missingHeaders.length > 0) {
        setErrors([`Missing required columns: ${missingHeaders.join(', ')}`]);
        return;
      }

      const { validItems, errors: mappingErrors } = mapExcelDataToModel(data, columnMapping);

      if (mappingErrors.length > 0) {
        setErrors(mappingErrors);
      }

      if (validItems.length > 0) {
        setPreview({
          headers: Object.keys(validItems[0]),
          rows: validItems.slice(0, 5),
          totalRows: validItems.length,
        });
        setImportTotal(validItems.length);
      } else {
        setErrors([...errors, 'No valid data found in the file']);
      }
    } catch (error) {
      console.error('Error parsing CSV file:', error);
      setErrors(['Failed to parse the CSV file. Please check the format and try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !preview) return;

    try {
      setLoading(true);
      setErrors([]);
      setSuccess(false);

      const { data } = await parseExcelFile(file);
      const { validItems, errors: mappingErrors } = mapExcelDataToModel(data, columnMapping);

      if (mappingErrors.length > 0) {
        setErrors(mappingErrors);
        return;
      }

      const importErrors = [];
      let successCount = 0;

      for (let i = 0; i < validItems.length; i++) {
        try {
          await createProduct(validItems[i]);
          successCount++;
        } catch (error) {
          importErrors.push(`Error importing row ${i + 1}: ${error.message || 'Unknown error'}`);
        }
        setImportProgress(i + 1);
      }

      // Optional: Upload original file
      setIsUploading(true);
      try {
        await sendExcelFileToBackend(file); // This might be better renamed to sendCSVFileToBackend
        console.log("CSV file sent to backend");
      } catch (error) {
        importErrors.push(`Error uploading CSV file: ${error.message || 'Unknown error'}`);
      } finally {
        setIsUploading(false);
      }

      if (importErrors.length > 0) {
        setErrors(importErrors);
      }

      setSuccess(true);
      if (onComplete) {
        onComplete({
          totalItems: validItems.length,
          successCount,
          errorCount: importErrors.length,
        });
      }
    } catch (error) {
      console.error('Error during import:', error);
      setErrors(['Failed to import products. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = Object.keys(columnMapping);
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setErrors([]);
    setSuccess(false);
    setImportProgress(0);
    setImportTotal(0);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Import Products</h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload CSV file (.csv) with product information for batch import
        </p>
      </div>

      <div className="space-y-6">
        <FileUpload
          onFileChange={handleFileChange}
          onDownloadTemplate={handleDownloadTemplate}
          loading={loading}
        />
        <ProgressIndicator
          loading={loading}
          importProgress={importProgress}
          importTotal={importTotal}
          isUploading={isUploading}
        />
        <SuccessMessage success={success} importProgress={importProgress} />
        <ErrorMessages errors={errors} />
        <DataPreview preview={preview} />
        <ActionButtons
          onReset={handleReset}
          onImport={handleImport}
          loading={loading}
          preview={preview}
        />
      </div>
    </div>
  );
};

export default ProductImport;
