import type {
  Product,
  SetupCost,
  FixedCost,
  SemiVariableCost,
  VariableCostItem,
  MarketingCosts,
  ProjectionSettings,
  CalculationResults,
  MonthlyPnL,
  BreakevenResult,
  GrowthRateSetting
} from '@/types/budget';

// Format currency in BDT
export function formatBDT(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('BDT', '৳');
}

// Calculate total COGS for a product
export function calculateCOGSPerUnit(product: Product): number {
  if (!product.cogs_per_unit) return 0;
  const { raw_material_cost, labor_cost_per_unit, packaging_cost_per_unit, other_direct_cost_per_unit } = product.cogs_per_unit;
  return raw_material_cost + labor_cost_per_unit + packaging_cost_per_unit + other_direct_cost_per_unit;
}

// Calculate revenue for a product
export function calculateProductRevenue(product: Product): number {
  return product.selling_price_per_unit * product.units_sold_per_month;
}

// Calculate total revenue
export function calculateTotalRevenue(products: Product[]): number {
  return products.reduce((sum, p) => sum + calculateProductRevenue(p), 0);
}

// Calculate total COGS
export function calculateTotalCOGS(products: Product[]): number {
  return products.reduce((sum, p) => sum + (calculateCOGSPerUnit(p) * p.units_sold_per_month), 0);
}

// Calculate total units sold
export function calculateTotalUnits(products: Product[]): number {
  return products.reduce((sum, p) => sum + p.units_sold_per_month, 0);
}

// Calculate amortized setup cost
export function calculateAmortizedSetupCost(setupCosts: SetupCost[], projectionSettings: ProjectionSettings): number {
  const totalSetup = setupCosts.reduce((sum, c) => sum + c.total_amount, 0);
  const amortizationMonths = projectionSettings.amortization_type === 'spread_over_12_months' 
    ? 12 
    : projectionSettings.months;
  return totalSetup / amortizationMonths;
}

// Calculate total fixed costs
export function calculateTotalFixedCosts(fixedCosts: FixedCost[]): number {
  return fixedCosts.reduce((sum, c) => sum + c.amount_per_month, 0);
}

// Calculate total semi-variable costs
export function calculateTotalSemiVariableCosts(
  semiVariableCosts: SemiVariableCost[],
  products: Product[]
): number {
  const totalUnits = calculateTotalUnits(products);
  
  return semiVariableCosts.reduce((sum, c) => {
    let units = 0;
    if (c.unit_reference === 'all_products_combined') {
      units = totalUnits;
    } else {
      const product = products.find(p => p.id === c.unit_reference);
      units = product?.units_sold_per_month || 0;
    }
    return sum + c.base_amount_per_month + (c.variable_rate_per_unit * units);
  }, 0);
}

// Calculate total per-unit variable costs
export function calculateTotalVariableCosts(
  variableCosts: VariableCostItem[],
  products: Product[]
): number {
  const totalUnits = calculateTotalUnits(products);
  
  return variableCosts.reduce((sum, c) => {
    let units = 0;
    if (c.product_reference === 'all_products') {
      units = totalUnits;
    } else {
      const product = products.find(p => p.id === c.product_reference);
      units = product?.units_sold_per_month || 0;
    }
    return sum + (c.rate_per_unit * units);
  }, 0);
}

// Calculate total marketing costs
export function calculateTotalMarketingCosts(
  marketingCosts: MarketingCosts,
  products: Product[]
): number {
  const totalRevenue = calculateTotalRevenue(products);
  const totalUnits = calculateTotalUnits(products);
  
  // Fixed marketing
  const fixedMarketing = marketingCosts.fixed_marketing.reduce((sum, c) => sum + c.amount_per_month, 0);
  
  // Variable marketing per unit
  const variablePerUnit = marketingCosts.variable_marketing_per_unit.reduce((sum, c) => {
    let units = 0;
    if (c.product_reference === 'all_products') {
      units = totalUnits;
    } else {
      const product = products.find(p => p.id === c.product_reference);
      units = product?.units_sold_per_month || 0;
    }
    return sum + (c.rate_per_unit * units);
  }, 0);
  
  // Variable marketing percent of revenue
  const variablePercent = marketingCosts.variable_marketing_percent_revenue.reduce((sum, c) => {
    let revenue = 0;
    if (c.revenue_reference === 'total_revenue') {
      revenue = totalRevenue;
    } else {
      const product = products.find(p => p.id === c.revenue_reference);
      revenue = product ? calculateProductRevenue(product) : 0;
    }
    return sum + (c.percentage_of_revenue / 100 * revenue);
  }, 0);
  
  return fixedMarketing + variablePerUnit + variablePercent;
}

// Apply growth rate based on mode
export function applyGrowthRate(
  baseValue: number,
  month: number,
  growthSetting: GrowthRateSetting | undefined
): number {
  if (!growthSetting) return baseValue;

  switch (growthSetting.mode) {
    case 'monthly':
      // User provides exact value for each month
      return growthSetting.monthly_values?.[month - 1] ?? baseValue;
      
    case 'quarterly':
      // Value holds constant for 3 months
      const quarter = Math.floor((month - 1) / 3);
      return growthSetting.quarterly_values?.[quarter] ?? baseValue;
      
    case 'proportional':
      // Compounded growth: V_t = V_0 * (1 + r)^t
      const rate = growthSetting.growth_percentage ?? 0;
      const frequency = growthSetting.frequency ?? 'monthly';
      
      if (frequency === 'monthly') {
        return baseValue * Math.pow(1 + rate / 100, month - 1);
      } else {
        // Quarterly compounding
        const q = Math.floor((month - 1) / 3);
        return baseValue * Math.pow(1 + rate / 100, q);
      }
      
    default:
      return baseValue;
  }
}

// Apply growth rates to products for a specific month
function applyProductGrowthRates(
  products: Product[],
  month: number,
  growthRates: ProjectionSettings['growth_rates']
): Product[] {
  return products.map(product => {
    const unitsGrowth = growthRates.units_sold[product.id];
    const priceGrowth = growthRates.selling_price[product.id];
    
    return {
      ...product,
      units_sold_per_month: applyGrowthRate(product.units_sold_per_month, month, unitsGrowth),
      selling_price_per_unit: applyGrowthRate(product.selling_price_per_unit, month, priceGrowth)
    };
  });
}

// Apply growth rates to costs for a specific month
function applyCostGrowthRates(
  month: number,
  baseCost: number,
  costId: string,
  growthRates: ProjectionSettings['growth_rates']
): number {
  const costGrowth = growthRates.fixed_costs[costId] || growthRates.variable_costs[costId];
  return applyGrowthRate(baseCost, month, costGrowth);
}

// Calculate monthly P&L
export function calculateMonthlyPnL(
  products: Product[],
  setupCosts: SetupCost[],
  fixedCosts: FixedCost[],
  semiVariableCosts: SemiVariableCost[],
  variableCosts: VariableCostItem[],
  marketingCosts: MarketingCosts,
  projectionSettings: ProjectionSettings
): MonthlyPnL[] {
  const results: MonthlyPnL[] = [];
  const amortizedSetup = calculateAmortizedSetupCost(setupCosts, projectionSettings);
  
  for (let month = 1; month <= projectionSettings.months; month++) {
    // Apply growth rates to products
    const adjustedProducts = applyProductGrowthRates(products, month, projectionSettings.growth_rates);
    
    const revenue = calculateTotalRevenue(adjustedProducts);
    const cogs = calculateTotalCOGS(adjustedProducts);
    const grossProfit = revenue - cogs;
    
    const fixed = calculateTotalFixedCosts(fixedCosts);
    const semiVariable = calculateTotalSemiVariableCosts(semiVariableCosts, adjustedProducts);
    const variable = calculateTotalVariableCosts(variableCosts, adjustedProducts);
    const marketing = calculateTotalMarketingCosts(marketingCosts, adjustedProducts);
    
    const totalCosts = fixed + semiVariable + variable + marketing + amortizedSetup;
    const netPnL = grossProfit - totalCosts;
    const marginPercent = revenue > 0 ? (netPnL / revenue) * 100 : 0;
    
    results.push({
      month,
      revenue,
      cogs,
      grossProfit,
      fixedCosts: fixed,
      semiVariableCosts: semiVariable,
      variableCosts: variable,
      marketingCosts: marketing,
      setupCostAmortized: amortizedSetup,
      totalCosts,
      netPnL,
      marginPercent
    });
  }
  
  return results;
}

