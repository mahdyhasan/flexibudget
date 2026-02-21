// Business Types
export interface BusinessType {
  id: string;
  label: string;
  category: string;
  has_cogs: boolean | null;
  has_bom: boolean | null;
  notes: string;
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'shoe_business',
    label: 'Shoe Business',
    category: 'Manufacturing & Retail',
    has_cogs: true,
    has_bom: false,
    notes: 'Covers shoe manufacturing, wholesale or retail. COGS includes raw materials per unit.'
  },
  {
    id: 'restaurant',
    label: 'Restaurant',
    category: 'Food & Beverage',
    has_cogs: true,
    has_bom: false,
    notes: 'Menu-based pricing with multiple products. COGS = food/ingredient cost per dish.'
  },
  {
    id: 'saas',
    label: 'SaaS (Software as a Service)',
    category: 'Technology',
    has_cogs: false,
    has_bom: false,
    notes: 'Subscription-based revenue. Costs are mostly fixed (dev, hosting, support).'
  },
  {
    id: 'software_development',
    label: 'Software Development Agency',
    category: 'Technology',
    has_cogs: false,
    has_bom: false,
    notes: 'Project-based revenue. Costs include developer salaries, tools, licenses.'
  },
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    category: 'Manufacturing',
    has_cogs: true,
    has_bom: true,
    notes: 'Raw materials converted to finished goods. Requires COGS with optional BOM logic.'
  },
  {
    id: 'retail',
    label: 'Retail Store',
    category: 'Retail',
    has_cogs: true,
    has_bom: false,
    notes: 'Buy goods and resell. COGS = purchase cost per unit.'
  },
  {
    id: 'facebook_business',
    label: 'Facebook / Social Commerce Business',
    category: 'E-commerce',
    has_cogs: true,
    has_bom: false,
    notes: 'Sell via Facebook page or group. Key costs include ad spend, delivery, packaging.'
  },
  {
    id: 'fashion_apparel',
    label: 'Fashion & Apparel',
    category: 'Manufacturing & Retail',
    has_cogs: true,
    has_bom: false,
    notes: 'Clothing business with production or sourcing. May have multiple product lines.'
  },
  {
    id: 'jewellery',
    label: 'Jewellery Business',
    category: 'Manufacturing & Retail',
    has_cogs: true,
    has_bom: false,
    notes: 'High COGS (gold, silver, stones). Multiple SKUs at different price points.'
  },
  {
    id: 'trading_import',
    label: 'Import & Trading Business',
    category: 'Trading',
    has_cogs: true,
    has_bom: false,
    notes: 'Import goods (e.g., from China) and sell locally. COGS includes product cost + customs + shipping.'
  },
  {
    id: 'custom',
    label: 'Custom / Other Business',
    category: 'Custom',
    has_cogs: null,
    has_bom: null,
    notes: 'User defines everything from scratch. AI will ask clarifying questions.'
  }
];

// COGS per unit
export interface COGSPerUnit {
  raw_material_cost: number;
  labor_cost_per_unit: number;
  packaging_cost_per_unit: number;
  other_direct_cost_per_unit: number;
}

// Product
export interface Product {
  id: string;
  name: string;
  unit_label: string;
  selling_price_per_unit: number;
  units_sold_per_month: number;
  cogs_per_unit: COGSPerUnit | null;
  variable_costs: VariableCostItem[];
}

// Cost Types
export interface SetupCost {
  id: string;
  name: string;
  total_amount: number;
  amortized_monthly: number;
}

export interface FixedCost {
  id: string;
  name: string;
  amount_per_month: number;
}

export interface SemiVariableCost {
  id: string;
  name: string;
  base_amount_per_month: number;
  variable_rate_per_unit: number;
  unit_reference: 'all_products_combined' | string;
}

export interface VariableCostItem {
  id: string;
  name: string;
  rate_per_unit: number;
  product_reference: 'all_products' | string;
}

export interface FixedMarketing {
  id: string;
  name: string;
  amount_per_month: number;
}

export interface VariableMarketingPerUnit {
  id: string;
  name: string;
  rate_per_unit: number;
  product_reference: 'all_products' | string;
}

export interface VariableMarketingPercentRevenue {
  id: string;
  name: string;
  percentage_of_revenue: number;
  revenue_reference: 'total_revenue' | string;
}

export interface MarketingCosts {
  fixed_marketing: FixedMarketing[];
  variable_marketing_per_unit: VariableMarketingPerUnit[];
  variable_marketing_percent_revenue: VariableMarketingPercentRevenue[];
}

// Amortization Options
export type AmortizationType = 'spread_over_projection' | 'spread_over_12_months';

