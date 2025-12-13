// import React, { createContext, useContext, useState, useEffect } from 'react';

// const ExchangeRateContext = createContext();

// export const useExchangeRate = () => {
//   const context = useContext(ExchangeRateContext);
//   if (!context) {
//     throw new Error('useExchangeRate must be used within an ExchangeRateProvider');
//   }
//   return context;
// };

// export const ExchangeRateProvider = ({ children }) => {
//   const [exchangeRates, setExchangeRates] = useState({
//     EUR: 1.0,      // Base currency
//     USD: 1.08,     // Default rate
//     FC: 2800.0     // Default rate for Congolese Franc
//   });

//   const [baseCurrency, setBaseCurrency] = useState('EUR');
//   const [loading, setLoading] = useState(false);
//   const [lastUpdated, setLastUpdated] = useState(new Date());

//   // Load exchange rates from localStorage on mount
//   useEffect(() => {
//     const savedRates = localStorage.getItem('exchangeRates');
//     const savedBaseCurrency = localStorage.getItem('baseCurrency');
//     const savedLastUpdated = localStorage.getItem('exchangeRatesLastUpdated');

//     if (savedRates) {
//       setExchangeRates(JSON.parse(savedRates));
//     }
//     if (savedBaseCurrency) {
//       setBaseCurrency(savedBaseCurrency);
//     }
//     if (savedLastUpdated) {
//       setLastUpdated(new Date(savedLastUpdated));
//     }
//   }, []);

//   // Save to localStorage whenever rates change
//   useEffect(() => {
//     localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
//     localStorage.setItem('baseCurrency', baseCurrency);
//     localStorage.setItem('exchangeRatesLastUpdated', lastUpdated.toISOString());
//   }, [exchangeRates, baseCurrency, lastUpdated]);

//   const updateExchangeRate = (currency, rate) => {
//     setExchangeRates(prev => ({
//       ...prev,
//       [currency]: parseFloat(rate)
//     }));
//     setLastUpdated(new Date());
//   };

//   const updateAllRates = (newRates) => {
//     setExchangeRates(newRates);
//     setLastUpdated(new Date());
//   };

//   const convertCurrency = (amount, fromCurrency, toCurrency = baseCurrency) => {
//     if (fromCurrency === toCurrency) return amount;
    
//     const fromRate = exchangeRates[fromCurrency] || 1;
//     const toRate = exchangeRates[toCurrency] || 1;
    
//     // Convert to base currency first, then to target currency
//     const baseAmount = amount / fromRate;
//     return baseAmount * toRate;
//   };

//   const formatCurrency = (amount, currency = baseCurrency, options = {}) => {
//     const defaultOptions = {
//       style: 'currency',
//       currency: currency,
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//       ...options
//     };

//     try {
//       return new Intl.NumberFormat('en-US', defaultOptions).format(amount);
//     } catch (error) {
//       // Fallback for unsupported currencies
//       return `${currency} ${amount.toFixed(2)}`;
//     }
//   };

//   const getCurrencySymbol = (currency) => {
//     const symbols = {
//       EUR: '€',
//       USD: '$',
//       FC: 'FC'
//     };
//     return symbols[currency] || currency;
//   };

//   const getSupportedCurrencies = () => {
//     return Object.keys(exchangeRates);
//   };

//   const getExchangeRate = (currency) => {
//     return exchangeRates[currency] || 1;
//   };

//   const refreshRates = async () => {
//     setLoading(true);
//     try {
//       // In a real application, you would fetch from an API
//       // For now, we'll just update the timestamp
//       setLastUpdated(new Date());
      
//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // You could implement actual API calls here
//       // const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
//       // const data = await response.json();
//       // setExchangeRates(data.rates);
      
//     } catch (error) {
//       console.error('Failed to refresh exchange rates:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const value = {
//     exchangeRates,
//     baseCurrency,
//     lastUpdated,
//     loading,
//     setBaseCurrency,
//     updateExchangeRate,
//     updateAllRates,
//     convertCurrency,
//     formatCurrency,
//     getCurrencySymbol,
//     getSupportedCurrencies,
//     getExchangeRate,
//     refreshRates
//   };