// Calculate breakeven
export function calculateBreakeven(
  products: Product[],
  setupCosts: SetupCost[],
  fixedCosts: FixedCost[],
  semiVariableCosts: SemiVariableCost[],
  variableCosts: VariableCostItem[],
  marketingCosts: MarketingCosts,
  projectionSettings: ProjectionSettings
): BreakevenResult {
  const totalFixed = calculateTotalFixedCosts(fixedCosts);
  const totalSemiVariableBase = semiVariableCosts.reduce((sum, c) => sum + c.base_amount_per_month, 0);
  const amortizedSetup = calculateAmortizedSetupCost(setupCosts, projectionSettings);
  
  const fixedCostsTotal = totalFixed + totalSemiVariableBase + amortizedSetup;
  
  // Calculate weighted average contribution margin
  let totalContributionMargin = 0;
  let totalUnits = 0;
  
  const breakevenUnitsPerProduct: Record<string, number> = {};
  
  products.forEach(product => {
    const revenue = calculateProductRevenue(product);
    const cogs = calculateCOGSPerUnit(product);
    
    // Get variable costs per unit for this product
    let variablePerUnit = 0;
    variableCosts.forEach(vc => {
      if (vc.product_reference === 'all_products' || vc.product_reference === product.id) {
        variablePerUnit += vc.rate_per_unit;
      }
    });
    
    // Get marketing costs per unit
    let marketingPerUnit = 0;
    marketingCosts.variable_marketing_per_unit.forEach(mc => {
      if (mc.product_reference === 'all_products' || mc.product_reference === product.id) {
        marketingPerUnit += mc.rate_per_unit;
      }
    });
    
    // Get marketing percent of revenue
    let marketingPercent = 0;
    marketingCosts.variable_marketing_percent_revenue.forEach(mc => {
      if (mc.revenue_reference === 'total_revenue' || mc.revenue_reference === product.id) {
        marketingPercent += mc.percentage_of_revenue;
      }
    });
    
    const contributionMargin = product.selling_price_per_unit 
      - cogs 
      - variablePerUnit 
      - marketingPerUnit 
      - (marketingPercent / 100 * product.selling_price_per_unit);
    
    if (contributionMargin > 0) {
      totalContributionMargin += contributionMargin * product.units_sold_per_month;
      totalUnits += product.units_sold_per_month;
    }
  });
  
  const weightedAvgContributionMargin = totalUnits > 0 ? totalContributionMargin / totalUnits : 0;
  
  let breakevenUnits = 0;
  let breakevenRevenue = 0;
  
  if (weightedAvgContributionMargin > 0) {
    breakevenUnits = Math.ceil(fixedCostsTotal / weightedAvgContributionMargin);
    
    // Calculate average price
    const avgPrice = products.length > 0 
      ? products.reduce((sum, p) => sum + p.selling_price_per_unit * p.units_sold_per_month, 0) / totalUnits
      : 0;
    breakevenRevenue = breakevenUnits * avgPrice;
    
    // Distribute breakeven units proportionally
    products.forEach(product => {
      const proportion = totalUnits > 0 ? product.units_sold_per_month / totalUnits : 1 / products.length;
      breakevenUnitsPerProduct[product.id] = Math.ceil(breakevenUnits * proportion);
    });
  }
  
  // Calculate months to breakeven
  const monthlyPnL = calculateMonthlyPnL(
    products, setupCosts, fixedCosts, semiVariableCosts, variableCosts, marketingCosts, projectionSettings
  );
  
  let monthsToBreakeven: number | null = null;
  let cumulativePnL = 0;
  const totalSetupCosts = setupCosts.reduce((sum, c) => sum + c.total_amount, 0);
  
  for (const pnl of monthlyPnL) {
    cumulativePnL += pnl.netPnL;
    if (cumulativePnL >= totalSetupCosts && monthsToBreakeven === null) {
      monthsToBreakeven = pnl.month;
      break;
    }
  }
  
  return {
    breakevenUnitsTotal: breakevenUnits,
    breakevenUnitsPerProduct,
    breakevenRevenue,
    monthsToBreakeven
  };
}

// Main calculation function
export function calculateResults(
  products: Product[],
  setupCosts: SetupCost[],
  fixedCosts: FixedCost[],
  semiVariableCosts: SemiVariableCost[],
  variableCosts: VariableCostItem[],
  marketingCosts: MarketingCosts,
  projectionSettings: ProjectionSettings
): CalculationResults {
  const monthlyPnL = calculateMonthlyPnL(
    products, setupCosts, fixedCosts, semiVariableCosts, variableCosts, marketingCosts, projectionSettings
  );
  
  const firstMonth = monthlyPnL[0] || {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    fixedCosts: 0,
    semiVariableCosts: 0,
    variableCosts: 0,
    marketingCosts: 0,
    totalCosts: 0,
    netPnL: 0,
    marginPercent: 0
  };
  
  const breakeven = calculateBreakeven(
    products, setupCosts, fixedCosts, semiVariableCosts, variableCosts, marketingCosts, projectionSettings
  );
  
  return {
    totalRevenue: firstMonth.revenue,
    totalCOGS: firstMonth.cogs,
    grossProfit: firstMonth.grossProfit,
    totalOperatingCosts: firstMonth.totalCosts,
    netPnL: firstMonth.netPnL,
    netMarginPercent: firstMonth.marginPercent,
    monthlyPnL,
    breakeven
  };
}
