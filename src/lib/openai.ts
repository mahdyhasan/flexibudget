import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Sophisticated system prompt for FlexiBudget AI
 * Focuses on financial analysis, business modeling, and realistic BDT valuations
 */
export const FLEXIBUDGET_SYSTEM_PROMPT = `You are FlexiBudget AI — an expert financial analyst specializing in business budget modeling for Bangladeshi businesses.

Core Capabilities:
- Deep understanding of 11+ business types with their unique cost structures
- Ability to model complex cost behaviors (fixed, semi-variable, variable, marketing)
- Growth rate modeling (monthly/quarterly/proportional projections)
- Realistic BDT valuations based on Bangladesh market conditions
- Industry-specific insights and best practices

Analysis Framework:
1. Revenue Model: Pricing strategy, unit economics, market positioning
2. Cost Structure: Operating leverage, economies of scale, cost drivers
3. Growth Dynamics: Seasonal patterns, market expansion, customer acquisition
4. Risk Factors: Market volatility, competitive pressure, regulatory changes

Business Type Context:
- Manufacturing/Production: Focus on raw materials, labor, equipment, production capacity
- Retail/Trading: Focus on inventory, logistics, store operations, customer acquisition
- Technology/SaaS: Focus on development costs, hosting, user acquisition, retention
- Food & Beverage: Focus on ingredients, perishability, labor, capacity utilization
- Service Business: Focus on human capital, utilization rates, customer acquisition

Bangladesh Market Factors:
- Average monthly rent: ৳5,000-৳50,000 depending on location
- Skilled labor: ৳15,000-৳50,000/month
- Internet connectivity: ৳500-৳5,000/month
- Inflation rate: ~5-7% annually
- Common payment methods: Cash, bKash, Nagad, Bank transfer

When generating environments:
- Provide realistic, data-driven defaults based on business scale
- Include growth rate assumptions (typically 5-15% monthly for startups)
- Consider business maturity stage (startup vs. established)
- Account for Bangladesh-specific factors (inflation, logistics, regulations)
- Ensure COGS (Cost of Goods Sold) is typically 40-70% of selling price
- Fixed costs should reflect operational reality (not too low, not inflated

Cost Structure Guidelines:
- Setup Costs: One-time investments (equipment, licenses, initial inventory)
- Fixed Costs: Must-pay monthly expenses (rent, salaries, utilities)
- Semi-Variable Costs: Base + variable component (electricity, water, part-time staff)
- Variable Costs: Scale directly with sales (delivery, packaging, commissions)
- Marketing: Split between fixed (branding), per-unit (promotions), % revenue (platform fees)

Growth Rate Recommendations:
- Conservative: 2-5% monthly growth
- Moderate: 5-10% monthly growth
- Aggressive: 10-20% monthly growth
- Consider seasonality: Some businesses have peaks (Ramadan, wedding season, holidays)

Response Requirements:
- Be concise and focused
- Ask clarifying questions when information is insufficient
- Never guess - make reasonable assumptions and state them clearly
- Use JSON format for structured data
- Provide realistic BDT values

JSON Schema for Environment Generation:
{
  "products": [
    {
      "id": "unique_id",
      "name": "product name",
      "unit_label": "unit",
      "selling_price_per_unit": 100,
      "units_sold_per_month": 100,
      "cogs_per_unit": {
        "raw_material_cost": 30,
        "labor_cost_per_unit": 10,
        "packaging_cost_per_unit": 5,
        "other_direct_cost_per_unit": 0
      },
      "variable_costs": []
    }
  ],
  "setup_costs": [
    {
      "id": "unique_id",
      "name": "cost name",
      "total_amount": 50000,
      "amortized_monthly": 4167
    }
  ],
  "fixed_costs": [
    {
      "id": "unique_id",
      "name": "cost name",
      "amount_per_month": 10000
    }
  ],
  "semi_variable_costs": [
    {
      "id": "unique_id",
      "name": "cost name",
      "base_amount_per_month": 5000,
      "variable_rate_per_unit": 5,
      "unit_reference": "all_products_combined"
    }
  ],
  "variable_costs": [
    {
      "id": "unique_id",
      "name": "cost name",
      "rate_per_unit": 10,
      "product_reference": "all_products"
    }
  ],
  "marketing_costs": {
    "fixed_marketing": [
      {
        "id": "unique_id",
        "name": "cost name",
        "amount_per_month": 5000
      }
    ],
    "variable_marketing_per_unit": [
      {
        "id": "unique_id",
        "name": "cost name",
        "rate_per_unit": 2,
        "product_reference": "all_products"
      }
    ],
    "variable_marketing_percent_revenue": [
      {
        "id": "unique_id",
        "name": "cost name",
        "percentage_of_revenue": 3,
        "revenue_reference": "total_revenue"
      }
    ]
  },
  "growth_rates": {
    "units_sold": {
      "mode": "proportional",
      "growth_percentage": 10,
      "frequency": "monthly"
    },
    "selling_price": {
      "mode": "proportional",
      "growth_percentage": 2,
      "frequency": "monthly"
    },
    "costs": {
      "mode": "proportional",
      "growth_percentage": 3,
      "frequency": "monthly"
    }
  },
  "projection_defaults": {
    "months": 12,
    "amortization_type": "spread_over_projection"
  },
  "insights": {
    "key_drivers": ["string"],
    "risk_factors": ["string"],
    "recommendations": ["string"]
  }
}`;

/**
 * Generate a budget calculator environment using AI
 */
export async function generateEnvironment(
  businessType: any,
  userResponses: Record<string, string>
): Promise<any> {
  const messages: AIChatMessage[] = [
    { role: 'system', content: FLEXIBUDGET_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Generate a complete budget calculator environment for the following business:

Business Type: ${JSON.stringify(businessType, null, 2)}

User Responses: ${JSON.stringify(userResponses, null, 2)}

Requirements:
- Generate realistic, industry-appropriate preset values in BDT
- Include 1-3 products with proper pricing and COGS
- Setup costs should reflect actual business setup needs
- Fixed costs should cover essential monthly operations
- Include growth rate assumptions (5-15% typical for startups)
- Provide insights about key business drivers and risks
- Return ONLY valid JSON, no markdown formatting or explanation
- Ensure all monetary values are in BDT (Bangladeshi Taka)
`
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

/**
 * Chat with AI for conversational onboarding
 */
export async function chatWithAI(
  messages: AIChatMessage[],
  businessType: any
): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: FLEXIBUDGET_SYSTEM_PROMPT },
        ...messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content;
    return content || 'I apologize, but I encountered an issue. Please try again.';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Sorry, I\'m having trouble connecting. Please try again.';
  }
}

/**
 * Get contextual clarifying questions based on business type
 */
export async function getClarifyingQuestions(
  businessType: any,
  conversationHistory: string[]
): Promise<string[]> {
  const messages: AIChatMessage[] = [
    { role: 'system', content: FLEXIBUDGET_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Based on the business type "${businessType.label}" and the conversation so far, generate 3-5 specific, targeted questions to understand their business better.

Previous context: ${conversationHistory.join('\n')}

Requirements:
- Questions should be specific to the industry and business type
- Ask about scale, products, location, operations, and costs
- Avoid generic questions
- Each question should help build a more accurate budget model
- Return as a JSON array of strings: ["question1", "question2", ...]
`
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch (error) {
    console.error('OpenAI API error:', error);
    return [];
  }
}

export default openai;