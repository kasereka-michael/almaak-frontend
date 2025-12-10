import React, { useState } from 'react';

const WhatsAppDialog = ({ isOpen, onClose, onConfirm, quotationId }) => {
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [message, setMessage] = useState(`Please find attached quotation: ${quotationId}`);
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Column selection state
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includePartNumber, setIncludePartNumber] = useState(true);
  const [includeManufacturer, setIncludeManufacturer] = useState(true);
  
  // Stamp selection state
  const [includeManagerStamp, setIncludeManagerStamp] = useState(true);
  const [includeCompanyStamp, setIncludeCompanyStamp] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (sendViaWhatsApp && !whatsAppNumber.trim()) {
      alert('Please enter a WhatsApp number');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm({
        sendViaWhatsApp,
        whatsAppNumber: whatsAppNumber.trim(),
        message: message.trim(),
        columnOptions: {
          includeDescription,
          includePartNumber,
          includeManufacturer,
          includeManagerStamp,
          includeCompanyStamp
        }
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process request: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Print & Send Options
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              📄 This will generate and download the PDF quotation. Optionally, you can also send it via WhatsApp.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* WhatsApp Option */}
            <div className="flex items-center">
              <input
                id="whatsapp-checkbox"
                type="checkbox"
                checked={sendViaWhatsApp}
                onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="whatsapp-checkbox" className="ml-2 block text-sm text-gray-900">
                Send via WhatsApp
              </label>
            </div>

            {/* WhatsApp Number Input */}
            {sendViaWhatsApp && (
              <div>
                <label htmlFor="whatsapp-number" className="block text-sm font-medium text-gray-700">
                  WhatsApp Number (with country code)
                </label>
                <input
                  type="tel"
                  id="whatsapp-number"
                  value={whatsAppNumber}
                  onChange={(e) => setWhatsAppNumber(e.target.value)}
                  placeholder="e.g., +1234567890"
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:opacity-50"
                  required={sendViaWhatsApp}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include country code (e.g., +243 for DRC, +1 for US)
                </p>
              </div>
            )}

            {/* Message Input */}
            {sendViaWhatsApp && (
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  disabled={isLoading}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm disabled:opacity-50"
                  placeholder="Enter a message to send with the quotation..."
                />
              </div>
            )}

            {/* Column Selection */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">PDF Column Options</h4>
              <p className="text-xs text-gray-600 mb-3">
                Select which optional columns to include in the PDF. Default columns (No., Item, Qty, Unit Price, Total) are always included.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="include-description"
                    type="checkbox"
                    checked={includeDescription}
                    onChange={(e) => setIncludeDescription(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="include-description" className="ml-2 block text-sm text-gray-900">
                    Include Description
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="include-part-number"
                    type="checkbox"
                    checked={includePartNumber}
                    onChange={(e) => setIncludePartNumber(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="include-part-number" className="ml-2 block text-sm text-gray-900">
                    Include Part Number
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="include-manufacturer"
                    type="checkbox"
                    checked={includeManufacturer}
                    onChange={(e) => setIncludeManufacturer(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="include-manufacturer" className="ml-2 block text-sm text-gray-900">
                    Include Manufacturer
                  </label>
                </div>
              </div>
            </div>

            {/* Stamp Selection */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Signature Options</h4>
              <p className="text-xs text-gray-600 mb-3">
                Select which stamps to include in the signature section of the PDF.
              </p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="include-manager-stamp"
                    type="checkbox"
                    checked={includeManagerStamp}
                    onChange={(e) => setIncludeManagerStamp(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="include-manager-stamp" className="ml-2 block text-sm text-gray-900">
                    Include Manager Stamp
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="include-company-stamp"
                    type="checkbox"
                    checked={includeCompanyStamp}
                    onChange={(e) => setIncludeCompanyStamp(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label htmlFor="include-company-stamp" className="ml-2 block text-sm text-gray-900">
                    Include Company Stamp
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {sendViaWhatsApp ? 'Generate PDF & Send' : 'Generate PDF'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDialog;