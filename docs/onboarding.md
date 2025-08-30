# Onboarding Guide: First Commit in 1 Hour

Welcome to the AI-Powered Recruiter Automation project! This guide will help you get your first commit within 1 hour.

## 🚀 Quick Setup (15 minutes)

### Prerequisites
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/Laderis97/AI-Powered-Recruiter-Automation.git
cd AI-Powered-Recruiter-Automation

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration (see .env.example for required fields)
```

### 2. Verify Setup
```bash
# Start the development server
npm run dev

# Open http://localhost:3000 in your browser
# You should see the modern dashboard
```

## 🎯 Your First Task (30 minutes)

### Choose a Simple Task
Pick one of these beginner-friendly tasks:

1. **Fix a Typo** - Find and fix a typo in the UI text
2. **Add a Console Log** - Add a helpful debug log (remember to use ESLint disable comment)
3. **Update Documentation** - Fix a broken link or add a missing section
4. **Style Improvement** - Make a small CSS improvement

### Example: Fix a Typo
```bash
# Find a typo in the codebase
grep -r "recieve" .  # Common typo
# or
grep -r "occured" .  # Another common typo

# Edit the file and fix the typo
# Example: Change "recieve" to "receive"
```

## 📝 Making Your First Commit (15 minutes)

### 1. Check Your Changes
```bash
# See what you've changed
git status

# See the specific changes
git diff
```

### 2. Stage and Commit
```bash
# Stage your changes
git add .

# Commit with a conventional message
git commit -m "fix: correct typo in dashboard text"

# Or use the interactive commit tool
npm run commit
```

### 3. Push Your Changes
```bash
# Create a new branch (recommended)
git checkout -b fix/typo-correction

# Push to your fork
git push origin fix/typo-correction
```

## 🔧 Development Workflow

### Code Quality Checks
```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run tests
npm test
```

### Git Workflow
```bash
# Always work on a feature branch
git checkout -b feature/your-feature-name

# Keep your branch up to date
git pull origin main

# Use conventional commits
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

## 📚 Learning Resources

### Project Structure
- `src/` - Server-side TypeScript code
- `views/` - EJS templates
- `public/` - Static assets (CSS, JS, images)
- `docs/` - Documentation
- `__tests__/` - Test files

### Key Files to Know
- `src/server.ts` - Main server file
- `views/modern-dashboard.ejs` - Main dashboard template
- `public/js/modern-ui.js` - Client-side JavaScript
- `package.json` - Dependencies and scripts

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run all tests
npm run lint         # Run linting
npm run type-check   # TypeScript type checking
```

## 🐛 Common Issues

### Port Already in Use
```bash
# Find and kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Git Issues
```bash
# Reset to a clean state
git reset --hard HEAD
git clean -fd
```

## 🎉 Success Checklist

- [ ] Repository cloned and dependencies installed
- [ ] Development server running on localhost:3000
- [ ] Made a small change to the codebase
- [ ] Changes committed with conventional commit message
- [ ] Code passes linting (`npm run lint`)
- [ ] Ready to create a pull request

## 📞 Getting Help

- **Documentation**: Check the [docs/](docs/) directory
- **Issues**: Search existing [GitHub Issues](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/issues)
- **Discussions**: Use [GitHub Discussions](https://github.com/Laderis97/AI-Powered-Recruiter-Automation/discussions)
- **Team**: Reach out to the team on Slack/Discord

## 🚀 Next Steps

After your first commit:
1. Create a pull request
2. Review the [Contributing Guidelines](CONTRIBUTING.md)
3. Pick up a "good first issue" from the GitHub issues
4. Join team discussions and code reviews

---

**Welcome to the team! 🎉**
