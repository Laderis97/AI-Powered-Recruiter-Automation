# AI-Powered Recruiter Automation - Documentation Helper

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

if ($Command -eq "docs:list") {
    Write-Host "Documentation Index" -ForegroundColor Green
    Write-Host "==================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Core Documentation:" -ForegroundColor Yellow
    Write-Host "  README.md                    - Project overview and quickstart"
    Write-Host "  CONTRIBUTING.md              - How to contribute"
    Write-Host "  SECURITY.md                  - Security policy"
    Write-Host ""
    Write-Host "Guides:" -ForegroundColor Yellow
    Write-Host "  docs/onboarding.md           - First commit in 1 hour guide"
    Write-Host ""
    Write-Host "Architecture Decisions:" -ForegroundColor Yellow
    Write-Host "  docs/adr/ADR-000-template.md - ADR template"
    Write-Host "  docs/adr/ADR-001-sample-decision.md - Sample ADR (TypeScript migration)"
    Write-Host ""
    Write-Host "Request for Comments:" -ForegroundColor Yellow
    Write-Host "  docs/rfc/RFC-template.md     - RFC template"
    Write-Host ""
    Write-Host "Development:" -ForegroundColor Yellow
    Write-Host "  package.json                 - Dependencies and scripts"
    Write-Host "  tsconfig.json                - TypeScript configuration"
    Write-Host "  .eslintrc.json               - ESLint configuration"
    Write-Host "  .prettierrc                  - Prettier configuration"
    Write-Host ""
    Write-Host "Quick Start:" -ForegroundColor Yellow
    Write-Host "  1. Read README.md for setup instructions"
    Write-Host "  2. Follow docs/onboarding.md for your first commit"
    Write-Host "  3. Check CONTRIBUTING.md for development guidelines"
    Write-Host "  4. Review ADRs in docs/adr/ for architectural decisions"
}
elseif ($Command -eq "help") {
    Write-Host "AI-Powered Recruiter Automation - Available Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "Documentation:" -ForegroundColor Yellow
    Write-Host "  .\docs.ps1 docs:list        - List all documentation"
    Write-Host ""
    Write-Host "For other commands, use npm directly:" -ForegroundColor Yellow
    Write-Host "  npm run dev                  - Start development server"
    Write-Host "  npm run build                - Build for production"
    Write-Host "  npm test                     - Run tests"
    Write-Host "  npm run lint                 - Run linting"
}
else {
    Write-Host "Unknown command: $Command" -ForegroundColor Red
    Write-Host "Use .\docs.ps1 help for available commands" -ForegroundColor Yellow
}
