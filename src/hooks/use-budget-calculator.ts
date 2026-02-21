import { useEffect, useRef, useCallback } from 'react';
import { useBudgetStore } from '@/store/budget-store';
import { calculateResults } from '@/lib/calculations';
import type { CalculationResults } from '@/types/budget';

/**
 * Custom hook for real-time budget calculations
 * Automatically recalculates when any budget data changes
 * Uses debouncing to prevent excessive recalculations
 */
export function useBudgetCalculator(): CalculationResults | null {
  const {
    products,
    setupCosts,
    fixedCosts,
    semiVariableCosts,
    variableCosts,
    marketingCosts,
    projectionSettings,
    setResults,
    results
  } = useBudgetStore();

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Memoize inputs to detect changes
  const inputs = JSON.stringify({
    products,
    setupCosts,
    fixedCosts,
    semiVariableCosts,
    variableCosts,
    marketingCosts,
    projectionSettings
  });

  const performCalculation = useCallback(() => {
    try {
      const newResults = calculateResults(
        products,
        setupCosts,
        fixedCosts,
        semiVariableCosts,
        variableCosts,
        marketingCosts,
        projectionSettings
      );
      setResults(newResults);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [products, setupCosts, fixedCosts, semiVariableCosts, variableCosts, marketingCosts, projectionSettings, setResults]);

  // Recalculate when inputs change with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce calculation (300ms) to avoid excessive recalculations
    timeoutRef.current = setTimeout(() => {
      performCalculation();
    }, 300);

    // Cleanup
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inputs, performCalculation]);

  return results;
}

/**
 * Hook to calculate results immediately without debouncing
 * Useful for initial load or explicit recalculation requests
 */
export function useBudgetCalculatorSync(): CalculationResults | null {
  const {
    products,
    setupCosts,
    fixedCosts,
    semiVariableCosts,
    variableCosts,
    marketingCosts,
    projectionSettings,
    results
  } = useBudgetStore();

  const syncCalculate = useCallback(() => {
    if (products.length === 0) return null;
    
    return calculateResults(
      products,
      setupCosts,
      fixedCosts,
      semiVariableCosts,
      variableCosts,
      marketingCosts,
      projectionSettings
    );
  }, [products, setupCosts, fixedCosts, semiVariableCosts, variableCosts, marketingCosts, projectionSettings]);

  return syncCalculate() || results;
}