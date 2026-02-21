import { NextRequest, NextResponse } from 'next/server';
import type { CalculationResults, Product } from '@/types/budget';

// Simple PDF generation using HTML to PDF conversion
// This is a lightweight approach that doesn't require complex PDF libraries

export async function POST(request: NextRequest) {
  try {
    const { results, products, businessName } = await request.json();
    
    if (!results) {
      return NextResponse.json({ error: 'No results to export' }, { status: 400 });
    }

    // Generate a simple HTML report that can be printed to PDF
    const html = generateHTMLReport(results as CalculationResults, products as Product[], businessName);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="flexibudget_report.html"'
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function generateHTMLReport(results: CalculationResults, products: Product[], businessName: string): string {
  const isProfit = results.netPnL >= 0;
  const date = new Date().toLocaleDateString('en-BD', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlexiBudget AI - Financial Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 40px;
      background: #fff;
      color: #1e293b;
    }
    .header { 
      border-bottom: 2px solid #10b981; 
      padding-bottom: 20px; 
      margin-bottom: 30px;
    }
    .logo { 
      display: flex; 
      align-items: center; 
      gap: 12px;
      margin-bottom: 10px;
    }
    .logo-icon { 
      width: 48px; 
      height: 48px; 
      background: linear-gradient(135deg, #10b981, #0d9488); 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      color: white;
      font-size: 24px;
    }
    .logo-text h1 { 
      font-size: 24px; 
      background: linear-gradient(90deg, #10b981, #0d9488);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo-text p { color: #64748b; font-size: 12px; }
    .business-name { font-size: 18px; color: #334155; margin-top: 10px; }
    .date { color: #94a3b8; font-size: 14px; }
    
    .summary-cards { 
      display: grid; 
      grid-template-columns: repeat(4, 1fr); 
      gap: 16px; 
      margin-bottom: 30px;
    }
    .card { 
      padding: 20px; 
      border-radius: 12px; 
      border: 1px solid #e2e8f0;
    }
    .card-label { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .card-value { font-size: 24px; font-weight: 700; }
    .card.profit .card-value { color: #10b981; }
    .card.loss .card-value { color: #ef4444; }
    .card.revenue .card-value { color: #3b82f6; }
    .card.margin .card-value { color: #f59e0b; }
    
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      margin-bottom: 16px; 
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      font-size: 14px;
    }
    th { 
      background: #1e293b; 
      color: white; 
      padding: 12px 8px; 
      text-align: left;
      font-weight: 500;
    }
    td { 
      padding: 12px 8px; 
      border-bottom: 1px solid #e2e8f0;
    }
    tr:nth-child(even) { background: #f8fafc; }
    .text-right { text-align: right; }
    .profit-value { color: #10b981; font-weight: 600; }
    .loss-value { color: #ef4444; font-weight: 600; }
    
    .breakeven-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .breakeven-item {
      padding: 16px;
      background: #f8fafc;
      border-radius: 8px;
      text-align: center;
    }
    .breakeven-label { font-size: 12px; color: #64748b; }
    .breakeven-value { font-size: 20px; font-weight: 700; color: #8b5cf6; margin-top: 8px; }
    
    .footer { 
      margin-top: 40px; 
      padding-top: 20px; 
      border-top: 1px solid #e2e8f0; 
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
    }
    
    @media print {
      body { padding: 20px; }
      .summary-cards { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">📊</div>
      <div class="logo-text">
        <h1>FlexiBudget AI</h1>
        <p>Smart P&L Calculator</p>
      </div>
    </div>
    ${businessName ? `<p class="business-name">${businessName}</p>` : ''}
    <p class="date">Generated on ${date}</p>
  </div>

  <div class="summary-cards">
    <div class="card ${isProfit ? 'profit' : 'loss'}">
      <div class="card-label">Net P&L</div>
      <div class="card-value">৳${results.netPnL.toLocaleString()}</div>
    </div>
    <div class="card revenue">
      <div class="card-label">Total Revenue</div>
      <div class="card-value">৳${results.totalRevenue.toLocaleString()}</div>
    </div>
    <div class="card">
      <div class="card-label">Gross Profit</div>
      <div class="card-value">৳${results.grossProfit.toLocaleString()}</div>
    </div>
    <div class="card margin">
      <div class="card-label">Net Margin</div>
      <div class="card-value">${results.netMarginPercent.toFixed(1)}%</div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Breakeven Analysis</h2>
    <div class="breakeven-grid">
      <div class="breakeven-item">
        <div class="breakeven-label">Breakeven Units</div>
        <div class="breakeven-value">${results.breakeven.breakevenUnitsTotal.toLocaleString()}</div>
      </div>
      <div class="breakeven-item">
        <div class="breakeven-label">Breakeven Revenue</div>
        <div class="breakeven-value">৳${results.breakeven.breakevenRevenue.toLocaleString()}</div>
      </div>
      <div class="breakeven-item">
        <div class="breakeven-label">Months to Breakeven</div>
        <div class="breakeven-value">${results.breakeven.monthsToBreakeven || 'N/A'}</div>
      </div>
    </div>
  </div>

  ${products.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Products Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="text-right">Price/Unit</th>
          <th class="text-right">Units/Month</th>
          <th class="text-right">Revenue</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
        <tr>
          <td>${p.name}</td>
          <td class="text-right">৳${p.selling_price_per_unit.toLocaleString()}</td>
          <td class="text-right">${p.units_sold_per_month.toLocaleString()}</td>
          <td class="text-right">৳${(p.selling_price_per_unit * p.units_sold_per_month).toLocaleString()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <h2 class="section-title">Monthly P&L Statement (First 12 Months)</h2>
    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th class="text-right">Revenue</th>
          <th class="text-right">COGS</th>
          <th class="text-right">Gross Profit</th>
          <th class="text-right">Total Costs</th>
          <th class="text-right">Net P&L</th>
          <th class="text-right">Margin %</th>
        </tr>
      </thead>
      <tbody>
        ${results.monthlyPnL.slice(0, 12).map(m => `
        <tr>
          <td>Month ${m.month}</td>
          <td class="text-right">৳${m.revenue.toLocaleString()}</td>
          <td class="text-right">৳${m.cogs.toLocaleString()}</td>
          <td class="text-right">৳${m.grossProfit.toLocaleString()}</td>
          <td class="text-right">৳${m.totalCosts.toLocaleString()}</td>
          <td class="text-right ${m.netPnL >= 0 ? 'profit-value' : 'loss-value'}">৳${m.netPnL.toLocaleString()}</td>
          <td class="text-right">${m.marginPercent.toFixed(1)}%</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>FlexiBudget AI • All monetary values in ৳BDT (Bangladeshi Taka)</p>
    <p>This report is generated for planning purposes only. Consult a financial advisor for business decisions.</p>
  </div>
</body>
</html>
`;
}
