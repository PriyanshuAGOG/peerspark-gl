export class MonitoringService {
  // Log error
  static logError(error: Error, context?: any) {
    console.error('Error:', error.message, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    })
    // In a real production environment, you would send this to a monitoring service
    // like Sentry, DataDog, or LogRocket.
    // Example: Sentry.captureException(error, { extra: context });
  }

  // Log performance metric
  static logPerformance(name: string, value: number, context?: any) {
    console.log(`Performance Metric: ${name}`, {
      value,
      context,
      timestamp: new Date().toISOString(),
    })
    // In a real production environment, you would send this to a monitoring service.
    // Example: DataDog.timing(`performance.${name}`, value, context);
  }

  // Log generic event
  static logEvent(eventName: string, data?: any) {
    console.log(`Event: ${eventName}`, {
      data,
      timestamp: new Date().toISOString(),
    })
    // Example: GoogleAnalytics.event(eventName, data);
  }
}