//   return (
//     <ExchangeRateContext.Provider value={value}>
//       {children}
//     </ExchangeRateContext.Provider>
//   );
// };

// export default ExchangeRateContext;
import React, { createContext, useContext, useState, useEffect } from 'react';

const ExchangeRateContext = createContext();

export const useExchangeRate = () => {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error('useExchangeRate must be used within an ExchangeRateProvider');
  }
  return context;
};

export const ExchangeRateProvider = ({ children }) => {
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1.0,      // Base currency
    EUR: 0.92,     // Reference rate (unused in formatting)
    FC: 2800.0     // Default rate for Congolese Franc
  });

  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load exchange rates from localStorage on mount
  useEffect(() => {
    const savedRates = localStorage.getItem('exchangeRates');
    const savedBaseCurrency = localStorage.getItem('baseCurrency');
    const savedLastUpdated = localStorage.getItem('exchangeRatesLastUpdated');

    if (savedRates) {
      setExchangeRates(JSON.parse(savedRates));
    }
    if (savedBaseCurrency) {
      setBaseCurrency(savedBaseCurrency);
    }
    if (savedLastUpdated) {
      setLastUpdated(new Date(savedLastUpdated));
    }
  }, []);

  // Save to localStorage whenever rates change
  useEffect(() => {
    localStorage.setItem('exchangeRates', JSON.stringify(exchangeRates));
    localStorage.setItem('baseCurrency', baseCurrency);
    localStorage.setItem('exchangeRatesLastUpdated', lastUpdated.toISOString());
  }, [exchangeRates, baseCurrency, lastUpdated]);

  const updateExchangeRate = (currency, rate) => {
    setExchangeRates(prev => ({
      ...prev,
      [currency]: parseFloat(rate)
    }));
    setLastUpdated(new Date());
  };

  const updateAllRates = (newRates) => {
    setExchangeRates(newRates);
    setLastUpdated(new Date());
  };

  const convertCurrency = (amount, fromCurrency, toCurrency = baseCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to base currency first, then to target currency
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  };

  const formatCurrency = (amount, _currency = 'USD', options = {}) => {
    // Force USD formatting everywhere
    const defaultOptions = {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      ...options
    };
    try {
      return new Intl.NumberFormat('en-US', defaultOptions).format(Number(amount || 0));
    } catch (error) {
      // Fallback: prefix with $ if Intl fails
      const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
      return `${formattedAmount}`;
    }
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      FC: 'FC',
      CDF: 'FC',
      XOF: 'CFA',
      XAF: 'FCFA',
      NGN: '₦',
      ZAR: 'R',
      KES: 'KSh',
      UGX: 'USh',
      TZS: 'TSh',
      RWF: 'RF',
      BIF: 'FBu'
    };
    return symbols[currency] || currency;
  };

  const getSupportedCurrencies = () => {
    return Object.keys(exchangeRates);
  };

  const getExchangeRate = (currency) => {
    return exchangeRates[currency] || 1;
  };

  const refreshRates = async () => {
    setLoading(true);
    try {
      // In a real application, you would fetch from an API
      // For now, we'll just update the timestamp
      setLastUpdated(new Date());
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // You could implement actual API calls here
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      // const data = await response.json();
      // setExchangeRates(data.rates);
      
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    exchangeRates,
    baseCurrency,
    lastUpdated,
    loading,
    // Disable base currency changes to enforce USD across UI
    setBaseCurrency: () => {},
    updateExchangeRate,
    updateAllRates,
    convertCurrency,
    formatCurrency,
    getCurrencySymbol,
    getSupportedCurrencies,
    getExchangeRate,
    refreshRates
  };

  return (
    <ExchangeRateContext.Provider value={value}>
      {children}
    </ExchangeRateContext.Provider>
  );
};

export default ExchangeRateContext;