# Lending Platform

A modern lending platform that allows lenders to offer items and lendees to borrow items, built with a monorepo architecture.

## Tech Stack

### Monorepo Management
- **pnpm** - Fast, disk space efficient package manager with workspace support
- **Turborepo** - High-performance build system for JavaScript/TypeScript monorepos
- **TypeScript** - Type-safe development across all packages

### Frontend
- **Next.js 16** - React framework with App Router
- **Turbopack** - Next-generation bundler for faster development
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Static type checking
- **ESLint** - Code linting and quality

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Static type checking
- **Express** - Underlying HTTP server
- **Jest** - Testing framework

### Shared Packages
- **@lending/types** - Shared TypeScript type definitions
- **@lending/utils** - Shared utility functions

## Project Structure

```
startup-pwm/
├── apps/
│   ├── frontend/              # Next.js application
│   │   ├── app/              # App Router pages
│   │   ├── public/           # Static assets
│   │   └── package.json
│   │
│   └── backend/               # NestJS application
│       ├── src/              # Source code
│       │   ├── app.controller.ts
│       │   ├── app.module.ts
│       │   ├── app.service.ts
│       │   └── main.ts
│       ├── test/             # E2E tests
│       └── package.json
│
├── packages/
│   ├── types/                # Shared TypeScript types
│   │   ├── src/
│   │   │   └── index.ts     # User, Item interfaces
│   │   └── package.json
│   │
│   └── utils/                # Shared utilities
│       ├── src/
│       │   └── index.ts
│       └── package.json
│
├── pnpm-workspace.yaml       # pnpm workspace configuration
├── turbo.json                # Turborepo configuration
├── tsconfig.json             # Root TypeScript config
├── package.json              # Root package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm (v8 or higher)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd startup-pwm
```

2. Install dependencies
```bash
pnpm install
```

3. Start development servers
```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Available Commands

### Root Level Commands

```bash
# Start all apps in development mode (parallel)
pnpm dev

# Build all apps and packages
pnpm build
```

### Frontend Commands

```bash
cd apps/frontend

# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Backend Commands

```bash
cd apps/backend

# Development server with hot reload
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint code
pnpm lint
```

## Development Workflow

### Adding Shared Types

Edit `packages/types/src/index.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  role: "lender" | "lendee";
}
```

Use in frontend or backend:

```typescript
import { User } from '@lending/types';

const user: User = {
  id: '1',
  name: 'John Doe',
  role: 'lender'
};
```

### Adding Shared Utils

Edit `packages/utils/src/index.ts`:

```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
```

Use in any app:

```typescript
import { formatCurrency } from '@lending/utils';

const price = formatCurrency(99.99); // "$99.99"
```

## TypeScript Configuration

The monorepo uses a shared TypeScript configuration with path aliases:

- `@lending/types` → `packages/types/src`
- `@lending/utils` → `packages/utils/src`
- `@/*` (frontend only) → `apps/frontend/*`

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
```

## Building for Production

```bash
# Build all apps
pnpm build

# Start frontend in production
cd apps/frontend
pnpm start

# Start backend in production
cd apps/backend
pnpm start:prod
```

## Turborepo Features

- **Caching** - Builds are cached and never recomputed
- **Parallel execution** - Tasks run in parallel when possible
- **Dependency awareness** - Tasks run in the correct order
- **Incremental builds** - Only changed packages are rebuilt

## Next Steps

1. Set up authentication (JWT, OAuth, etc.)
2. Connect to a database (PostgreSQL, MongoDB, etc.)
3. Implement item listing and borrowing features
4. Add user management
5. Set up CI/CD pipeline
6. Deploy to production (Vercel for frontend, Railway/Render for backend)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## License

MIT
# estafee-monorepo
