export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
      debug: false,
      environment: process.env.NODE_ENV || 'development',
      enabled: process.env.NODE_ENV === 'production',

      // Filter sensitive data
      beforeSend(event, hint) {
        // Remove authorization headers
        if (event.request) {
          if (event.request.headers) {
            delete event.request.headers['authorization'];
            delete event.request.headers['cookie'];
          }

          // Remove sensitive query params
          if (event.request.query_string) {
            event.request.query_string = event.request.query_string
              .replace(/password=[^&]*/gi, 'password=[FILTERED]')
              .replace(/token=[^&]*/gi, 'token=[FILTERED]');
          }
        }

        // Filter database connection strings from error messages
        if (event.exception?.values) {
          event.exception.values.forEach((exception) => {
            if (exception.value) {
              exception.value = exception.value
                .replace(/mongodb\+srv:\/\/[^@]+@/gi, 'mongodb+srv://[FILTERED]@')
                .replace(/password=["']?[^&"'\s]+/gi, 'password=[FILTERED]');
            }
          });
        }

        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime Sentry initialization
    const Sentry = await import('@sentry/nextjs');

    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      environment: process.env.NODE_ENV || 'development',
      enabled: process.env.NODE_ENV === 'production',
    });
  }
}
