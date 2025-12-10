import React, { useState, useEffect } from 'react';
import { useExchangeRate } from '../../contexts/ExchangeRateContext';

const ExchangeRateSettingsContent = ({ onClose }) => {
  const {
    exchangeRates,
    baseCurrency,
    lastUpdated,
    loading,
    setBaseCurrency,
    updateExchangeRate,
    updateAllRates,
    refreshRates,
    getSupportedCurrencies
  } = useExchangeRate();

  const [tempRates, setTempRates] = useState(exchangeRates);
  const [tempBaseCurrency, setTempBaseCurrency] = useState(baseCurrency);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setTempRates(exchangeRates);
    setTempBaseCurrency(baseCurrency);
  }, [exchangeRates, baseCurrency]);

  const handleRateChange = (currency, rate) => {
    // Allow empty string for user input
    if (rate === '') {
      setTempRates({
        ...tempRates,
        [currency]: ''
      });
      return;
    }
    
    const numericRate = parseFloat(rate);
    if (isNaN(numericRate) || numericRate < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    setTempRates({
      ...tempRates,
      [currency]: numericRate
    });
    
    // Clear any error messages
    if (message.type === 'error') {
      setMessage({ type: '', text: '' });
    }
  };

  const handleBaseCurrencyChange = (newBaseCurrency) => {
    if (newBaseCurrency === tempBaseCurrency) return;
    
    // When changing base currency, we need to recalculate all rates
    const currentBaseRate = tempRates[newBaseCurrency] || 1;
    const newRates = {};
    
    Object.keys(tempRates).forEach(currency => {
      if (currency === newBaseCurrency) {
        newRates[currency] = 1.0;
      } else {
        // Convert rate relative to new base currency
        newRates[currency] = tempRates[currency] / currentBaseRate;
      }
    });
    
    setTempRates(newRates);
    setTempBaseCurrency(newBaseCurrency);
  };

  const handleSave = async () => {
    try {
      // Validate all rates before saving
      const invalidRates = [];
      const validatedRates = {};
      
      Object.keys(tempRates).forEach(currency => {
        const rate = tempRates[currency];
        if (rate === '' || rate === null || rate === undefined) {
          invalidRates.push(currency);
        } else {
          const numericRate = parseFloat(rate);
          if (isNaN(numericRate) || numericRate <= 0) {
            invalidRates.push(currency);
          } else {
            validatedRates[currency] = numericRate;
          }
        }
      });
      
      if (invalidRates.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `Please enter valid rates for: ${invalidRates.join(', ')}` 
        });
        return;
      }
      
      // Ensure base currency rate is 1.0
      validatedRates[tempBaseCurrency] = 1.0;

      // Update base currency if changed
      if (tempBaseCurrency !== baseCurrency) {
        setBaseCurrency(tempBaseCurrency);
      }

      // Update all rates
      if (updateAllRates) {
        updateAllRates(validatedRates);
      } else {
        // Fallback to individual updates
        Object.keys(validatedRates).forEach(currency => {
          if (validatedRates[currency] !== exchangeRates[currency]) {
            updateExchangeRate(currency, validatedRates[currency]);
          }
        });
      }

      setMessage({ type: 'success', text: 'Exchange rates updated successfully!' });
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving exchange rates:', error);
      setMessage({ type: 'error', text: 'Failed to save exchange rates' });
    }
  };

  const handleCancel = () => {
    setTempRates(exchangeRates);
    setTempBaseCurrency(baseCurrency);
    setMessage({ type: '', text: '' });
    onClose();
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshRates();
      setMessage({ type: 'success', text: 'Exchange rates refreshed successfully!' });
    } catch (error) {
      console.error('Error refreshing rates:', error);
      setMessage({ type: 'error', text: 'Failed to refresh exchange rates' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const addNewCurrency = () => {
    const newCurrency = prompt('Enter currency code (e.g., GBP, JPY):');
    if (newCurrency && newCurrency.length === 3) {
      const upperCurrency = newCurrency.toUpperCase();
      if (!tempRates[upperCurrency]) {
        setTempRates({
          ...tempRates,
          [upperCurrency]: 1.0
        });
      }
    }
  };

  const removeCurrency = (currency) => {
    if (currency === tempBaseCurrency) {
      setMessage({ type: 'error', text: 'Cannot remove base currency' });
      return;
    }
    
    if (window.confirm(`Are you sure you want to remove ${currency}?`)) {
      const newRates = { ...tempRates };
      delete newRates[currency];
      setTempRates(newRates);
    }
  };

  const supportedCurrencies = getSupportedCurrencies();
  const hasChanges = JSON.stringify(tempRates) !== JSON.stringify(exchangeRates) || 
                    tempBaseCurrency !== baseCurrency;

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Base Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Base Currency
        </label>
        <select
          value={tempBaseCurrency}
          onChange={(e) => handleBaseCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {Object.keys(tempRates).map(currency => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">
          All amounts will be converted to this currency for display. Changing this will recalculate all exchange rates.
        </p>
      </div>

      {/* Exchange Rates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Exchange Rates (1 {tempBaseCurrency} equals)
          </label>
          <div className="flex space-x-2">
            <button
              onClick={addNewCurrency}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Add Currency
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Rates'}
            </button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {Object.keys(tempRates).sort().map(currency => (
            <div key={currency} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <label className="w-12 text-sm font-medium text-gray-700">
                {currency}
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={tempRates[currency] || 0}
                  onChange={(e) => handleRateChange(currency, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={currency === tempBaseCurrency}
                  placeholder="Enter exchange rate"
                />
              </div>
              {currency === tempBaseCurrency ? (
                <span className="text-sm text-gray-500 w-16">(Base)</span>
              ) : (
                <button
                  onClick={() => removeCurrency(currency)}
                  className="text-red-600 hover:text-red-800 w-16 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-sm text-gray-500">
          <p>• Base currency rate is always 1.0</p>
          <p>• Enter how many units of each currency equals 1 {tempBaseCurrency}</p>
          <p>• Example: If 1 USD = 0.85 EUR, enter 0.85 for EUR when USD is base</p>
        </div>
      </div>

      {/* Rate Examples */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Current Rates Preview</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
          {Object.keys(tempRates).slice(0, 4).map(currency => (
            <div key={currency}>
              1 {tempBaseCurrency} = {tempRates[currency]?.toFixed(4) || '0.0000'} {currency}
            </div>
          ))}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 border-t pt-3">
        <div className="flex justify-between items-center">
          <span>Last updated: {lastUpdated.toLocaleString()}</span>
          {hasChanges && (
            <span className="text-orange-600 font-medium">• Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ExchangeRateSettingsContent;