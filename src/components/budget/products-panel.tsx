'use client';

import { useBudgetStore, generateId } from '@/store/budget-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, ChevronDown, Package, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Product, COGSPerUnit } from '@/types/budget';
import { formatBDT } from '@/lib/calculations';

export function ProductsPanel() {
  const { businessType, products, addProduct, updateProduct, removeProduct } = useBudgetStore();
  const hasCogs = businessType?.has_cogs ?? true;
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: generateId(),
      name: `Product ${products.length + 1}`,
      unit_label: 'unit',
      selling_price_per_unit: 100,
      units_sold_per_month: 100,
      cogs_per_unit: hasCogs ? {
        raw_material_cost: 30,
        labor_cost_per_unit: 10,
        packaging_cost_per_unit: 5,
        other_direct_cost_per_unit: 0
      } : null,
      variable_costs: []
    };
    addProduct(newProduct);
    setExpandedProducts(prev => new Set([...prev, newProduct.id]));
  };

  const handleUpdateProduct = (id: string, field: keyof Product, value: string | number) => {
    updateProduct(id, { [field]: value });
  };

  const handleUpdateCOGS = (productId: string, field: keyof COGSPerUnit, value: number) => {
    const product = products.find(p => p.id === productId);
    if (product?.cogs_per_unit) {
      updateProduct(productId, {
        cogs_per_unit: {
          ...product.cogs_per_unit,
          [field]: value
        }
      });
    }
  };

  const getTotalCOGS = (cogs: COGSPerUnit) => {
    return cogs.raw_material_cost + cogs.labor_cost_per_unit + cogs.packaging_cost_per_unit + cogs.other_direct_cost_per_unit;
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Products / Revenue</CardTitle>
          </div>
          <Button size="sm" onClick={handleAddProduct} className="h-8 text-xs sm:text-sm">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {products.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No products added yet</p>
            <Button variant="link" onClick={handleAddProduct} className="text-xs sm:text-sm">Add your first product</Button>
          </div>
        ) : (
          products.map((product) => {
            const isExpanded = expandedProducts.has(product.id);
            return (
              <Collapsible
                key={product.id}
                open={isExpanded}
                onOpenChange={() => toggleExpand(product.id)}
                className="border rounded-lg"
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <CollapsibleTrigger className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-semibold text-sm sm:text-base truncate">{product.name}</span>
                      </div>
                    </CollapsibleTrigger>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Revenue/mo</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {formatBDT(product.selling_price_per_unit * product.units_sold_per_month)}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeProduct(product.id);
                        }}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick info when collapsed */}
                  {!isExpanded && (
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>৳{product.selling_price_per_unit}/{product.unit_label}</span>
                      <span>{product.units_sold_per_month} units/mo</span>
                      {product.cogs_per_unit && (
                        <span>COGS: ৳{getTotalCOGS(product.cogs_per_unit)}</span>
                      )}
                    </div>
                  )}
                </div>

                <CollapsibleContent>
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4 border-t pt-3 sm:pt-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Name</Label>
                        <Input
                          value={product.name}
                          onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                          className="h-8 sm:h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Unit</Label>
                        <Input
                          value={product.unit_label}
                          onChange={(e) => handleUpdateProduct(product.id, 'unit_label', e.target.value)}
                          placeholder="e.g., piece"
                          className="h-8 sm:h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Price (৳)</Label>
                        <Input
                          type="number"
                          value={product.selling_price_per_unit}
                          onChange={(e) => handleUpdateProduct(product.id, 'selling_price_per_unit', Number(e.target.value))}
                          className="h-8 sm:h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] sm:text-xs text-muted-foreground">Units/Month</Label>
                        <Input
                          type="number"
                          value={product.units_sold_per_month}
                          onChange={(e) => handleUpdateProduct(product.id, 'units_sold_per_month', Number(e.target.value))}
                          className="h-8 sm:h-9 text-sm"
                        />
                      </div>
                    </div>

                    {/* COGS Section */}
                    {hasCogs && product.cogs_per_unit && (
                      <>
                        <Separator />
                        <div>
                          <Badge variant="outline" className="mb-2 sm:mb-3 text-[10px] sm:text-xs">Cost of Goods Sold (per unit)</Badge>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-[10px] sm:text-xs text-muted-foreground">Raw Material</Label>
                              <Input
                                type="number"
                                value={product.cogs_per_unit.raw_material_cost}
                                onChange={(e) => handleUpdateCOGS(product.id, 'raw_material_cost', Number(e.target.value))}
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] sm:text-xs text-muted-foreground">Labor</Label>
                              <Input
                                type="number"
                                value={product.cogs_per_unit.labor_cost_per_unit}
                                onChange={(e) => handleUpdateCOGS(product.id, 'labor_cost_per_unit', Number(e.target.value))}
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] sm:text-xs text-muted-foreground">Packaging</Label>
                              <Input
                                type="number"
                                value={product.cogs_per_unit.packaging_cost_per_unit}
                                onChange={(e) => handleUpdateCOGS(product.id, 'packaging_cost_per_unit', Number(e.target.value))}
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] sm:text-xs text-muted-foreground">Other</Label>
                              <Input
                                type="number"
                                value={product.cogs_per_unit.other_direct_cost_per_unit}
                                onChange={(e) => handleUpdateCOGS(product.id, 'other_direct_cost_per_unit', Number(e.target.value))}
                                className="h-8 sm:h-9 text-sm"
                              />
                            </div>
                          </div>
                          <div className="mt-2 text-xs sm:text-sm text-muted-foreground">
                            Total COGS/unit: <span className="font-semibold text-foreground">
                              {formatBDT(getTotalCOGS(product.cogs_per_unit))}
                            </span>
                            <span className="ml-2 text-emerald-600">
                              (Margin: {(((product.selling_price_per_unit - getTotalCOGS(product.cogs_per_unit)) / product.selling_price_per_unit) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })
        )}

        {products.length > 0 && (
          <div className="pt-3 sm:pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total Monthly Revenue:</span>
              <span className="font-bold text-lg text-emerald-600">
                {formatBDT(products.reduce((sum, p) => sum + p.selling_price_per_unit * p.units_sold_per_month, 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
