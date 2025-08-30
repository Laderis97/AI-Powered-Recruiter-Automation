# AI-Powered Recruiter Automation

A modern, intelligent recruitment platform that automates candidate screening, job posting, and hiring analytics.

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/Laderis97/AI-Powered-Recruiter-Automation.git
cd AI-Powered-Recruiter-Automation

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Run
```bash
# Development mode
npm run dev

# Production mode
npm start

# The application will be available at http://localhost:3000
```

### Test
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Deploy
```bash
# Build for production
npm run build

# Deploy using Docker
docker build -t recruiter-automation .
docker run -p 3000:3000 recruiter-automation

# Or deploy to your preferred platform
npm run deploy
```

## 🛠️ Make Targets

```bash
# Development
make dev              # Start development server
make build            # Build for production
make clean            # Clean build artifacts

# Testing
make test             # Run all tests
make test:unit        # Run unit tests
make test:integration # Run integration tests
make test:e2e         # Run end-to-end tests
make test:coverage    # Run tests with coverage

# Code Quality
make lint             # Run linting
make lint:fix         # Fix linting issues
make format           # Format code
make type-check       # Run TypeScript type checking

# Documentation
make docs:list        # List all documentation
make docs:serve       # Serve documentation locally
make docs:build       # Build documentation

# Database
make db:migrate       # Run database migrations
make db:seed          # Seed database with sample data
make db:reset         # Reset database

# Deployment
make deploy:staging   # Deploy to staging
make deploy:prod      # Deploy to production
```

## 📚 Documentation

- **[Onboarding Guide](docs/onboarding.md)** - Get your first commit in 1 hour
- **[Architecture Decision Records](docs/adr/)** - Technical decisions and rationale
- **[RFCs](docs/rfc/)** - Request for Comments on new features
- **[API Documentation](docs/api.md)** - API endpoints and usage
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute

## 🏗️ Architecture

- **Frontend**: EJS templates, vanilla JavaScript, Chart.js
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest, Playwright, Testcontainers
- **CI/CD**: GitHub Actions
- **Security**: SAST, secrets scanning, dependency audit

## 🔧 Key Features

- **Smart Candidate Screening** - AI-powered candidate matching
- **Job Posting Management** - Create and manage job postings
- **Analytics Dashboard** - Hiring funnel and performance metrics
- **Modern UI/UX** - Responsive design with smooth interactions
- **Real-time Notifications** - Stay updated on recruitment progress

## 📊 Analytics

- Hiring funnel visualization
- Time-to-hire tracking
- Stage performance analysis
- Candidate conversion rates
- Recruitment efficiency metrics

## 🔒 Security

- SAST (Static Application Security Testing)
- Secrets scanning with Gitleaks
- Dependency vulnerability scanning
- SBOM (Software Bill of Materials)
- Threat modeling with STRIDE framework

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/discussions)
- **Documentation**: [docs/](docs/) directory

---

**Made with ❤️ for modern recruitment teams**
