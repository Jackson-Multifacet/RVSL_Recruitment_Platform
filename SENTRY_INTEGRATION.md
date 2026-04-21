# Sentry Error Tracking & Monitoring Integration

## Overview

Sentry is integrated for real-time error tracking, performance monitoring, and session replay. It helps identify and fix issues in production faster.

## Setup

### 1. Get Your Sentry DSN

1. Create a free account at [sentry.io](https://sentry.io)
2. Create a new project (select "React" for frontend)
3. Copy your **DSN** - looks like: `https://key@sentry.io/project-id`

### 2. Configure Environment Variables

Add to `.env.local` (never commit):
```env
VITE_SENTRY_DSN=https://yourkey@sentry.io/yourproject
SENTRY_DSN=https://yourkey@sentry.io/yourproject
VITE_ENABLE_SENTRY=false  # Set to true to enable in dev
```

### 3. Enable Sentry

**Development**: Sentry only runs in production mode or when explicitly enabled
```env
VITE_ENABLE_SENTRY=true  # To test in development
```

**Production**: Automatically enabled when `VITE_SENTRY_DSN` is set

## Features

### 1. **Error Tracking**
- Automatic error capture
- Stack traces with source maps
- Error grouping and deduplication
- Real-time alerts

### 2. **Performance Monitoring**
- Transaction tracing
- Web Vitals monitoring
- Database query performance
- API response times

### 3. **Session Replay**
- Browser session recording
- Replay on errors (100% rate)
- General session replay (10% of all sessions)
- Privacy-aware (content masked)

### 4. **Release Tracking**
- Link errors to specific releases
- Track error trend across versions
- Rollback detection

## Client-Side (React)

### Initialization

Sentry initializes automatically in `src/main.tsx`:
```typescript
import { initializeSentry } from './services/sentry';
initializeSentry();
```

### Capturing Exceptions

```typescript
import * as Sentry from '@sentry/react';

// Automatic error boundaries
import { ErrorBoundary } from '@sentry/react';

// Manual error capture
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}

// Custom messages
Sentry.captureMessage('User action completed', 'info');

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.displayName,
});

// Add extra context
Sentry.captureException(error, {
  tags: {
    feature: 'checkout',
    severity: 'high',
  },
  extra: {
    userId: user.id,
    cartValue: 99.99,
  },
});
```

## Server-Side (Node.js/Express)

### Initialization

Sentry initializes automatically in `server.ts`:
```typescript
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  app.use(Sentry.Handlers.requestHandler());
}
```

### Error Handling

```typescript
import * as Sentry from "@sentry/node";

// After all routes
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Manual error capture
app.post('/api/process', (req, res) => {
  try {
    processData(req.body);
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Processing failed' });
  }
});
```

## Best Practices

### 1. **Release Tracking**
```typescript
Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: 'my-app@1.0.0', // Set in CI/CD
});
```

### 2. **Source Maps**
Include source maps for better stack traces:
```typescript
// vite.config.ts
export default {
  build: {
    sourcemap: true,
  },
};
```

### 3. **Filtering**
Avoid tracking known issues:
```typescript
Sentry.init({
  beforeSend(event, hint) {
    if (event.exception) {
      const error = hint.originalException;
      if (error?.message?.includes('NetworkError')) {
        return null; // Don't send to Sentry
      }
    }
    return event;
  },
});
```

### 4. **Performance Monitoring**
```typescript
import * as Sentry from '@sentry/react';

const transaction = Sentry.startTransaction({
  op: "user_interaction",
  name: "handleCheckout",
});

const span = transaction.startChild({
  op: "http.client",
  description: "POST /api/payment",
});

try {
  await fetch('/api/payment', { method: 'POST' });
} finally {
  span.finish();
  transaction.finish();
}
```

### 5. **Privacy & Compliance**
```typescript
Sentry.init({
  integrations: [
    new Sentry.Replay({
      maskAllText: true,      // Mask all text
      blockAllMedia: true,    // Block media files
    }),
  ],
});

// Don't capture sensitive data
Sentry.init({
  denyUrls: [
    // Ignore errors from third-party scripts
    /https:\/\/api\.example\.com/,
  ],
});
```

## Dashboard

Access your Sentry dashboard at [sentry.io](https://sentry.io):

### Key Metrics
- **Issues**: Unique error events
- **Events**: Total error occurrences
- **Users Affected**: Count of affected users
- **Performance**: Web Vitals and transaction speed
- **Releases**: Track errors per version

### Create Alerts
1. Go to Alerts in Sentry
2. Create new alert rule
3. Define conditions (error rate, new issues, etc.)
4. Choose notification channel (email, Slack, PagerDuty)

## Troubleshooting

### Sentry Not Capturing Errors
- Check if `VITE_SENTRY_DSN` is set correctly
- For development, set `VITE_ENABLE_SENTRY=true`
- Verify DSN in Sentry project settings

### Too Many Events
- Adjust `tracesSampleRate` (lower = fewer traces)
- Use `beforeSend` to filter events
- Set up Release tracking to ignore old versions

### Performance Issues
- Reduce `replaysSessionSampleRate` from 0.1 to 0.05
- Enable `maskAllText` to reduce payload size
- Use `beforeSend` to filter non-critical events

## Commands

```bash
# Check Sentry configuration
npm run type-check

# Build with source maps
npm run build

# Test error capture (development)
# Manually throw error in console to test
```

## Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Sentry React Guide](https://docs.sentry.io/platforms/javascript/guides/react)
- [Sentry Node Guide](https://docs.sentry.io/platforms/node)
- [Release Tracking](https://docs.sentry.io/product/releases)
- [Performance Monitoring](https://docs.sentry.io/product/performance)

## Next Steps

1. ✅ Sentry integrated
2. Obtain Sentry DSN and add to `.env.local`
3. Test error capture in development
4. Configure alerts and notifications
5. Set up release tracking in CI/CD
6. Monitor performance metrics in production
