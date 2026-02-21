'use client';

import { useBudgetStore } from '@/store/budget-store';
import { BusinessSelector } from '@/components/budget/business-selector';
import { ChatPanel } from '@/components/budget/chat-panel';
import { UnifiedCalculator } from '@/components/budget/unified-calculator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { currentStep, businessType, setCurrentStep, resetAll } = useBudgetStore();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset? All your data will be lost.')) {
      resetAll();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                <Calculator className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate">
                  FlexiBudget AI
                </h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden xs:block">Smart P&L Calculator</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {businessType && (
                <Badge variant="secondary" className="hidden md:flex text-xs">
                  {businessType.label}
                </Badge>
              )}
              
              {currentStep !== 'select_business' && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentStep('select_business')}
                    className="h-8 px-2 sm:px-3"
                  >
                    <ArrowLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Back</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleReset}
                    className="h-8 px-2 sm:px-3"
                  >
                    <RotateCcw className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Reset</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Business Selection */}
          {currentStep === 'select_business' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto"
            >
              <BusinessSelector />
            </motion.div>
          )}

          {/* Step 2: AI Onboarding */}
          {currentStep === 'ai_onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <ChatPanel />
            </motion.div>
          )}

          {/* Step 3: Unified Calculator (Configure + Results in one view) */}
          {currentStep === 'configure' && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <UnifiedCalculator />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t py-3 sm:py-4 mt-auto bg-white/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-3 sm:px-4 text-center text-xs sm:text-sm text-muted-foreground">
          <p>FlexiBudget AI • All values in ৳BDT</p>
        </div>
      </footer>
    </div>
  );
}