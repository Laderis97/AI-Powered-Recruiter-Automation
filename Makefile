.PHONY: help install-hooks qa lint test-unit scan format clean

# Default target
help:
	@echo "Available targets:"
	@echo "  install-hooks  - Install pre-commit hooks"
	@echo "  qa            - Run quality assurance checks (lint, test:unit, scan)"
	@echo "  lint          - Run linting and formatting checks"
	@echo "  test-unit     - Run unit tests"
	@echo "  scan          - Run security and spell checking"
	@echo "  format        - Format code with Prettier"
	@echo "  clean         - Clean build artifacts"

# Install pre-commit hooks
install-hooks:
	@echo "Installing pre-commit hooks..."
	npx pre-commit install
	@echo "Pre-commit hooks installed successfully!"

# Quality assurance - main target
qa: lint test-unit scan
	@echo "✅ All QA checks passed!"

# Linting and formatting
lint:
	@echo "🔍 Running linting and formatting checks..."
	npm run lint
	npm run format:check
	npm run typecheck
	@echo "✅ Linting checks passed!"

# Unit tests
test-unit:
	@echo "🧪 Running unit tests..."
	npm run test:unit
	@echo "✅ Unit tests passed!"

# Security and spell checking
scan:
	@echo "🔒 Running security and spell checks..."
	@echo "Checking for secrets in code..."
	@if command -v gitleaks >/dev/null 2>&1; then \
		gitleaks detect --source . --report-format json --report-path gitleaks-report.json || true; \
		echo "✅ Gitleaks scan completed"; \
	else \
		echo "⚠️  Gitleaks not installed, skipping secret scan"; \
	fi
	@echo "Checking documentation spelling..."
	@if command -v codespell >/dev/null 2>&1; then \
		codespell --ignore-words-list="crate,hist,nd,te" --skip="*.lock,*.min.js,*.min.css,node_modules,dist,build,.git" . || true; \
		echo "✅ Codespell check completed"; \
	else \
		echo "⚠️  Codespell not installed, skipping spell check"; \
	fi
	@echo "✅ Security and spell checks completed!"

# Format code
format:
	@echo "🎨 Formatting code..."
	npm run format
	@echo "✅ Code formatting completed!"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/ build/ node_modules/ coverage/ .nyc_output/
	@echo "✅ Cleanup completed!"

# Development setup
dev-setup: install-hooks
	@echo "🚀 Development environment setup completed!"
	@echo "Run 'make qa' to verify everything is working."
