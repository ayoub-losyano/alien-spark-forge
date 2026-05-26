# AlienSpark OPS Console

A production-ready internal operations dashboard for managing clients, orders, projects, and team members. Built with TanStack Start, Supabase, and Tailwind CSS.

## Features

- **Dashboard** - Operational overview with stats, recent orders, and activity feed
- **Orders Management** - Full CRUD for client orders with filtering, pagination, and status tracking
- **Team Management** - Team member profiles with permissions and presence tracking
- **Finance** - Revenue tracking, payment management, and expense monitoring
- **Settings** - Company settings, notifications, and user preferences
- **Real-time Notifications** - Live notification system via Supabase
- **Global Search** - Quick access to orders, team members, and invoices

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | TanStack Start (React SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | TanStack Router |
| State | TanStack React Query |
| Backend | Supabase (Auth, Database, Storage) |
| Deployment | Cloudflare Workers (default), Docker, PM2 |

## Project Structure

```
src/
├── components/           # UI components
│   ├── ui/             # shadcn/ui components
│   └── *.tsx           # Custom components
├── contexts/           # React contexts
│   ├── auth.context    # Authentication provider
│   └── auth.guard     # Route guards
├── hooks/              # Custom React hooks
│   ├── use-async-data # Data fetching hooks
│   ├── use-pagination # Pagination hook
│   └── *.ts           # Other utilities
├── integrations/        # Third-party integrations
│   └── supabase/      # Supabase client & types
├── lib/                # Core utilities & services
│   ├── services/      # Business logic services
│   ├── utils/        # Formatters, constants, validators
│   ├── config.ts     # App configuration
│   └── security.ts    # Security utilities
├── routes/             # TanStack Router routes
│   ├── __root.tsx    # Root layout
│   ├── dashboard.tsx  # Dashboard page
│   ├── orders.*.tsx  # Orders pages
│   ├── team.*.tsx    # Team pages
│   └── finance.tsx    # Finance page
└── types/              # TypeScript types
    └── domain.ts      # Domain-specific types
```

## Architecture Highlights

### Services Layer
Business logic is centralized in `lib/services/`:
- `order.service.ts` - Order CRUD and business logic
- `team.service.ts` - Team member operations
- `expense.service.ts` - Expense management
- `storage.service.ts` - File uploads
- `activity.service.ts` - Activity logging

### Type Safety
- Full database types from Supabase
- Domain-specific types in `src/types/`
- Generic hooks for type-safe data fetching

### Error Handling
- Global error boundaries for crash recovery
- Toast notifications for user feedback
- Consistent error handling across all services

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/alienspark-ops.git
cd alienspark-ops

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Type check
npm run typecheck
```

### Production Build

```bash
# Build for Cloudflare Workers (default)
npm run build

# Or build for static hosting
npm run build:static
```

## Deployment

### Cloudflare Workers (Default)

```bash
npm run build
npx wrangler deploy
```

### Docker

```bash
# Build and run
docker-compose up -d

# Or build image only
docker build -t alienspark-ops .
```

### VPS (PM2 + Nginx)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_URL` | Application URL | No |
| `VITE_ENVIRONMENT` | Environment (dev/staging/prod) | No |

## Supabase Setup

### Database Tables

The app requires these Supabase tables:

- `orders` - Client orders and projects
- `team_members` - Team profiles
- `activity_logs` - Audit trail
- `order_comments` - Order comments
- `order_attachments` - File attachments
- `order_status_history` - Status changes
- `expenses` - Business expenses
- `invoices` - Invoice records
- `notifications` - User notifications
- `company_settings` - Company configuration

### Storage Buckets

- `avatars` - Team member avatars
- `order-files` - Order attachments

### Row Level Security (RLS)

Enable RLS on all tables and configure policies for authenticated users.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

Internal use only - AlienSpark VN
