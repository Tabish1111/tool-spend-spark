import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'INR';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRate: number;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number) => number;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState(83.5); // Default fallback rate
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');
        const data = await response.json();
        setExchangeRate(data.usd.inr || 83.5);
      } catch (error) {
        console.warn('Failed to fetch exchange rate, using default:', error);
        setExchangeRate(83.5);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertAmount = (amount: number): number => {
    if (currency === 'USD') return amount;
    return amount * exchangeRate;
  };

  const formatCurrency = (amount: number): string => {
    const convertedAmount = convertAmount(amount);
    if (currency === 'USD') {
      return `$${convertedAmount.toFixed(2)}`;
    }
    return `₹${convertedAmount.toFixed(0)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        formatCurrency,
        convertAmount,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}