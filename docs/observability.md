# Observability Guide

This document describes the observability features available in the AI-Powered Recruiter Automation system and how to configure them for production monitoring.

## Overview

The system includes a comprehensive observability stack with:

- **Structured Logging**: Winston-based logging with correlation IDs and structured output
- **Distributed Tracing**: OpenTelemetry integration with automatic instrumentation
- **Metrics Collection**: RED metrics (Request rate, Error rate, Duration) and business metrics
- **Health Checks**: Kubernetes-ready health endpoints with build information

## Quick Start

### Local Development

The observability features work out-of-the-box in local development:

```bash
# Start the application
npm run dev

# Check health endpoint
curl http://localhost:1000/health

# View logs (structured JSON output)
# Logs will appear in console with correlation IDs
```

### Environment Variables

```bash
# Logging
LOG_LEVEL=debug  # debug, info, warn, error

# OpenTelemetry
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317  # OTLP collector endpoint
OTEL_EXPORTER_OTLP_HEADERS='{"Authorization": "Bearer token"}'  # Optional headers

# Service
NODE_ENV=development
HOSTNAME=localhost
```

## Structured Logging

### Basic Usage

```javascript
import Logger from './src/utils/logger.js';

// Create logger instance
const logger = new Logger();

// Basic logging
logger.info('User logged in', { userId: '123', method: 'password' });
logger.error('Database connection failed', error, { table: 'users' });

// With correlation ID
const loggerWithCorrelation = Logger.withCorrelationId('req-456');
loggerWithCorrelation.info('Processing request', { path: '/api/users' });
```

### Log Levels

- **debug**: Detailed debugging information
- **info**: General information about application flow
- **warn**: Warning messages for potentially harmful situations
- **error**: Error events that might still allow the application to continue

### Structured Output

All logs include:

- `timestamp`: ISO 8601 timestamp
- `level`: Log level (uppercase)
- `correlationId`: Request correlation ID
- `service`: Service name
- `environment`: Deployment environment
- Custom metadata fields

Example log output:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "User logged in",
  "correlationId": "req-456",
  "service": "ai-recruiter-automation",
  "environment": "development",
  "userId": "123",
  "method": "password"
}
```

## Distributed Tracing

### Automatic Instrumentation

The system automatically instruments:

- HTTP requests/responses
- Express.js middleware
- PostgreSQL database operations
- Redis operations
- Custom spans for business logic

### Manual Tracing

```javascript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('ai-recruiter-automation');

// Create custom span
const span = tracer.startSpan('process_candidate');
try {
  // Your business logic here
  await processCandidate(candidate);
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  throw error;
} finally {
  span.end();
}
```

### Trace Context Propagation

```javascript
// Extract trace context from incoming request
const traceContext = trace.getActive();

// Pass context to downstream services
const headers = {};
trace.inject(traceContext, trace.setSpanContext, headers);
```

## Metrics Collection

### RED Metrics

The system automatically collects:

- **Request Rate**: `http_requests_total`
- **Error Rate**: `http_errors_total`
- **Duration**: `http_request_duration_seconds`

### Business Metrics

- **Candidate Processing**: `candidates_processed_total`
- **Job Processing**: `jobs_processed_total`
- **AI Operations**: `ai_operations_total`, `ai_operation_duration_seconds`
- **Database Operations**: `database_operations_total`, `database_operation_duration_seconds`

### Custom Metrics

```javascript
import { businessMetrics } from './src/utils/metrics.js';

// Record business events
businessMetrics.recordCandidateProcessed('create', true, 150);
businessMetrics.recordAIOperation('analyze_resume', 'gpt-4', true, 2500);
businessMetrics.recordDBOperation('select', 'candidates', true, 45);
```

### Metrics Decorator

```javascript
import { withMetrics } from './src/utils/metrics.js';

class CandidateService {
  @withMetrics('analyze_candidate', 'ai')
  async analyzeCandidate(candidate) {
    // Method implementation
  }
}
```

## Health Checks

### Endpoints

- **`/health`**: Basic health status with build info
- **`/health/detailed`**: Comprehensive health information
- **`/health/ready`**: Kubernetes readiness probe
- **`/health/live`**: Kubernetes liveness probe

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "ai-recruiter-automation",
  "version": "1.0.0",
  "build": {
    "git": {
      "sha": "abc1234",
      "branch": "main",
      "shortSha": "abc1234"
    },
    "build": {
      "time": "2024-01-15T10:30:00.000Z",
      "environment": "development",
      "nodeVersion": "v18.17.0"
    }
  },
  "system": {
    "uptime": 3600,
    "memory": {
      "rssMB": 45.2,
      "heapUsedMB": 23.1
    }
  }
}
```

## Production Deployment

