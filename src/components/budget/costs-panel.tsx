'use client';

import { useState } from 'react';
import { useBudgetStore, generateId } from '@/store/budget-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, ListTree, Settings, Zap, TrendingUp, Megaphone, ChevronDown, ChevronUp } from 'lucide-react';
import type { SetupCost, FixedCost, SemiVariableCost, VariableCostItem, FixedMarketing, VariableMarketingPerUnit, VariableMarketingPercentRevenue } from '@/types/budget';
import { formatBDT } from '@/lib/calculations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CostItemProps {
  name: string;
  value: string;
  onNameChange: (value: string) => void;
  onValueChange: (value: number) => void;
  onRemove: () => void;
  valueLabel?: string;
  children?: React.ReactNode;
}

function CostItem({ name, value, onNameChange, onValueChange, onRemove, valueLabel = 'Amount', children }: CostItemProps) {
  return (
    <div className="flex items-start gap-2 p-2 sm:p-3 border rounded-lg hover:border-primary/30 transition-colors">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div>
          <Label className="text-[10px] sm:text-xs text-muted-foreground">Name</Label>
          <Input 
            value={name} 
            onChange={(e) => onNameChange(e.target.value)} 
            className="h-8 sm:h-9 text-sm"
          />
        </div>
        <div>
          <Label className="text-[10px] sm:text-xs text-muted-foreground">{valueLabel} (৳)</Label>
          <Input 
            type="number" 
            value={value} 
            onChange={(e) => onValueChange(Number(e.target.value))} 
            className="h-8 sm:h-9 text-sm"
          />
        </div>
        {children}
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 shrink-0 mt-4 sm:mt-0">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function CostsPanel() {
  const {
    products,
    setupCosts, addSetupCost, updateSetupCost, removeSetupCost,
    fixedCosts, addFixedCost, updateFixedCost, removeFixedCost,
    semiVariableCosts, addSemiVariableCost, updateSemiVariableCost, removeSemiVariableCost,
    variableCosts, addVariableCost, updateVariableCost, removeVariableCost,
    marketingCosts, addFixedMarketing, updateFixedMarketing, removeFixedMarketing,
    addVariableMarketingPerUnit, updateVariableMarketingPerUnit, removeVariableMarketingPerUnit,
    addVariableMarketingPercentRevenue, updateVariableMarketingPercentRevenue, removeVariableMarketingPercentRevenue
  } = useBudgetStore();

  const [activeTab, setActiveTab] = useState('setup');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <CardTitle className="text-base sm:text-lg">Costs</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b px-2 sm:px-4 h-10 sm:h-11">
            <TabsTrigger value="setup" className="gap-1 text-[10px] sm:text-xs px-2 sm:px-3">
              <Settings className="h-3 w-3" />
              <span className="hidden sm:inline">Setup</span>
            </TabsTrigger>
            <TabsTrigger value="fixed" className="gap-1 text-[10px] sm:text-xs px-2 sm:px-3">
              <ListTree className="h-3 w-3" />
              <span className="hidden sm:inline">Fixed</span>
            </TabsTrigger>
            <TabsTrigger value="semi-variable" className="gap-1 text-[10px] sm:text-xs px-2 sm:px-3">
              <Zap className="h-3 w-3" />
              <span className="hidden md:inline">Semi-Var</span>
            </TabsTrigger>
            <TabsTrigger value="variable" className="gap-1 text-[10px] sm:text-xs px-2 sm:px-3">
              <TrendingUp className="h-3 w-3" />
              <span className="hidden sm:inline">Variable</span>
            </TabsTrigger>
            <TabsTrigger value="marketing" className="gap-1 text-[10px] sm:text-xs px-2 sm:px-3">
              <Megaphone className="h-3 w-3" />
              <span className="hidden sm:inline">Marketing</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[280px] sm:h-[350px]">
            {/* Setup Costs */}
            <TabsContent value="setup" className="p-3 sm:p-4 space-y-2 sm:space-y-3 m-0">
              <div className="flex justify-between items-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">One-time costs paid before launch</p>
                <Button size="sm" onClick={() => addSetupCost({ id: generateId(), name: 'New Setup Cost', total_amount: 0, amortized_monthly: 0 })} className="h-7 sm:h-8 text-[10px] sm:text-xs">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              {setupCosts.map((cost) => (
                <CostItem
                  key={cost.id}
                  name={cost.name}
                  value={String(cost.total_amount)}
                  onNameChange={(v) => updateSetupCost(cost.id, { name: v })}
                  onValueChange={(v) => updateSetupCost(cost.id, { total_amount: v })}
                  onRemove={() => removeSetupCost(cost.id)}
                  valueLabel="Total"
                />
              ))}
              {setupCosts.length > 0 && (
                <div className="pt-2 border-t text-xs sm:text-sm">
                  Total Setup: <span className="font-semibold">{formatBDT(setupCosts.reduce((s, c) => s + c.total_amount, 0))}</span>
                </div>
              )}
            </TabsContent>

            {/* Fixed Costs */}
            <TabsContent value="fixed" className="p-3 sm:p-4 space-y-2 sm:space-y-3 m-0">
              <div className="flex justify-between items-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Monthly costs that stay constant</p>
                <Button size="sm" onClick={() => addFixedCost({ id: generateId(), name: 'New Fixed Cost', amount_per_month: 0 })} className="h-7 sm:h-8 text-[10px] sm:text-xs">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              {fixedCosts.map((cost) => (
                <CostItem
                  key={cost.id}
                  name={cost.name}
                  value={String(cost.amount_per_month)}
                  onNameChange={(v) => updateFixedCost(cost.id, { name: v })}
                  onValueChange={(v) => updateFixedCost(cost.id, { amount_per_month: v })}
                  onRemove={() => removeFixedCost(cost.id)}
                  valueLabel="/Month"
                />
              ))}
              {fixedCosts.length > 0 && (
                <div className="pt-2 border-t text-xs sm:text-sm">
                  Total Fixed/Month: <span className="font-semibold">{formatBDT(fixedCosts.reduce((s, c) => s + c.amount_per_month, 0))}</span>
                </div>
              )}
            </TabsContent>

            {/* Semi-Variable Costs */}
            <TabsContent value="semi-variable" className="p-3 sm:p-4 space-y-2 sm:space-y-3 m-0">
              <div className="flex justify-between items-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Base + variable rate per unit</p>
                <Button size="sm" onClick={() => addSemiVariableCost({ id: generateId(), name: 'New Semi-Variable', base_amount_per_month: 0, variable_rate_per_unit: 0, unit_reference: 'all_products_combined' })} className="h-7 sm:h-8 text-[10px] sm:text-xs">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              {semiVariableCosts.map((cost) => (
                <div key={cost.id} className="p-2 sm:p-3 border rounded-lg space-y-2 sm:space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Name</Label>
                        <Input value={cost.name} onChange={(e) => updateSemiVariableCost(cost.id, { name: e.target.value })} className="h-8 sm:h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Base (৳)</Label>
                        <Input type="number" value={cost.base_amount_per_month} onChange={(e) => updateSemiVariableCost(cost.id, { base_amount_per_month: Number(e.target.value) })} className="h-8 sm:h-9 text-sm" />
                      </div>
                      <div>
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Rate/Unit (৳)</Label>
                        <Input type="number" value={cost.variable_rate_per_unit} onChange={(e) => updateSemiVariableCost(cost.id, { variable_rate_per_unit: Number(e.target.value) })} className="h-8 sm:h-9 text-sm" />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeSemiVariableCost(cost.id)} className="h-8 w-8 shrink-0 mt-4 sm:mt-0">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Variable Costs */}
            <TabsContent value="variable" className="p-3 sm:p-4 space-y-2 sm:space-y-3 m-0">
              <div className="flex justify-between items-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Costs that scale with units sold</p>
                <Button size="sm" onClick={() => addVariableCost({ id: generateId(), name: 'New Variable Cost', rate_per_unit: 0, product_reference: 'all_products' })} className="h-7 sm:h-8 text-[10px] sm:text-xs">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </div>
              {variableCosts.map((cost) => (
                <CostItem
                  key={cost.id}
                  name={cost.name}
                  value={String(cost.rate_per_unit)}
                  onNameChange={(v) => updateVariableCost(cost.id, { name: v })}
                  onValueChange={(v) => updateVariableCost(cost.id, { rate_per_unit: v })}
                  onRemove={() => removeVariableCost(cost.id)}
                  valueLabel="Rate/Unit"
                />
              ))}
            </TabsContent>

            {/* Marketing Costs */}
            <TabsContent value="marketing" className="p-3 sm:p-4 space-y-3 sm:space-y-4 m-0">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-xs sm:text-sm">Fixed Marketing (Monthly)</h4>
                  <Button size="sm" variant="outline" onClick={() => addFixedMarketing({ id: generateId(), name: 'Ad Budget', amount_per_month: 0 })} className="h-7 sm:h-8 text-[10px] sm:text-xs">
                    <Plus className="h-3 w-3 sm:mr-1" />
                    Add
                  </Button>
                </div>
                {marketingCosts.fixed_marketing.map((cost) => (
                  <CostItem
                    key={cost.id}
                    name={cost.name}
                    value={String(cost.amount_per_month)}
                    onNameChange={(v) => updateFixedMarketing(cost.id, { name: v })}
                    onValueChange={(v) => updateFixedMarketing(cost.id, { amount_per_month: v })}
                    onRemove={() => removeFixedMarketing(cost.id)}
                    valueLabel="/Month"
                  />
                ))}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-xs sm:text-sm">Variable (% of Revenue)</h4>
                  <Button size="sm" variant="outline" onClick={() => addVariableMarketingPercentRevenue({ id: generateId(), name: 'Commission', percentage_of_revenue: 0, revenue_reference: 'total_revenue' })} className="h-7 sm:h-8 text-[10px] sm:text-xs">
                    <Plus className="h-3 w-3 sm:mr-1" />
                    Add
                  </Button>
                </div>
                {marketingCosts.variable_marketing_percent_revenue.map((cost) => (
                  <div key={cost.id} className="p-2 sm:p-3 border rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                        <div>
                          <Label className="text-[10px] sm:text-xs text-muted-foreground">Name</Label>
                          <Input value={cost.name} onChange={(e) => updateVariableMarketingPercentRevenue(cost.id, { name: e.target.value })} className="h-8 sm:h-9 text-sm" />
                        </div>
                        <div>
                          <Label className="text-[10px] sm:text-xs text-muted-foreground">% of Revenue</Label>
                          <Input type="number" value={cost.percentage_of_revenue} onChange={(e) => updateVariableMarketingPercentRevenue(cost.id, { percentage_of_revenue: Number(e.target.value) })} className="h-8 sm:h-9 text-sm" />
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeVariableMarketingPercentRevenue(cost.id)} className="h-8 w-8 shrink-0 mt-4 sm:mt-0">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
