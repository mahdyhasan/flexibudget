'use client';

import { useBudgetStore } from '@/store/budget-store';
import { useBudgetCalculator } from '@/hooks/use-budget-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PieChart, LineChart, FileSpreadsheet, FileText } from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { formatBDT } from '@/lib/calculations';
import type { CalculationResults } from '@/types/budget';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

export function ResultsPanel() {
  const { products, businessType } = useBudgetStore();
  const results = useBudgetCalculator();

  if (!results) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <CardContent className="text-center py-8 sm:py-12">
          <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground text-sm">Add products to see your P&L analysis</p>
        </CardContent>
      </Card>
    );
  }

  const isProfit = results.netPnL >= 0;

  // Chart data
  const revenueVsCostData = results.monthlyPnL.slice(0, 12).map(m => ({
    name: `M${m.month}`,
    Revenue: m.revenue,
    Costs: m.totalCosts,
    Profit: m.netPnL
  }));

  const costBreakdownData = [
    { name: 'Fixed', value: results.monthlyPnL[0]?.fixedCosts || 0 },
    { name: 'Semi-Var', value: results.monthlyPnL[0]?.semiVariableCosts || 0 },
    { name: 'Variable', value: results.monthlyPnL[0]?.variableCosts || 0 },
    { name: 'Marketing', value: results.monthlyPnL[0]?.marketingCosts || 0 },
    { name: 'Setup', value: results.monthlyPnL[0]?.setupCostAmortized || 0 }
  ].filter(d => d.value > 0);

  const handleExportCSV = () => {
    const headers = ['Month', 'Revenue', 'COGS', 'Gross Profit', 'Fixed Costs', 'Variable Costs', 'Marketing', 'Net P&L', 'Margin %'];
    const rows = results.monthlyPnL.map(m => [
      m.month, m.revenue, m.cogs, m.grossProfit, m.fixedCosts, m.variableCosts, m.marketingCosts, m.netPnL, m.marginPercent.toFixed(1)
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flexibudget_pnl.csv';
    a.click();
  };

  const handleExportPDF = async () => {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        results,
        products,
        businessName: businessType?.label || 'Business'
      })
    });
    
    const html = await response.text();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const formatShort = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card className={isProfit ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Net P&L</p>
                <p className={`text-base sm:text-2xl font-bold ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatBDT(results.netPnL)}
                </p>
              </div>
              {isProfit ? <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500/50" /> : <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-red-500/50" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Revenue</p>
                <p className="text-base sm:text-2xl font-bold">{formatBDT(results.totalRevenue)}</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Net Margin</p>
                <p className="text-base sm:text-2xl font-bold">{results.netMarginPercent.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Breakeven</p>
                <p className="text-base sm:text-2xl font-bold">{formatShort(results.breakeven.breakevenUnitsTotal)}</p>
                {results.breakeven.monthsToBreakeven && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{results.breakeven.monthsToBreakeven} mo</p>
                )}
              </div>
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-violet-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trend" className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <TabsList className="h-9 sm:h-10">
            <TabsTrigger value="trend" className="text-[10px] sm:text-xs px-2 sm:px-3"><LineChart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /> <span className="hidden sm:inline">Trend</span></TabsTrigger>
            <TabsTrigger value="breakdown" className="text-[10px] sm:text-xs px-2 sm:px-3"><PieChart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /> <span className="hidden sm:inline">Breakdown</span></TabsTrigger>
            <TabsTrigger value="table" className="text-[10px] sm:text-xs px-2 sm:px-3"><BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /> <span className="hidden sm:inline">Table</span></TabsTrigger>
          </TabsList>
          <div className="flex gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="h-8 text-[10px] sm:text-xs px-2 sm:px-3">
              <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 text-[10px] sm:text-xs px-2 sm:px-3">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /> PDF
            </Button>
          </div>
        </div>

        <TabsContent value="trend" className="mt-0">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Revenue vs Costs</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <AreaChart data={revenueVsCostData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-[10px] sm:text-xs" />
                  <YAxis className="text-[10px] sm:text-xs" tickFormatter={(v) => formatShort(v)} width={40} />
                  <Tooltip formatter={(value: number) => formatBDT(value)} contentStyle={{ fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="Revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Costs" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="Profit" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-0">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <RechartsPieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {costBreakdownData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatBDT(value)} contentStyle={{ fontSize: '12px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="mt-0">
          <Card>
            <CardHeader className="pb-2 p-3 sm:p-4">
              <CardTitle className="text-sm sm:text-base">Monthly P&L</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-4 pt-0">
              <ScrollArea className="h-[300px] sm:h-[350px]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] sm:text-xs p-2 sm:p-3">Mo</TableHead>
                      <TableHead className="text-[10px] sm:text-xs p-2 sm:p-3 text-right">Revenue</TableHead>
                      <TableHead className="text-[10px] sm:text-xs p-2 sm:p-3 text-right hidden sm:table-cell">COGS</TableHead>
                      <TableHead className="text-[10px] sm:text-xs p-2 sm:p-3 text-right">Costs</TableHead>
                      <TableHead className="text-[10px] sm:text-xs p-2 sm:p-3 text-right">P&L</TableHead>
                      <TableHead className="text-[10px] sm:text-xs p-2 sm:p-3 text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.monthlyPnL.slice(0, 12).map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="font-medium text-[10px] sm:text-xs p-2 sm:p-3">{m.month}</TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs p-2 sm:p-3">{formatShort(m.revenue)}</TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs p-2 sm:p-3 hidden sm:table-cell">{formatShort(m.cogs)}</TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs p-2 sm:p-3">{formatShort(m.totalCosts)}</TableCell>
                        <TableCell className={`text-right font-medium text-[10px] sm:text-xs p-2 sm:p-3 ${m.netPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatShort(m.netPnL)}
                        </TableCell>
                        <TableCell className="text-right text-[10px] sm:text-xs p-2 sm:p-3">{m.marginPercent.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
