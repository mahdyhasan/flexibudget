import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  BudgetState,
  BusinessType,
  Product,
  SetupCost,
  FixedCost,
  SemiVariableCost,
  VariableCostItem,
  FixedMarketing,
  VariableMarketingPerUnit,
  VariableMarketingPercentRevenue,
  MarketingCosts,
  ProjectionSettings,
  CalculationResults,
  ChatMessage
} from '@/types/budget';

const defaultProjectionSettings: ProjectionSettings = {
  months: 12,
  amortization_type: 'spread_over_projection',
  growth_rates: {
    units_sold: {},
    selling_price: {},
    fixed_costs: {},
    variable_costs: {}
  }
};

const defaultMarketingCosts: MarketingCosts = {
  fixed_marketing: [],
  variable_marketing_per_unit: [],
  variable_marketing_percent_revenue: []
};

export const useBudgetStore = create<BudgetState>((set) => ({
  // Initial State
  currentStep: 'select_business',
  businessType: null,
  chatMessages: [],
  onboardingComplete: false,
  products: [],
  setupCosts: [],
  fixedCosts: [],
  semiVariableCosts: [],
  variableCosts: [],
  marketingCosts: defaultMarketingCosts,
  projectionSettings: defaultProjectionSettings,
  results: null,

  // Business Type Actions
  setBusinessType: (type: BusinessType) => set({ businessType: type }),
  setCurrentStep: (step) => set({ currentStep: step }),

  // Chat Actions
  addChatMessage: (message) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        ...message,
        id: uuidv4(),
        timestamp: new Date()
      }
    ]
  })),
  clearChat: () => set({ chatMessages: [] }),
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),

  // Product Actions
  addProduct: (product) => set((state) => ({
    products: [...state.products, product]
  })),
  updateProduct: (id, product) => set((state) => ({
    products: state.products.map((p) =>
      p.id === id ? { ...p, ...product } : p
    )
  })),
  removeProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),

  // Setup Cost Actions
  addSetupCost: (cost) => set((state) => ({
    setupCosts: [...state.setupCosts, cost]
  })),
  updateSetupCost: (id, cost) => set((state) => ({
    setupCosts: state.setupCosts.map((c) =>
      c.id === id ? { ...c, ...cost } : c
    )
  })),
  removeSetupCost: (id) => set((state) => ({
    setupCosts: state.setupCosts.filter((c) => c.id !== id)
  })),

  // Fixed Cost Actions
  addFixedCost: (cost) => set((state) => ({
    fixedCosts: [...state.fixedCosts, cost]
  })),
  updateFixedCost: (id, cost) => set((state) => ({
    fixedCosts: state.fixedCosts.map((c) =>
      c.id === id ? { ...c, ...cost } : c
    )
  })),
  removeFixedCost: (id) => set((state) => ({
    fixedCosts: state.fixedCosts.filter((c) => c.id !== id)
  })),

  // Semi-Variable Cost Actions
  addSemiVariableCost: (cost) => set((state) => ({
    semiVariableCosts: [...state.semiVariableCosts, cost]
  })),
  updateSemiVariableCost: (id, cost) => set((state) => ({
    semiVariableCosts: state.semiVariableCosts.map((c) =>
      c.id === id ? { ...c, ...cost } : c
    )
  })),
  removeSemiVariableCost: (id) => set((state) => ({
    semiVariableCosts: state.semiVariableCosts.filter((c) => c.id !== id)
  })),

  // Variable Cost Actions
  addVariableCost: (cost) => set((state) => ({
    variableCosts: [...state.variableCosts, cost]
  })),
  updateVariableCost: (id, cost) => set((state) => ({
    variableCosts: state.variableCosts.map((c) =>
      c.id === id ? { ...c, ...cost } : c
    )
  })),
  removeVariableCost: (id) => set((state) => ({
    variableCosts: state.variableCosts.filter((c) => c.id !== id)
  })),

  // Fixed Marketing Actions
  addFixedMarketing: (cost) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      fixed_marketing: [...state.marketingCosts.fixed_marketing, cost]
    }
  })),
  updateFixedMarketing: (id, cost) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      fixed_marketing: state.marketingCosts.fixed_marketing.map((c) =>
        c.id === id ? { ...c, ...cost } : c
      )
    }
  })),
  removeFixedMarketing: (id) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      fixed_marketing: state.marketingCosts.fixed_marketing.filter((c) => c.id !== id)
    }
  })),

  // Variable Marketing Per Unit Actions
  addVariableMarketingPerUnit: (cost) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      variable_marketing_per_unit: [...state.marketingCosts.variable_marketing_per_unit, cost]
    }
  })),
  updateVariableMarketingPerUnit: (id, cost) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      variable_marketing_per_unit: state.marketingCosts.variable_marketing_per_unit.map((c) =>
        c.id === id ? { ...c, ...cost } : c
      )
    }
  })),
  removeVariableMarketingPerUnit: (id) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      variable_marketing_per_unit: state.marketingCosts.variable_marketing_per_unit.filter((c) => c.id !== id)
    }
  })),

  // Variable Marketing Percent Revenue Actions
  addVariableMarketingPercentRevenue: (cost) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      variable_marketing_percent_revenue: [...state.marketingCosts.variable_marketing_percent_revenue, cost]
    }
  })),
  updateVariableMarketingPercentRevenue: (id, cost) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      variable_marketing_percent_revenue: state.marketingCosts.variable_marketing_percent_revenue.map((c) =>
        c.id === id ? { ...c, ...cost } : c
      )
    }
  })),
  removeVariableMarketingPercentRevenue: (id) => set((state) => ({
    marketingCosts: {
      ...state.marketingCosts,
      variable_marketing_percent_revenue: state.marketingCosts.variable_marketing_percent_revenue.filter((c) => c.id !== id)
    }
  })),

  // Projection Settings
  updateProjectionSettings: (settings) => set((state) => ({
    projectionSettings: { ...state.projectionSettings, ...settings }
  })),

  // Results
  setResults: (results) => set({ results }),

  // Reset All
  resetAll: () => set({
    currentStep: 'select_business',
    businessType: null,
    chatMessages: [],
    onboardingComplete: false,
    products: [],
    setupCosts: [],
    fixedCosts: [],
    semiVariableCosts: [],
    variableCosts: [],
    marketingCosts: defaultMarketingCosts,
    projectionSettings: defaultProjectionSettings,
    results: null
  })
}));

export const generateId = () => uuidv4();
