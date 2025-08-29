/**
 * OpenTelemetry Configuration
 * Provides distributed tracing and metrics collection
 * Uses console exporters for local development
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/exporter-trace-console';
import { ConsoleMetricExporter } from '@opentelemetry/exporter-metrics-console';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Service information
const SERVICE_NAME = 'ai-recruiter-automation';
const SERVICE_VERSION = process.env.npm_package_version || '1.0.0';
const SERVICE_NAMESPACE = 'ai.recruiter';

// Create resource with service information
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  [SemanticResourceAttributes.SERVICE_VERSION]: SERVICE_VERSION,
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: SERVICE_NAMESPACE,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  [SemanticResourceAttributes.HOST_NAME]: process.env.HOSTNAME || 'localhost',
  [SemanticResourceAttributes.PROCESS_PID]: process.pid,
});

// Configure trace exporters
const traceExporters = [];
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  // Use OTLP exporter if endpoint is configured
  traceExporters.push(new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/traces',
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
      JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {}
  }));
} else {
  // Use console exporter for local development
  traceExporters.push(new ConsoleSpanExporter());
}

// Configure metric exporters
const metricExporters = [];
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  // Use OTLP exporter if endpoint is configured
  metricExporters.push(new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT + '/v1/metrics',
    headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
      JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {}
  }));
} else {
  // Use console exporter for local development
  metricExporters.push(new ConsoleMetricExporter());
}

// Create metric readers
const metricReaders = metricExporters.map(exporter => 
  new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 1000, // Export every second
  })
);

// Create span processors
const spanProcessors = traceExporters.map(exporter => 
  new BatchSpanProcessor(exporter, {
    scheduledDelayMillis: 100, // Process spans every 100ms
    maxExportBatchSize: 512,   // Max spans per batch
    maxQueueSize: 2048,        // Max spans in queue
  })
);

// Create SDK configuration
const sdk = new NodeSDK({
  resource,
  traceExporter: traceExporters[0], // Use first exporter as primary
  metricReader: metricReaders[0],   // Use first reader as primary
  spanProcessor: spanProcessors[0], // Use first processor as primary
  instrumentations: [
    getNodeAutoInstrumentations({
      // Enable specific instrumentations
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingPaths: ['/health', '/ready', '/metrics'],
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-redis': {
        enabled: true,
      },
    }),
  ],
});

// Initialize OpenTelemetry
export function initializeTelemetry() {
  try {
    sdk.start();
    console.log('✅ OpenTelemetry initialized successfully');
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      sdk.shutdown()
        .then(() => console.log('OpenTelemetry SDK terminated'))
        .catch((error) => console.log('Error terminating OpenTelemetry SDK', error))
        .finally(() => process.exit(0));
    });
    
    return sdk;
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
    return null;
  }
}

// Export SDK for manual control
export { sdk };

// Export initialization function as default
export default initializeTelemetry;
