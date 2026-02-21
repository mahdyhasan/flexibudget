'use client';

import { useState } from 'react';
import { useBudgetStore, generateId } from '@/store/budget-store';
import { useBudgetCalculator } from '@/hooks/use-budget-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, RotateCcw, BarChart3 } from 'lucide-react';
import { ProductsPanel } from '@/components/budget/products-panel';
import { CostsPanel } from '@/components/budget/costs-panel';
import { ProjectionPanel } from '@/components/budget/projection-panel';
import { ResultsPanel } from '@/components/budget/results-panel';
import { motion, AnimatePresence } from 'framer-motion';

export function UnifiedCalculator() {
  const { businessType, setCurrentStep, resetAll } = useBudgetStore();
  const results = useBudgetCalculator();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? All your data will be lost.')) {
      resetAll();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-120px)]">
      {/* Left Panel: Collapsible Input Sections */}
      <div className="w-full lg:w-[450px] xl:w-[500px] flex-shrink-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b p-4 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-lg font-bold truncate">
                  {businessType?.label || 'Budget Calculator'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep('select_business')}
                  className="h-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            <Accordion type="multiple" defaultValue={['products']} className="space-y-3">
              {/* Products Section */}
              <AccordionItem value="products">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  📦 Products & Revenue
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <ProductsPanel />
                </AccordionContent>
              </AccordionItem>

              {/* Costs Section */}
              <AccordionItem value="costs">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  💰 Costs
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <CostsPanel />
                </AccordionContent>
              </AccordionItem>

              {/* Projection Section */}
              <AccordionItem value="projection">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  ⚙️ Projection Settings
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <ProjectionPanel />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </Card>
      </div>

      {/* Right Panel: Fixed Results Display */}
      <div className="flex-1 min-w-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b p-4 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-Time Results
              </CardTitle>
              {results && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Auto-updating</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            {results ? (
              <ResultsPanel />
            ) : (
              <div className="h-full flex items-center justify-center text-center py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Start Adding Your Business Data
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Add products and costs to see real-time P&L calculations. 
                      Results update automatically as you type.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}