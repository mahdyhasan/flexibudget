'use client';

import { BUSINESS_TYPES } from '@/types/budget';
import { useBudgetStore } from '@/store/budget-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Building2, Store, Code, Factory, ShoppingBag, Ship, Settings } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Manufacturing & Retail': <Factory className="h-4 w-4 sm:h-5 sm:w-5" />,
  'Food & Beverage': <Store className="h-4 w-4 sm:h-5 sm:w-5" />,
  'Technology': <Code className="h-4 w-4 sm:h-5 sm:w-5" />,
  'Manufacturing': <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />,
  'Retail': <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />,
  'E-commerce': <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />,
  'Trading': <Ship className="h-4 w-4 sm:h-5 sm:w-5" />,
  'Custom': <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
};

const categoryColors: Record<string, string> = {
  'Manufacturing & Retail': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Food & Beverage': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Technology': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Manufacturing': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  'Retail': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'E-commerce': 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'Trading': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  'Custom': 'bg-gray-500/10 text-gray-600 border-gray-500/20'
};

export function BusinessSelector() {
  const { setBusinessType, setCurrentStep } = useBudgetStore();

  const handleSelect = (type: typeof BUSINESS_TYPES[0]) => {
    setBusinessType(type);
    setCurrentStep('ai_onboarding');
  };

  const groupedTypes = BUSINESS_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {} as Record<string, typeof BUSINESS_TYPES>);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      <div className="text-center space-y-1 sm:space-y-2 px-2">
        <h2 className="text-xl sm:text-2xl font-bold">Select Your Business Type</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Choose the type that best describes your business. AI will help you set up.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {BUSINESS_TYPES.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card 
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200 group active:scale-[0.98] h-full"
              onClick={() => handleSelect(type)}
            >
              <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm sm:text-base group-hover:text-primary transition-colors leading-tight">
                    {type.label}
                  </CardTitle>
                  <Badge variant="outline" className={`${categoryColors[type.category] || ''} text-[10px] sm:text-xs shrink-0`}>
                    {categoryIcons[type.category]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0 flex flex-col flex-1">
                <CardDescription className="text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 flex-1">
                  {type.notes}
                </CardDescription>
                <div className="flex gap-1.5 sm:gap-2">
                  {type.has_cogs && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">COGS</Badge>
                  )}
                  {type.has_bom && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">BOM</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
