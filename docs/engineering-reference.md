# Engineering Reference Guide

> **AI-Powered Recruiter Automation** - Engineering Standards & Practices

## Table of Contents

1. [Quality Gates](#quality-gates)
2. [Branch, PR, and Release](#branch-pr-and-release)
3. [Testing Strategy](#testing-strategy)
4. [CI/CD Blueprint](#cicd-blueprint)
5. [Security & Compliance](#security--compliance)
6. [Observability](#observability)
7. [Documentation & Decisions](#documentation--decisions)
8. [Governance](#governance)

---

## Quality Gates

### Non-Negotiables

| Gate            | Requirement                        | Tool/Process                  | Owner           |
| --------------- | ---------------------------------- | ----------------------------- | --------------- |
| **Linting**     | Zero linting errors                | ESLint + Prettier             | Pre-commit hook |
| **Type Safety** | Zero TypeScript errors             | `npm run build`               | CI/CD           |
| **Unit Tests**  | All tests pass                     | Jest                          | CI/CD           |
| **SAST**        | Zero critical/high vulnerabilities | SonarQube/Snyk                | CI/CD           |
| **Coverage**    | Critical paths > 80%               | Jest + Istanbul               | CI/CD           |
| **Secrets**     | No secrets in code                 | pre-commit hooks + TruffleHog | Security team   |
| **Build**       | Immutable artifacts                | Docker + registry             | CI/CD           |

### Critical Paths (80% coverage required)

- Candidate management workflows
- Job posting creation/editing
- Analytics data processing
- AI agent interactions
- Email campaign logic

---

## Branch, PR, and Release

### Branch Strategy

| Branch Type       | Pattern    | Purpose                   | Auto-delete |
| ----------------- | ---------- | ------------------------- | ----------- |
| **Feature**       | `feat/*`   | New functionality         | ✅          |
| **Bug Fix**       | `fix/*`    | Bug fixes                 | ✅          |
| **Chore**         | `chore/*`  | Maintenance tasks         | ✅          |
| **Documentation** | `docs/*`   | Documentation updates     | ✅          |
| **Hotfix**        | `hotfix/*` | Critical production fixes | ✅          |

### Conventional Commits

```bash
# Format: type(scope): description
feat(candidates): add bulk import functionality
fix(analytics): resolve chart rendering issue
docs(readme): update deployment instructions
chore(deps): update TypeScript to 5.0
```

### PR Template

```markdown
## Summary

Brief description of changes

## Risk Assessment

- [ ] Low risk (UI changes, docs)
- [ ] Medium risk (new features, refactoring)
- [ ] High risk (core logic, database changes)

## Rollout Plan

- [ ] Feature flag enabled
- [ ] Canary deployment
- [ ] Full rollout
- [ ] Rollback plan documented

## Test Evidence

- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots/Recordings

(if applicable)
```

### Release Process

| Version Type | Trigger          | Process       |
| ------------ | ---------------- | ------------- |
| **Patch**    | `fix:` commits   | Auto-release  |
| **Minor**    | `feat:` commits  | Manual review |
| **Major**    | Breaking changes | RFC required  |

---

## Testing Strategy

### Test Pyramid

| Level           | Coverage | Speed | Examples                       |
| --------------- | -------- | ----- | ------------------------------ |
| **Unit**        | 80%      | <1s   | Component functions, utilities |
| **Integration** | 15%      | <30s  | API endpoints, database ops    |
| **E2E**         | 5%       | <5min | User workflows, critical paths |

### Test Categories

#### Unit Tests

```typescript
// Fast, isolated, no external dependencies
describe('CandidateService', () => {
  it('should calculate match score correctly', () => {
    const candidate = mockCandidate();
    const job = mockJob();
    const score = calculateMatchScore(candidate, job);
    expect(score).toBeGreaterThan(0);
  });
});
```

#### Integration Tests

```typescript
// Dockerized dependencies, real database
describe('Candidate API', () => {
  it('should create candidate via API', async () => {
    const response = await request(app)
      .post('/api/candidates')
      .send(mockCandidateData);
    expect(response.status).toBe(201);
  });
});
```

#### E2E Tests

```typescript
// Full browser automation
test('complete candidate onboarding flow', async ({ page }) => {
  await page.goto('/candidates/new');
  await page.fill('[data-testid="name"]', 'John Doe');
  await page.click('[data-testid="submit"]');
  await expect(page).toHaveURL(/\/candidates\/\d+/);
});
```

### Flaky Test Protocol

1. **Quarantine** failing tests immediately
2. **Investigate** root cause within 24h
3. **Fix** or **Remove** within 48h
4. **Document** in test runbook

---

## CI/CD Blueprint

### Pipeline Stages

```yaml
stages:
  - verify # Lint, typecheck, security scan
  - build # Create immutable artifacts
  - test # Unit, integration, E2E
  - scan # SAST, DAST, dependency audit
  - package # Docker images, SBOM
  - deploy # Staging → Canary → Production
```

### Deployment Strategy

| Environment     | Purpose               | Auto-deploy | Rollback |
| --------------- | --------------------- | ----------- | -------- |
| **Development** | Feature testing       | ✅          | ✅       |
| **Staging**     | Integration testing   | ✅          | ✅       |
| **Canary**      | Production validation | Manual      | ✅       |
| **Production**  | Live users            | Manual      | ✅       |

### Feature Flags

```typescript
// Feature flag implementation
const FEATURES = {
  NEW_CANDIDATE_UI: process.env.ENABLE_NEW_UI === 'true',
  AI_ENHANCED_MATCHING: process.env.ENABLE_AI_MATCHING === 'true',
  BULK_IMPORT: process.env.ENABLE_BULK_IMPORT === 'true',
};
```

---

## Security & Compliance

### Threat Model (STRIDE-lite)

| Threat                     | Mitigation              | Owner               |
| -------------------------- | ----------------------- | ------------------- |
| **Spoofing**               | JWT tokens, OAuth2      | Auth team           |
| **Tampering**              | Input validation, HTTPS | Backend team        |
| **Repudiation**            | Audit logs, signatures  | Security team       |
| **Information Disclosure** | Encryption, RBAC        | Security team       |
| **Denial of Service**      | Rate limiting, CDN      | Infrastructure team |
| **Elevation of Privilege** | Least privilege, RBAC   | Security team       |

### Security Tools

| Tool                 | Purpose                    | Frequency     |
| -------------------- | -------------------------- | ------------- |
| **SAST**             | Code vulnerability scan    | Every PR      |
| **DAST**             | Runtime vulnerability scan | Weekly        |
| **Dependency Audit** | Known vulnerabilities      | Daily         |
| **SBOM**             | Software bill of materials | Every release |
| **Secret Scanner**   | Credential detection       | Pre-commit    |

### Compliance Checklist

- [ ] GDPR compliance (candidate data)
- [ ] SOC 2 Type II controls
- [ ] Data retention policies
- [ ] Access logging
- [ ] Encryption at rest/transit

---

## Observability

### Golden Signals

| Signal         | Metric              | Target         | Alert Threshold |
| -------------- | ------------------- | -------------- | --------------- |
| **Latency**    | P95 response time   | <500ms         | >1s             |
| **Traffic**    | Requests per second | Monitor trends | 50% drop        |
| **Errors**     | Error rate          | <1%            | >5%             |
| **Saturation** | CPU/Memory usage    | <80%           | >90%            |

### Logging Standards

```typescript
// Structured logging
logger.info('Candidate created', {
  candidateId: '123',
  userId: '456',
  action: 'create',
  duration: 150,
  success: true,
});
```

### Metrics (RED/USE)

| Category        | Metrics                       | Collection     |
| --------------- | ----------------------------- | -------------- |
| **Rate**        | Requests/sec, Errors/sec      | Prometheus     |
| **Errors**      | Error rate, Error types       | Prometheus     |
| **Duration**    | Response time, Percentiles    | Prometheus     |
| **Utilization** | CPU, Memory, Disk             | Node Exporter  |
| **Saturation**  | Queue depth, Connection pools | Custom metrics |
| **Errors**      | System errors, User errors    | Error tracking |

### Tracing

```typescript
// OpenTelemetry integration
const tracer = trace.getTracer('ai-recruiter');
const span = tracer.startSpan('process-candidate');
span.setAttribute('candidate.id', candidateId);
// ... business logic
span.end();
```

---

## Documentation & Decisions

### README Skeleton

```markdown
# AI-Powered Recruiter Automation

## Quick Start

1. Clone repository
2. `npm install`
3. `npm run dev`
4. Visit http://localhost:1000

## Architecture

- Frontend: EJS + Vanilla JS
- Backend: Node.js + Express
- Database: Supabase
- AI: OpenAI Integration

## Development

- [Development Guide](docs/development.md)
- [API Reference](docs/api.md)
- [Testing Guide](docs/testing.md)

## Deployment

- [Deployment Guide](docs/deployment.md)
- [Environment Setup](docs/environment.md)
```

### ADR Template

```markdown
# ADR-000: [Title]

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?
```

### Onboarding Checklist

- [ ] Repository access granted
- [ ] Development environment setup
- [ ] First commit within 1 hour
- [ ] Code review process explained
- [ ] Testing strategy understood
- [ ] Deployment process documented

---

## Governance

### RFC Process

1. **Proposal** - Create RFC issue
2. **Discussion** - 1 week minimum
3. **Decision** - Maintainer approval
4. **Implementation** - Follow PR process

### Decision SLA

| Decision Type    | Timeline        | Escalation          |
| ---------------- | --------------- | ------------------- |
| **Technical**    | 3 business days | Tech lead           |
| **Architecture** | 1 week          | CTO                 |
| **Process**      | 2 weeks         | Engineering manager |

### Incident Response

#### Incident Template

```markdown
## Incident Report

### Summary

Brief description of the incident

### Timeline

- **Detected**: [timestamp]
- **Escalated**: [timestamp]
- **Resolved**: [timestamp]

### Root Cause

What caused the incident?

### Impact

- Users affected: [number]
- Downtime: [duration]
- Data loss: [details]

### Actions Taken

1. Immediate response
2. Investigation
3. Resolution

### Lessons Learned

- What went well?
- What could be improved?
- Action items
```

### Blameless Postmortems

- Focus on **process** not **people**
- Document **what** happened, not **who** did it
- Identify **systemic** issues
- Create **actionable** improvements

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Run linter
npm run typecheck    # TypeScript check

# Deployment
npm run deploy:staging    # Deploy to staging
npm run deploy:prod       # Deploy to production
npm run rollback          # Rollback to previous version
```

### Emergency Contacts

| Role          | Contact    | Escalation |
| ------------- | ---------- | ---------- |
| **On-call**   | #oncall    | PagerDuty  |
| **Tech Lead** | @tech-lead | Slack      |
| **CTO**       | @cto       | Phone      |

### Useful Links

- [Project Board](https://github.com/org/repo/projects)
- [CI/CD Pipeline](https://github.com/org/repo/actions)
- [Monitoring Dashboard](https://grafana.company.com)
- [Error Tracking](https://sentry.io/project)
- [Documentation](https://docs.company.com)

---

_Last updated: [Date]_
_Version: 1.0_
