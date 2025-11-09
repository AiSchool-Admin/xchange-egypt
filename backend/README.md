# Xchange Backend API

RESTful API for the Xchange e-commerce platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+
- Redis 7+
- pnpm (recommended)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Database Setup

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# (Optional) Seed database
pnpm prisma:seed

# (Optional) Open Prisma Studio
pnpm prisma:studio
```

### Development

```bash
# Start development server (with hot reload)
pnpm dev

# Server will run on http://localhost:3001
```

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Linting & Formatting

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware
│   ├── models/           # Data models (if any)
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── types/            # TypeScript type definitions
│   └── app.ts            # Express app entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Database seeding script
├── tests/                # Tests
└── package.json
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Users
```
GET    /api/v1/users/:id
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Items
```
GET    /api/v1/items
GET    /api/v1/items/:id
POST   /api/v1/items
PUT    /api/v1/items/:id
DELETE /api/v1/items/:id
```

### Listings
```
GET    /api/v1/listings
GET    /api/v1/listings/:id
POST   /api/v1/listings
PUT    /api/v1/listings/:id
DELETE /api/v1/listings/:id
```

### Barter
```
GET    /api/v1/barter/matches
POST   /api/v1/barter/offers
GET    /api/v1/barter/offers/:id
PUT    /api/v1/barter/offers/:id
```

### Auctions
```
GET    /api/v1/auctions
POST   /api/v1/auctions/:id/bids
GET    /api/v1/auctions/:id/bids
```

*Full API documentation coming soon...*

## Environment Variables

See `.env.example` for all required environment variables.

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

## License

Proprietary - All rights reserved by Xchange

---

**Built with ❤️ by Xchange Team**
