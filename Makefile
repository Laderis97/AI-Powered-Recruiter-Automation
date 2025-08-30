# AI-Powered Recruiter Automation Makefile

.PHONY: help dev build clean test lint format docs:list docs:serve docs:build deploy

# Default target
help:
	@echo "AI-Powered Recruiter Automation - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start development server"
	@echo "  make build            - Build for production"
	@echo "  make clean            - Clean build artifacts"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests"
	@echo "  make test:unit        - Run unit tests"
	@echo "  make test:integration - Run integration tests"
	@echo "  make test:e2e         - Run end-to-end tests"
	@echo "  make test:coverage    - Run tests with coverage"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Run linting"
	@echo "  make lint:fix         - Fix linting issues"
	@echo "  make format           - Format code"
	@echo "  make type-check       - Run TypeScript type checking"
	@echo ""
	@echo "Documentation:"
	@echo "  make docs:list        - List all documentation"
	@echo "  make docs:serve       - Serve documentation locally"
	@echo "  make docs:build       - Build documentation"
	@echo ""
	@echo "Database:"
	@echo "  make db:migrate       - Run database migrations"
	@echo "  make db:seed          - Seed database with sample data"
	@echo "  make db:reset         - Reset database"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy:staging   - Deploy to staging"
	@echo "  make deploy:prod      - Deploy to production"

# Development
dev:
	npm run dev

build:
	npm run build

clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/

# Testing
test:
	npm test

test:unit:
	npm run test:unit

test:integration:
	npm run test:integration

test:e2e:
	npm run test:e2e

test:coverage:
	npm run test:coverage

# Code Quality
lint:
	npm run lint

lint:fix:
	npm run lint:fix

format:
	npm run format

type-check:
	npm run type-check

# Documentation
docs:list:
	@echo "📚 Documentation Index"
	@echo "======================"
	@echo ""
	@echo "📖 Core Documentation:"
	@echo "  README.md                    - Project overview and quickstart"
	@echo "  CONTRIBUTING.md              - How to contribute"
	@echo "  SECURITY.md                  - Security policy"
	@echo ""
	@echo "📋 Guides:"
	@echo "  docs/onboarding.md           - First commit in 1 hour guide"
	@echo ""
	@echo "🏗️ Architecture Decisions:"
	@echo "  docs/adr/ADR-000-template.md - ADR template"
	@echo "  docs/adr/ADR-001-sample-decision.md - Sample ADR (TypeScript migration)"
	@echo ""
	@echo "💡 Request for Comments:"
	@echo "  docs/rfc/RFC-template.md     - RFC template"
	@echo ""
	@echo "🔧 Development:"
	@echo "  package.json                 - Dependencies and scripts"
	@echo "  tsconfig.json                - TypeScript configuration"
	@echo "  .eslintrc.json               - ESLint configuration"
	@echo "  .prettierrc                  - Prettier configuration"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  1. Read README.md for setup instructions"
	@echo "  2. Follow docs/onboarding.md for your first commit"
	@echo "  3. Check CONTRIBUTING.md for development guidelines"
	@echo "  4. Review ADRs in docs/adr/ for architectural decisions"

docs:serve:
	@echo "📖 Serving documentation..."
	@echo "Available at: http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	@python3 -m http.server 8000 || python -m http.server 8000 || echo "Python not found. Install Python to serve docs locally."

docs:build:
	@echo "📖 Building documentation..."
	@echo "Documentation is in Markdown format and can be viewed directly on GitHub"
	@echo "or served locally with: make docs:serve"

# Database
db:migrate:
	npm run db:migrate

db:seed:
	npm run db:seed

db:reset:
	npm run db:reset

# Deployment
deploy:staging:
	@echo "🚀 Deploying to staging..."
	npm run deploy:staging

deploy:prod:
	@echo "🚀 Deploying to production..."
	npm run deploy:prod

# Install dependencies
install:
	npm install

# Setup development environment
setup: install
	@echo "🔧 Setting up development environment..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env from .env.example"; fi
	@echo "✅ Development environment ready!"
	@echo "📝 Don't forget to edit .env with your configuration"

# Run all quality checks
qa: lint type-check test
	@echo "✅ All quality checks passed!"

# Quick development workflow
dev:setup: setup
	@echo "🚀 Starting development server..."
	npm run dev
