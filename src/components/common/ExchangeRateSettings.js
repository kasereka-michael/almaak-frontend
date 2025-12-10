import React, { useState } from 'react';
import { useExchangeRate } from '../../contexts/ExchangeRateContext';

const ExchangeRateSettings = ({ isOpen, onClose }) => {
  const {
    exchangeRates,
    baseCurrency,
    lastUpdated,
    loading,
    setBaseCurrency,
    updateExchangeRate,
    refreshRates,
    getSupportedCurrencies
  } = useExchangeRate();

  const [tempRates, setTempRates] = useState(exchangeRates);
  const [tempBaseCurrency, setTempBaseCurrency] = useState(baseCurrency);

  if (!isOpen) return null;

  const handleRateChange = (currency, rate) => {
    setTempRates({
      ...tempRates,
      [currency]: parseFloat(rate) || 0
    });
  };

  const handleSave = () => {
    // Update all rates
    Object.keys(tempRates).forEach(currency => {
      if (tempRates[currency] !== exchangeRates[currency]) {
        updateExchangeRate(currency, tempRates[currency]);
      }
    });

    // Update base currency if changed
    if (tempBaseCurrency !== baseCurrency) {
      setBaseCurrency(tempBaseCurrency);
    }

    onClose();
  };

  const handleCancel = () => {
    setTempRates(exchangeRates);
    setTempBaseCurrency(baseCurrency);
    onClose();
  };

  const supportedCurrencies = getSupportedCurrencies();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Exchange Rate Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Base Currency Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Currency
            </label>
            <select
              value={tempBaseCurrency}
              onChange={(e) => setTempBaseCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {supportedCurrencies.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              All amounts will be converted to this currency for display
            </p>
          </div>

          {/* Exchange Rates */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Exchange Rates (to {tempBaseCurrency})
              </label>
              <button
                onClick={refreshRates}
                disabled={loading}
                className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="space-y-3">
              {supportedCurrencies.map(currency => (
                <div key={currency} className="flex items-center space-x-3">
                  <label className="w-12 text-sm font-medium text-gray-700">
                    {currency}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={tempRates[currency] || 0}
                    onChange={(e) => handleRateChange(currency, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={currency === tempBaseCurrency}
                  />
                  {currency === tempBaseCurrency && (
                    <span className="text-sm text-gray-500">(Base)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="mb-6 text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleString()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateSettings;