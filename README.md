# 🚀 FlexiBudget AI

A modern, intelligent P&L (Profit & Loss) calculator designed for businesses of all types. Plan, project, and analyze your business finances with AI-powered assistance and comprehensive financial modeling.

## ✨ Features

### 🎯 Smart Business Modeling
- **11 Pre-configured Business Types** - Quick start with templates for:
  - Manufacturing & Retail (Shoe Business, Fashion & Apparel, Jewellery)
  - Food & Beverage (Restaurant)
  - Technology (SaaS, Software Development Agency)
  - E-commerce (Facebook/Social Commerce)
  - Trading (Import & Trading)
  - Retail Store
  - Custom Business option
- **AI-Powered Onboarding** - Describe your business and let AI generate initial data structure
- **Multi-Product Support** - Manage multiple products with individual pricing and COGS

### 💰 Comprehensive Cost Modeling
- **Setup Costs** - One-time costs with amortization options (spread over projection or 12 months)
- **Fixed Costs** - Recurring expenses that remain constant (rent, salaries, utilities)
- **Semi-Variable Costs** - Base costs plus per-unit rates (electricity, maintenance)
- **Variable Costs** - Per-unit expenses tied directly to production volume
- **Marketing Costs** - Three flexible models:
  - Fixed monthly spend
  - Per-unit marketing costs
  - Percentage of revenue-based marketing

### 📊 Advanced Projections
- **Flexible Time Horizons** - Project for any number of months
- **Growth Rate Models**:
  - **Monthly Mode** - Define exact values for each month
  - **Quarterly Mode** - Values hold constant for 3-month quarters
  - **Proportional Mode** - Compound growth with monthly or quarterly frequency
- **Apply Growth To**:
  - Units sold per product
  - Selling prices
  - Fixed costs
  - Variable costs

### 📈 Powerful Analytics
- **Real-time P&L Calculations** - Instant updates as you modify inputs
- **Monthly Breakdown** - Detailed month-by-month projections
- **Breakeven Analysis**:
  - Breakeven units per product
  - Total breakeven revenue
  - Months to recover setup costs
- **Visual Charts** - Beautiful data visualizations with Recharts
- **Margin Tracking** - Net profit margin percentages

### 🎨 Modern User Experience
- **Intuitive Multi-Step Workflow**:
  1. Select business type
  2. AI onboarding chat
  3. Configure products and costs
  4. View and analyze results
- **Real-time Calculations** - See results update instantly
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - Built-in theme switching
- **Smooth Animations** - Micro-interactions with Framer Motion
- **Export Functionality** - Download your projections

## 🛠️ Technology Stack

### Core Framework
- **⚡ Next.js 16** - React framework with App Router for optimal performance
- **📘 TypeScript 5** - Type-safe codebase for reliability
- **🎨 Tailwind CSS 4** - Modern utility-first styling

### UI Components & Styling
- **🧩 shadcn/ui** - High-quality, accessible components built on Radix UI
- **🎯 Lucide React** - Beautiful, consistent icon library
- **🌈 Framer Motion** - Production-ready animations
- **🎨 Next Themes** - Seamless dark/light mode switching

### Forms & Validation
- **🎣 React Hook Form** - Performant form handling
- **✅ Zod** - TypeScript-first schema validation

### State Management & Data
- **🐻 Zustand** - Simple, scalable state management
- **🔄 TanStack Query** - Powerful data synchronization
- **📊 TanStack Table** - Advanced data tables
- **🖱️ DND Kit** - Modern drag-and-drop functionality

### Backend & AI
- **🗄️ Prisma** - Type-safe ORM for database operations
- **🔐 NextAuth.js** - Complete authentication solution
- **🤖 OpenAI Integration** - AI-powered business onboarding

### Advanced Features
- **📊 Recharts** - Beautiful data visualizations
- **🖼️ Sharp** - High-performance image processing
- **🌍 Next Intl** - Internationalization support
- **📅 Date-fns** - Modern date utilities
- **🪝 ReactUse** - Essential React hooks collection

## 🚀 Quick Start

```bash
# Install dependencies
bun install
# or
npm install

# Set up database (if using Prisma)
bun run db:push

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000) to see your application running.

## 📁 Project Structure

```
flexibudget/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                 # API routes
│   │   │   ├── calculate/      # Calculation endpoints
│   │   │   ├── chat/           # AI chat endpoints
│   │   │   └── export/         # Data export endpoints
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main application page
│   │   └── globals.css         # Global styles
│   │
│   ├── components/              # React components
│   │   ├── budget/             # Budget-specific components
│   │   │   ├── business-selector.tsx    # Business type selection
│   │   │   ├── chat-panel.tsx           # AI onboarding chat
│   │   │   ├── costs-panel.tsx          # Cost configuration
│   │   │   ├── products-panel.tsx       # Product management
│   │   │   ├── projection-panel.tsx     # Projection settings
│   │   │   ├── results-panel.tsx        # Results display
│   │   │   └── unified-calculator.tsx   # Main calculator interface
│   │   └── ui/                 # shadcn/ui components
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-budget-calculator.ts  # Budget calculation logic
│   │   ├── use-mobile.ts            # Mobile detection
│   │   └── use-toast.ts             # Toast notifications
│   │
│   ├── lib/                     # Utility functions
│   │   ├── calculations.ts     # Core P&L calculation logic
│   │   ├── db.ts               # Database utilities
│   │   ├── openai.ts           # OpenAI integration
│   │   └── utils.ts            # General utilities
│   │
│   ├── store/                   # State management
│   │   └── budget-store.ts     # Zustand store for budget state
│   │
│   └── types/                   # TypeScript type definitions
│       └── budget.ts           # Budget-related types
│
├── prisma/                      # Prisma ORM
│   └── schema.prisma           # Database schema
│
├── public/                      # Static assets
│   ├── logo.svg                # Application logo
│   └── robots.txt              # SEO robots file
│
└── package.json                # Dependencies and scripts
```

## 🎯 How It Works

### Step 1: Select Your Business Type
Choose from 11 pre-configured business types or create a custom one. Each type comes with recommended settings and notes tailored to that industry.

### Step 2: AI Onboarding (Optional)
Chat with the AI assistant to describe your business in natural language. The AI will:
- Understand your business model
- Generate initial product suggestions
- Recommend relevant cost categories
- Provide realistic default values

### Step 3: Configure Your Model
Set up your financial model with detailed inputs:

**Products:**
- Name and unit label
- Selling price per unit
- Units sold per month
- COGS breakdown (raw materials, labor, packaging, other costs)

**Costs:**
- Setup costs with amortization preferences
- Fixed monthly expenses
- Semi-variable costs (base + per-unit)
- Variable costs per unit
- Marketing costs (fixed, per-unit, or % of revenue)

**Projections:**
- Time horizon (number of months)
- Amortization method for setup costs
- Growth rates for products and costs (monthly/quarterly/proportional)

### Step 4: Analyze Results
View comprehensive P&L projections:
- Monthly revenue, COGS, gross profit
- Operating costs breakdown
- Net profit/loss and margins
- Breakeven analysis
- Visual charts and tables

## 💡 Key Capabilities

### Advanced Growth Modeling
The system supports three sophisticated growth rate modes:

1. **Monthly Mode** - Define exact values for each month (perfect for seasonal businesses)
2. **Quarterly Mode** - Values remain constant for 3-month quarters
3. **Proportional Mode** - Compound growth with configurable frequency
   - Monthly compounding: Vₜ = V₀ × (1 + r)^(t-1)
   - Quarterly compounding: Vₜ = V₀ × (1 + r)^⌊(t-1)/3⌋

### Complex Cost Structures
- **Semi-Variable Costs** - Combine fixed base with variable per-unit rates
- **Marketing Flexibility** - Three models to capture real-world marketing spend
- **Multi-Product Analysis** - Aggregate metrics while maintaining product-level detail

### Breakeven Intelligence
- Weighted average contribution margin calculation
- Product-specific breakeven units
- Total breakeven revenue
- Cumulative P&L tracking to find months-to-breakeven

### Real-Time Feedback
All calculations happen instantly as you modify inputs, enabling:
- Quick what-if scenarios
- Sensitivity analysis
- Rapid iteration on financial models

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# OpenAI API Key (for AI onboarding)
OPENAI_API_KEY=your_openai_api_key_here

# Database URL (if using Prisma)
DATABASE_URL=file:./dev.db

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

### Database Setup (Optional)
If using Prisma for data persistence:

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Run migrations (production)
bun run db:migrate
```

## 📊 Available Components

### UI Components (shadcn/ui)
The application includes a comprehensive set of UI components:
- Layout: Card, Separator, Aspect Ratio, Resizable Panels
- Forms: Input, Textarea, Select, Checkbox, Radio Group, Switch
- Feedback: Alert, Toast (Sonner), Progress, Skeleton
- Navigation: Breadcrumb, Menubar, Navigation Menu, Pagination
- Overlay: Dialog, Sheet, Popover, Tooltip, Hover Card
- Data Display: Badge, Avatar, Calendar

### Data Visualization
- **Interactive Charts** - Line charts, bar charts, and area charts with Recharts
- **Data Tables** - Sortable, filterable tables with TanStack Table
- **Responsive Dashboards** - Adaptive layouts for different screen sizes

## 🌟 Why FlexiBudget?

- **🚀 Fast Setup** - AI-powered onboarding gets you started in minutes
- **🎯 Industry-Tailored** - Pre-configured templates for 11+ business types
- **📊 Comprehensive** - Handles complex cost structures and growth models
- **🎨 Beautiful UI** - Modern, intuitive interface with smooth animations
- **🔒 Type Safe** - Full TypeScript with Zod validation
- **📱 Responsive** - Works perfectly on desktop, tablet, and mobile
- **🔮 Projections** - Advanced breakeven and growth analysis
- **🌙 Dark Mode** - Built-in theme switching
- **🤖 AI-Assisted** - Smart suggestions and automated data generation
- **📤 Export Ready** - Download your projections for further analysis

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is proprietary software.

## 💬 Support

For questions or support, please reach out through the project repository.

---

Built with ❤️ for the modern business owner. Financial intelligence for everyone. 🚀