// Growth Rate Modes
export type GrowthRateMode = 'monthly' | 'quarterly' | 'proportional';

export interface GrowthRateSetting {
  mode: GrowthRateMode;
  growth_percentage?: number;
  frequency?: 'monthly' | 'quarterly';
  monthly_values?: number[];
  quarterly_values?: number[];
}

// Projection Settings
export interface ProjectionSettings {
  months: number;
  amortization_type: AmortizationType;
  growth_rates: {
    units_sold: Record<string, GrowthRateSetting>;
    selling_price: Record<string, GrowthRateSetting>;
    fixed_costs: Record<string, GrowthRateSetting>;
    variable_costs: Record<string, GrowthRateSetting>;
  };
}

// AI Chat Message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Budget State
export interface BudgetState {
  // Setup
  currentStep: 'select_business' | 'ai_onboarding' | 'configure' | 'results';
  businessType: BusinessType | null;
  
  // AI Chat
  chatMessages: ChatMessage[];
  onboardingComplete: boolean;
  
  // Products
  products: Product[];
  
  // Costs
  setupCosts: SetupCost[];
  fixedCosts: FixedCost[];
  semiVariableCosts: SemiVariableCost[];
  variableCosts: VariableCostItem[];
  marketingCosts: MarketingCosts;
  
  // Projection
  projectionSettings: ProjectionSettings;
  
  // Results
  results: CalculationResults | null;
  
  // Actions
  setBusinessType: (type: BusinessType) => void;
  setCurrentStep: (step: 'select_business' | 'ai_onboarding' | 'configure' | 'results') => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setOnboardingComplete: (complete: boolean) => void;
  
  // Product Actions
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  
  // Cost Actions
  addSetupCost: (cost: SetupCost) => void;
  updateSetupCost: (id: string, cost: Partial<SetupCost>) => void;
  removeSetupCost: (id: string) => void;
  
  addFixedCost: (cost: FixedCost) => void;
  updateFixedCost: (id: string, cost: Partial<FixedCost>) => void;
  removeFixedCost: (id: string) => void;
  
  addSemiVariableCost: (cost: SemiVariableCost) => void;
  updateSemiVariableCost: (id: string, cost: Partial<SemiVariableCost>) => void;
  removeSemiVariableCost: (id: string) => void;
  
  addVariableCost: (cost: VariableCostItem) => void;
  updateVariableCost: (id: string, cost: Partial<VariableCostItem>) => void;
  removeVariableCost: (id: string) => void;
  
  // Marketing Actions
  addFixedMarketing: (cost: FixedMarketing) => void;
  updateFixedMarketing: (id: string, cost: Partial<FixedMarketing>) => void;
  removeFixedMarketing: (id: string) => void;
  
  addVariableMarketingPerUnit: (cost: VariableMarketingPerUnit) => void;
  updateVariableMarketingPerUnit: (id: string, cost: Partial<VariableMarketingPerUnit>) => void;
  removeVariableMarketingPerUnit: (id: string) => void;
  
  addVariableMarketingPercentRevenue: (cost: VariableMarketingPercentRevenue) => void;
  updateVariableMarketingPercentRevenue: (id: string, cost: Partial<VariableMarketingPercentRevenue>) => void;
  removeVariableMarketingPercentRevenue: (id: string) => void;
  
  // Projection Actions
  updateProjectionSettings: (settings: Partial<ProjectionSettings>) => void;
  
  // Results
  setResults: (results: CalculationResults | null) => void;
  
  // Reset
  resetAll: () => void;
}

// Monthly P&L Result
export interface MonthlyPnL {
  month: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  fixedCosts: number;
  semiVariableCosts: number;
  variableCosts: number;
  marketingCosts: number;
  setupCostAmortized: number;
  totalCosts: number;
  netPnL: number;
  marginPercent: number;
}

// Breakeven Result
export interface BreakevenResult {
  breakevenUnitsTotal: number;
  breakevenUnitsPerProduct: Record<string, number>;
  breakevenRevenue: number;
  monthsToBreakeven: number | null;
}

// Calculation Results
export interface CalculationResults {
  totalRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  totalOperatingCosts: number;
  netPnL: number;
  netMarginPercent: number;
  monthlyPnL: MonthlyPnL[];
  breakeven: BreakevenResult;
}

// AI Environment Generation Response
export interface AIGeneratedEnvironment {
  products: Product[];
  setup_costs: SetupCost[];
  fixed_costs: FixedCost[];
  semi_variable_costs: SemiVariableCost[];
  variable_costs: VariableCostItem[];
  marketing_costs: MarketingCosts;
  projection_defaults: Partial<ProjectionSettings>;
}
