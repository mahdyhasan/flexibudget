'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useBudgetStore, generateId } from '@/store/budget-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, Sparkles, ArrowRight, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Product, SetupCost, FixedCost } from '@/types/budget';

const QUESTIONS = [
  {
    id: 'scale',
    question: 'What is the scale of your business? (small/home-based, medium, or large)'
  },
  {
    id: 'products',
    question: 'How many products/services do you offer? List 1-3 main ones.'
  },
  {
    id: 'location',
    question: 'Do you have a physical location or operate online only?'
  },
  {
    id: 'startup',
    question: 'Are you already operating or is this a new startup?'
  },
  {
    id: 'amortization',
    question: 'How do you want to spread your setup costs?',
    options: ['Spread over projection period', 'Spread over 12 months']
  }
];

export function ChatPanel() {
  const { 
    businessType, 
    chatMessages, 
    addChatMessage, 
    setCurrentStep,
    addProduct,
    addSetupCost,
    addFixedCost,
    addSemiVariableCost,
    addVariableCost,
    addVariableMarketingPerUnit,
    addVariableMarketingPercentRevenue,
    products,
    setupCosts,
    fixedCosts,
    addFixedMarketing,
    updateProjectionSettings,
    onboardingComplete,
    setOnboardingComplete
  } = useBudgetStore();
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  const initializedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat only once using ref
  useEffect(() => {
    if (initializedRef.current || onboardingComplete || !businessType) {
      return;
    }
    
    initializedRef.current = true;
    
    // Use setTimeout to defer state updates
    const timer1 = setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        content: `Great choice! I'll help you set up a budget calculator for your **${businessType.label}**.\n\n${businessType.notes}\n\nLet me ask a few questions to tailor the calculator.`
      });
    }, 100);
    
    const timer2 = setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        content: QUESTIONS[0].question
      });
    }, 400);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [businessType, onboardingComplete, addChatMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [chatMessages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userInput = input.trim();
    addChatMessage({ role: 'user', content: userInput });
    setInput('');
    setLoading(true);

    const currentQuestion = QUESTIONS[onboardingStep];
    if (currentQuestion) {
      setUserResponses(prev => ({ ...prev, [currentQuestion.id]: userInput }));
    }

    // If not the last question, ask next question
    if (onboardingStep < QUESTIONS.length - 1) {
      const nextStep = onboardingStep + 1;
      setOnboardingStep(nextStep);
      
      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: QUESTIONS[nextStep].question + 
            (QUESTIONS[nextStep].options 
              ? '\n\n' + QUESTIONS[nextStep].options.map((o, i) => `${i + 1}. ${o}`).join('\n')
              : '')
        });
        setLoading(false);
      }, 400);
    } else {
      // Last question answered - generate environment using OpenAI
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generateEnvironment: true,
            businessType,
            userResponses: { ...userResponses, [currentQuestion.id]: userInput }
          })
        });

        const data = await response.json();
        
        if (data.environment) {
          // Add products
          data.environment.products?.forEach((p: Product) => {
            const product = {
              ...p,
              id: p.id || generateId(),
              cogs_per_unit: p.cogs_per_unit || null,
              variable_costs: p.variable_costs || []
            };
            addProduct(product);
          });
          
          // Add setup costs
          data.environment.setup_costs?.forEach((c: SetupCost) => {
            addSetupCost({
              ...c,
              id: c.id || generateId(),
              amortized_monthly: c.total_amount / 12 // Default to 12 months
            });
          });
          
          // Add fixed costs
          data.environment.fixed_costs?.forEach((c: FixedCost) => {
            addFixedCost({
              ...c,
              id: c.id || generateId()
            });
          });
          
          // Add semi-variable costs
          data.environment.semi_variable_costs?.forEach((c: any) => {
            addSemiVariableCost({
              ...c,
              id: c.id || generateId(),
              unit_reference: c.unit_reference || 'all_products_combined'
            });
          });
          
          // Add variable costs
          data.environment.variable_costs?.forEach((c: any) => {
            addVariableCost({
              ...c,
              id: c.id || generateId(),
              product_reference: c.product_reference || 'all_products'
            });
          });
          
          // Add marketing costs
          if (data.environment.marketing_costs) {
            data.environment.marketing_costs.fixed_marketing?.forEach((c: any) => {
              addFixedMarketing({
                ...c,
                id: c.id || generateId()
              });
            });
            data.environment.marketing_costs.variable_marketing_per_unit?.forEach((c: any) => {
              addVariableMarketingPerUnit({
                ...c,
                id: c.id || generateId(),
                product_reference: c.product_reference || 'all_products'
              });
            });
            data.environment.marketing_costs.variable_marketing_percent_revenue?.forEach((c: any) => {
              addVariableMarketingPercentRevenue({
                ...c,
                id: c.id || generateId(),
                revenue_reference: c.revenue_reference || 'total_revenue'
              });
            });
          }
          
          // Update projection settings
          if (data.environment.projection_defaults) {
            updateProjectionSettings(data.environment.projection_defaults);
          }

          // Add insights if provided
          const insights = data.environment.insights;
          let insightsText = '';
          if (insights) {
            if (insights.key_drivers?.length) {
              insightsText += `\n📈 **Key Drivers:**\n${insights.key_drivers.map((d: string) => `• ${d}`).join('\n')}`;
            }
            if (insights.risk_factors?.length) {
              insightsText += `\n⚠️ **Risk Factors:**\n${insights.risk_factors.map((r: string) => `• ${r}`).join('\n')}`;
            }
            if (insights.recommendations?.length) {
              insightsText += `\n💡 **Recommendations:**\n${insights.recommendations.map((r: string) => `• ${r}`).join('\n')}`;
            }
          }

          addChatMessage({
            role: 'assistant',
            content: `Perfect! I've created a budget calculator for your **${businessType?.label}**.\n\n✅ ${data.environment.products?.length || 0} products\n✅ ${data.environment.setup_costs?.length || 0} setup costs\n✅ ${data.environment.fixed_costs?.length || 0} fixed costs\n✅ ${data.environment.semi_variable_costs?.length || 0} semi-variable costs\n✅ ${data.environment.variable_costs?.length || 0} variable costs\n✅ ${data.environment.marketing_costs?.fixed_marketing?.length || 0} marketing costs\n\n${insightsText}\n\nClick "Continue" to review and customize your budget in real-time!`
          });
        } else {
          addChatMessage({
            role: 'assistant',
            content: `Thanks! I have enough information. Click "Continue" to proceed to the configuration panel.`
          });
        }
      } catch (error) {
        console.error('Environment generation error:', error);
        addChatMessage({
          role: 'assistant',
          content: 'I encountered an issue generating your budget. Click "Continue" to proceed to setup manually, or try again.'
        });
      }
      
      setOnboardingComplete(true);
      setLoading(false);
    }
  }, [input, loading, onboardingStep, businessType, userResponses, addChatMessage, addProduct, addSetupCost, addFixedCost, addFixedMarketing, updateProjectionSettings, setOnboardingComplete, addSemiVariableCost, addVariableCost, addVariableMarketingPerUnit, addVariableMarketingPercentRevenue]);

  const handleContinue = () => {
    setCurrentStep('configure');
  };

  const handleSkip = () => {
    if (businessType && products.length === 0) {
      const defaultProduct: Product = {
        id: generateId(),
        name: 'Product 1',
        unit_label: 'unit',
        selling_price_per_unit: 100,
        units_sold_per_month: 100,
        cogs_per_unit: businessType.has_cogs ? {
          raw_material_cost: 30,
          labor_cost_per_unit: 10,
          packaging_cost_per_unit: 5,
          other_direct_cost_per_unit: 0
        } : null,
        variable_costs: []
      };
      addProduct(defaultProduct);

      const defaultSetup: SetupCost = {
        id: generateId(),
        name: 'Initial Setup',
        total_amount: 50000,
        amortized_monthly: 50000 / 12
      };
      addSetupCost(defaultSetup);

      const defaultFixed: FixedCost = {
        id: generateId(),
        name: 'Monthly Rent',
        amount_per_month: 10000
      };
      addFixedCost(defaultFixed);
    }
    setOnboardingComplete(true);
    setCurrentStep('configure');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-[500px] sm:h-[600px] flex flex-col">
      <CardHeader className="border-b p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-sm sm:text-lg">FlexiBudget AI</CardTitle>
              <Badge variant="secondary" className="text-[10px] sm:text-xs truncate max-w-[120px]">
                {businessType?.label}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleSkip} className="h-8 text-xs sm:text-sm">
              <SkipForward className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Skip</span>
            </Button>
            {(products.length > 0 || setupCosts.length > 0 || fixedCosts.length > 0 || onboardingComplete) && (
              <Button size="sm" onClick={handleContinue} className="h-8 text-xs sm:text-sm">
                Continue <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-3 sm:p-4" ref={scrollRef} style={{ maxHeight: 'calc(100% - 80px)' }}>
          <div className="space-y-3 sm:space-y-4">
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-primary/10">
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0 mt-0.5">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 sm:gap-3"
              >
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10">
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-2 sm:p-3">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 border-t shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              disabled={loading}
              className="flex-1 h-9 sm:h-10 text-sm"
            />
            <Button type="submit" disabled={loading || !input.trim()} size="sm" className="h-9 sm:h-10 px-3">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
