# Contributing to AI-Powered Recruiter Automation

Thank you for your interest in contributing to AI-Powered Recruiter Automation! This document provides guidelines and information for contributors.

## Table of Contents

- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Code of Conduct](#code-of-conduct)

## Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/AI-Powered-Recruiter-Automation.git`
3. **Create** a feature branch: `git checkout -b feat/your-feature-name`
4. **Make** your changes
5. **Test** your changes: `npm test`
6. **Commit** with conventional format: `git commit -m "feat: add new feature"`
7. **Push** to your fork: `git push origin feat/your-feature-name`
8. **Create** a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Laderis97/AI-Powered-Recruiter-Automation.git
cd AI-Powered-Recruiter-Automation

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Build the project
npm run build

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=1000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_PROJECT_ID=your_openai_project_id

# Security
ACCESS_TOKEN=your_access_token
```

## Code Style

### TypeScript/JavaScript

We use ESLint and Prettier for code formatting. Run these commands before committing:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck
```

### File Naming

- **Files**: kebab-case (e.g., `user-profile.ts`)
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)
- **Functions/Variables**: camelCase (e.g., `getUserProfile`)

### Code Organization

```
src/
├── components/     # Reusable UI components
├── services/       # Business logic and API calls
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── hooks/          # Custom React hooks
└── pages/          # Page components
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) format:

### Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks
- `revert`: Revert previous commit

### Examples

```bash
feat(candidates): add bulk import functionality
fix(analytics): resolve chart rendering issue
docs(readme): update installation instructions
style(ui): format component spacing
refactor(api): simplify candidate creation logic
test(unit): add database service tests
```

### Using Commitizen

For interactive commit creation:

```bash
# Install commitizen globally
npm install -g commitizen

# Use interactive commit
git cz
```

## Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `npm test`
4. **Check code style**: `npm run lint && npm run format`
5. **Update CHANGELOG.md** if applicable

### PR Template

When creating a PR, the template will automatically include:

- **Summary**: Brief description of changes
- **Risk Assessment**: Low/Medium/High risk
- **Rollout Plan**: Deployment strategy
- **Test Evidence**: Testing performed
- **Screenshots**: UI changes (if applicable)

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: At least one maintainer must approve
3. **Testing**: Manual testing may be required
4. **Merge**: Once approved and tests pass

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- **Unit Tests**: Test individual functions/components
- **Integration Tests**: Test API endpoints and services
- **E2E Tests**: Test complete user workflows

### Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

## Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up-to-date
- Use proper markdown formatting

### Documentation Files

- `README.md`: Project overview and quick start
- `docs/`: Detailed documentation
- `CHANGELOG.md`: Version history
- `API.md`: API documentation

## Issue Reporting

### Bug Reports

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots (if applicable)

### Feature Requests

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md) and include:

- Problem statement
- Proposed solution
- User story
- Acceptance criteria
- Impact assessment

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative and constructive
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

- Unacceptable behavior will not be tolerated
- Violations may result in temporary or permanent ban
- Report violations to maintainers

## Getting Help

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Search existing [GitHub Issues](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/discussions)
- **Security**: Report to [security@company.com](mailto:security@company.com)

## Recognition

Contributors will be recognized in:

- [Contributors](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/graphs/contributors) page
- Release notes
- Project documentation

---

**Thank you for contributing to AI-Powered Recruiter Automation!**
