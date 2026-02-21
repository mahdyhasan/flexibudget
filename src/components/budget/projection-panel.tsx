'use client';

import { useState } from 'react';
import { useBudgetStore } from '@/store/budget-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, Divide, Check } from 'lucide-react';
import type { GrowthRateMode } from '@/types/budget';

export function ProjectionPanel() {
  const { projectionSettings, updateProjectionSettings, setupCosts, products } = useBudgetStore();
  const [defaultGrowthRate, setDefaultGrowthRate] = useState(10);
  const [selectedMode, setSelectedMode] = useState<GrowthRateMode>('proportional');

  const totalSetup = setupCosts.reduce((s, c) => s + c.total_amount, 0);
  const amortizationMonths = projectionSettings.amortization_type === 'spread_over_12_months' ? 12 : projectionSettings.months;
  const monthlyAmortized = totalSetup / amortizationMonths;

  // Handle mode selection
  const handleModeSelect = (mode: GrowthRateMode) => {
    setSelectedMode(mode);
  };

  // Apply default growth rate to all products with selected mode
  const handleApplyDefaultGrowth = () => {
    const newGrowthRates = { ...projectionSettings.growth_rates };
    
    products.forEach(product => {
      if (selectedMode === 'proportional') {
        newGrowthRates.units_sold[product.id] = {
          mode: 'proportional',
          growth_percentage: defaultGrowthRate,
          frequency: 'monthly'
        };
        newGrowthRates.selling_price[product.id] = {
          mode: 'proportional',
          growth_percentage: defaultGrowthRate,
          frequency: 'monthly'
        };
      } else if (selectedMode === 'monthly') {
        newGrowthRates.units_sold[product.id] = {
          mode: 'monthly',
          monthly_values: Array(12).fill(defaultGrowthRate),
          frequency: 'monthly'
        };
        newGrowthRates.selling_price[product.id] = {
          mode: 'monthly',
          monthly_values: Array(12).fill(defaultGrowthRate),
          frequency: 'monthly'
        };
      } else if (selectedMode === 'quarterly') {
        newGrowthRates.units_sold[product.id] = {
          mode: 'quarterly',
          quarterly_values: Array(4).fill(defaultGrowthRate),
          frequency: 'quarterly'
        };
        newGrowthRates.selling_price[product.id] = {
          mode: 'quarterly',
          quarterly_values: Array(4).fill(defaultGrowthRate),
          frequency: 'quarterly'
        };
      }
    });
    
    updateProjectionSettings({
      growth_rates: newGrowthRates
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Projection Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Projection Period */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs sm:text-sm">Projection Period</Label>
            <Badge variant="secondary" className="text-xs">{projectionSettings.months} months</Badge>
          </div>
          <Slider
            value={[projectionSettings.months]}
            onValueChange={([value]) => updateProjectionSettings({ months: value })}
            min={1}
            max={36}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground">
            <span>1m</span>
            <span>12m</span>
            <span>24m</span>
            <span>36m</span>
          </div>
        </div>

        {/* Amortization */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Divide className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Label className="text-xs sm:text-sm">Setup Cost Amortization</Label>
          </div>
          <Select
            value={projectionSettings.amortization_type}
            onValueChange={(value: 'spread_over_projection' | 'spread_over_12_months') => 
              updateProjectionSettings({ amortization_type: value })
            }
          >
            <SelectTrigger className="h-9 sm:h-10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spread_over_projection" className="text-sm">
                Over projection ({projectionSettings.months} months)
              </SelectItem>
              <SelectItem value="spread_over_12_months" className="text-sm">
                Over 12 months
              </SelectItem>
            </SelectContent>
          </Select>
          
          {totalSetup > 0 && (
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly amortized cost:</p>
              <p className="text-lg sm:text-xl font-bold">৳{monthlyAmortized.toLocaleString()}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Total: ৳{totalSetup.toLocaleString()} ÷ {amortizationMonths} months
              </p>
            </div>
          )}
        </div>

        {/* Growth Rate Mode */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <Label className="text-xs sm:text-sm">Growth Rate Mode</Label>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {[
              { id: 'monthly', label: 'Monthly', desc: 'Set each month' },
              { id: 'quarterly', label: 'Quarterly', desc: 'By quarter' },
              { id: 'proportional', label: 'Growth %', desc: 'Percentage' }
            ].map((mode) => {
              const isActive = selectedMode === mode.id;
              
              return (
                <div 
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id as GrowthRateMode)}
                  className={`p-2 sm:p-3 border rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors ${
                    isActive ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {isActive && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />}
                    <p className="font-medium text-[10px] sm:text-sm">{mode.label}</p>
                  </div>
                  <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{mode.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Default Growth Rate */}
        <div className="space-y-2">
          <Label className="text-xs sm:text-sm">Default Monthly Growth Rate</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={defaultGrowthRate}
              onChange={(e) => setDefaultGrowthRate(Number(e.target.value))}
              className="w-16 sm:w-24 h-9 sm:h-10 text-sm"
              placeholder="10"
              min={0}
              max={100}
            />
            <span className="text-muted-foreground text-sm">%</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApplyDefaultGrowth}
              className="h-9 sm:h-10 text-xs sm:text-sm px-2 sm:px-3"
              disabled={products.length === 0}
            >
              Apply
            </Button>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Applied to units sold and prices without specific growth settings. Click "Apply" to update calculations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
