import React, { useState } from 'react';
import useQuotationForm from './hooks/useQuotationForm';
import QuotationInfo from './QuotationInfo';
import CustomerInfo from './CustomerInfo';
import ItemsTable from './ItemsTable';
import TotalsSection from './TotalsSection';
import FormActions from './FormActions';

import WhatsAppDialog from './WhatsAppDialog';
import { printAndSendQuotation } from '../../services/api';
import {generateQuotationPdf} from "../../utils/exportUtils";

const QuotationForm = () => {
  // WhatsApp dialog state
  const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);

  const {
    formData,
    customers,
    products,
    loading,
    error,
    isEditMode,
    handleCustomerChange,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleItemChange,
    handlePrintQuotation,
    handleSubmit,
    navigate,
  } = useQuotationForm();

    const [success, setSuccess] = useState('');
  // WhatsApp dialog handlers
  const handleOpenWhatsAppDialog = () => {
    if (!formData.quotationId) {
      alert('Please save the quotation first before printing and sending.');
      return;
    }
    setIsWhatsAppDialogOpen(true);
  };

  const handleWhatsAppDialogClose = () => {
    setIsWhatsAppDialogOpen(false);
  };

  const handleWhatsAppDialogConfirm = async (whatsAppData) => {
    try {
      const result = await printAndSendQuotation(formData, whatsAppData);
      const selectedColumns = null;
      generateQuotationPdf(formData,  false, selectedColumns)
      // alert(result.message || 'Operation completed successfully!');
      setSuccess(`Quotation ${formData.quotationId} has been moved to trash successfully.`);
    } catch (error) {
      console.error('Error in print and send:', error);
        setSuccess(`Error in print and send: ', ${error}`);
      throw error; // Re-throw to let the dialog handle it
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? 'Edit Quotation' : 'Create New Quotation'}
        </h1>
        {formData.items.length > 0 && (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleOpenWhatsAppDialog}
              className="inline-flex items-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              title="Generate PDF, Download & Send via WhatsApp"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              📄 Generate PDF & Send
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuotationInfo formData={formData} handleChange={handleChange} />
            <CustomerInfo
              formData={formData}
              handleCustomerChange={handleCustomerChange}
            />
            {console.log("this si what i wanna seee",customers)}
            <ItemsTable
              formData={formData}
              products={products}
              handleAddItem={handleAddItem}
              handleRemoveItem={handleRemoveItem}
              handleItemChange={handleItemChange}
            />
            <TotalsSection formData={formData} handleChange={handleChange} />
            <FormActions loading={loading} isEditMode={isEditMode} navigate={navigate} />
          </div>
        </form>
      </div>

      {/* WhatsApp Dialog */}
      <WhatsAppDialog
        isOpen={isWhatsAppDialogOpen}
        onClose={handleWhatsAppDialogClose}
        onConfirm={handleWhatsAppDialogConfirm}
        quotationId={formData.quotationId}
      />
    </div>
  );
};

export default QuotationForm;