import { NextRequest, NextResponse } from 'next/server';
import { calculateResults } from '@/lib/calculations';
import type { Product, SetupCost, FixedCost, SemiVariableCost, VariableCostItem, MarketingCosts, ProjectionSettings } from '@/types/budget';

export async function POST(request: NextRequest) {
  try {
    const { products, setupCosts, fixedCosts, semiVariableCosts, variableCosts, marketingCosts, projectionSettings } = await request.json();
    
    const results = calculateResults(
      products as Product[],
      setupCosts as SetupCost[],
      fixedCosts as FixedCost[],
      semiVariableCosts as SemiVariableCost[],
      variableCosts as VariableCostItem[],
      marketingCosts as MarketingCosts,
      projectionSettings as ProjectionSettings
    );
    
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { success: false, error: 'Calculation failed' },
      { status: 500 }
    );
  }
}