### 1. OpenTelemetry Collector

Deploy an OpenTelemetry Collector to aggregate telemetry data:

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4317
        cors:
          allowed_origins:
            - "*"

processors:
  batch:
    timeout: 1s
    send_batch_size: 1024

exporters:
  logging:
    loglevel: debug
  prometheus:
    endpoint: "0.0.0.0:9464"
  otlp:
    endpoint: "tempo:4317"
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging, otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [logging, prometheus]
```

### 2. Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-recruiter-automation'
    static_configs:
      - targets: ['localhost:9464']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

### 3. Grafana Dashboards

#### RED Metrics Dashboard

Create a dashboard with panels for:

**Request Rate**

```
rate(http_requests_total[5m])
```

**Error Rate**

```
rate(http_errors_total[5m])
```

**Error Percentage**

```
(rate(http_errors_total[5m]) / rate(http_requests_total[5m])) * 100
```

**Request Duration (95th percentile)**

```
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

#### Business Metrics Dashboard

**Candidate Processing**

```
rate(candidates_processed_total[5m])
```

**AI Operation Success Rate**

```
rate(ai_operations_total{success="true"}[5m]) / rate(ai_operations_total[5m]) * 100
```

**Database Performance**

```
rate(database_operation_duration_seconds_sum[5m]) / rate(database_operation_duration_seconds_count[5m])
```

### 4. Tempo Configuration

```yaml
# tempo.yml
server:
  http_listen_port: 3200

distributor:
  receivers:
    otlp:
      protocols:
        http:
          endpoint: "0.0.0.0:4317"

ingester:
  max_block_bytes: 256000000
  max_block_duration: 5m

compactor:
  compaction:
    block_retention: 1h

storage:
  trace:
    backend: local
    local:
      path: /tmp/tempo/blocks
```

### 5. Docker Compose Example

```yaml
# docker-compose.observability.yml
version: '3.8'

services:
  otel-collector:
    image: otel/opentelemetry-collector:latest
    ports:
      - "4317:4317"
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    command: ["--config", "/etc/otel-collector-config.yaml"]

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

  tempo:
    image: grafana/tempo:latest
    ports:
      - "3200:3200"
    volumes:
      - ./tempo.yml:/etc/tempo.yml
    command: ["-config.file=/etc/tempo.yml"]

volumes:
  grafana-storage:
```

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Service Health**
   - Health check endpoint availability
   - Service uptime
   - Memory and CPU usage

2. **Performance**
   - Request latency (P95, P99)
   - Throughput (requests/second)
   - Error rates

3. **Business Metrics**
   - Candidate processing success rate
   - AI operation performance
   - Database query performance

### Alerting Rules

```yaml
# prometheus-rules.yml
groups:
  - name: ai-recruiter-automation
    rules:
      - alert: HighErrorRate
        expr: rate(http_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighLatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is {{ $value }} seconds"

      - alert: ServiceDown
        expr: up{job="ai-recruiter-automation"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "AI Recruiter Automation service is not responding"
```

## Troubleshooting

### Common Issues

1. **No Traces Appearing**
   - Check OpenTelemetry collector logs
   - Verify OTLP endpoint configuration
   - Ensure auto-instrumentation is enabled

2. **Metrics Not Updating**
   - Check Prometheus configuration
   - Verify metrics endpoint accessibility
   - Check for metric naming conflicts

3. **High Memory Usage**
   - Monitor heap usage in health endpoint
   - Check for memory leaks in business logic
   - Adjust Node.js memory limits

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Manual Testing

```bash
# Test health endpoint
curl -v http://localhost:1000/health

# Test metrics endpoint (if Prometheus is configured)
curl http://localhost:9464/metrics

# Test tracing (check console output for spans)
curl http://localhost:1000/api/candidates
```

## Best Practices

1. **Correlation IDs**: Always propagate correlation IDs across service boundaries
2. **Structured Logging**: Use structured logging instead of string concatenation
3. **Metric Naming**: Follow OpenTelemetry naming conventions
4. **Health Checks**: Implement comprehensive health checks for all dependencies
5. **Performance**: Monitor and optimize high-cardinality metrics
6. **Security**: Secure telemetry endpoints in production

## Next Steps

1. **Implement actual health checks** for database and Redis connections
2. **Add custom business metrics** for specific recruitment workflows
3. **Create Grafana dashboards** for different user roles
4. **Set up alerting** for critical business metrics
5. **Implement distributed tracing** across microservices
6. **Add log aggregation** with ELK stack or similar

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/)
- [Grafana Dashboard Examples](https://grafana.com/grafana/dashboards/)
- [Tempo Documentation](https://grafana.com/docs/tempo/)
- [Winston Logging](https://github.com/winstonjs/winston)
