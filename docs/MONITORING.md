# Monitoring & Error Tracking Setup

## Sentry Integration

### Backend Setup

1. Install Sentry SDK:
```bash
cd backend
npm install @sentry/node
```

2. Add environment variable:
```env
SENTRY_DSN=your-sentry-dsn-here
```

3. Initialize in app.ts:
```typescript
import { initSentry } from './lib/sentry';
initSentry();
```

4. Use error capture:
```typescript
import { captureException } from './lib/sentry';

try {
  // code
} catch (error) {
  captureException(error, { context: 'additional info' });
}
```

### Frontend Setup

1. Install Sentry SDK:
```bash
cd frontend
npm install @sentry/nextjs
```

2. Run Sentry wizard:
```bash
npx @sentry/wizard@latest -i nextjs
```

3. Add environment variable:
```env
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

## Environment Variables

### Backend (.env)
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NODE_ENV=production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

## Getting Sentry DSN

1. Go to https://sentry.io
2. Create a new project (Node.js for backend, Next.js for frontend)
3. Copy the DSN from project settings

## Features Enabled

- Error tracking and reporting
- Performance monitoring
- User session tracking
- Breadcrumbs for debugging
- Source maps for stack traces

## Best Practices

1. Never commit DSN to version control
2. Use different projects for staging/production
3. Set appropriate sample rates for production
4. Filter sensitive data before sending
