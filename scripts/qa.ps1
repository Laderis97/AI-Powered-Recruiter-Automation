# Quality Assurance Script for Windows
# This script runs all quality checks: linting, testing, and security scanning

param(
    [switch]$InstallHooks,
    [switch]$Lint,
    [switch]$Test,
    [switch]$Scan,
    [switch]$All
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Green = "✅"
$Red = "❌"
$Yellow = "⚠️"
$Blue = "🔍"
$Purple = "🧪"
$Shield = "🔒"

# Function to run a command and check exit code
function Invoke-CommandWithCheck {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "$Blue $Description..." -ForegroundColor Cyan
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$Green $Description completed successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Host "$Red $Description failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "$Red $Description failed: $_" -ForegroundColor Red
        return $false
    }
}

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Main execution
Write-Host "🚀 AI-Powered Recruiter Automation - Quality Assurance" -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Magenta

$allPassed = $true

# Install hooks if requested
if ($InstallHooks -or $All) {
    Write-Host "$Blue Installing pre-commit hooks..." -ForegroundColor Cyan
    
    # Check if pre-commit is available
    if (Test-Command "pre-commit") {
        pre-commit install
        Write-Host "$Green Pre-commit hooks installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "$Yellow Pre-commit not available, skipping hook installation" -ForegroundColor Yellow
        Write-Host "$Blue You can install it with: pip install pre-commit" -ForegroundColor Blue
    }
}

# Linting and formatting
if ($Lint -or $All) {
    Write-Host "$Blue Running linting and formatting checks..." -ForegroundColor Cyan
    
    # ESLint
    if (-not (Invoke-CommandWithCheck "npm run lint" "ESLint check")) {
        $allPassed = $false
    }
    
    # Prettier check
    if (-not (Invoke-CommandWithCheck "npm run format:check" "Prettier format check")) {
        $allPassed = $false
    }
    
    # TypeScript check
    if (-not (Invoke-CommandWithCheck "npm run typecheck" "TypeScript type check")) {
        $allPassed = $false
    }
    
    # Markdown linting
    if (-not (Invoke-CommandWithCheck "npm run markdownlint" "Markdown linting")) {
        $allPassed = $false
    }
}

# Unit tests
if ($Test -or $All) {
    Write-Host "$Purple Running unit tests..." -ForegroundColor Cyan
    
    if (-not (Invoke-CommandWithCheck "npm run test:unit" "Unit tests")) {
        $allPassed = $false
    }
}

# Security and spell checking
if ($Scan -or $All) {
    Write-Host "$Shield Running security and spell checks..." -ForegroundColor Cyan
    
    # Check for gitleaks
    if (Test-Command "gitleaks") {
        Write-Host "$Blue Running gitleaks secret scan..." -ForegroundColor Cyan
        gitleaks detect --source . --report-format json --report-path gitleaks-report.json
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$Green Gitleaks scan completed - no secrets found" -ForegroundColor Green
        } else {
            Write-Host "$Red Gitleaks found potential secrets!" -ForegroundColor Red
            $allPassed = $false
        }
    } else {
        Write-Host "$Yellow Gitleaks not installed, skipping secret scan" -ForegroundColor Yellow
        Write-Host "$Blue Install from: https://github.com/gitleaks/gitleaks/releases" -ForegroundColor Blue
    }
    
    # Check for codespell
    if (Test-Command "codespell") {
        Write-Host "$Blue Running codespell check..." -ForegroundColor Cyan
        codespell --ignore-words-list="crate,hist,nd,te" --skip="*.lock,*.min.js,*.min.css,node_modules,dist,build,.git" .
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$Green Codespell check completed - no spelling issues found" -ForegroundColor Green
        } else {
            Write-Host "$Red Codespell found spelling issues!" -ForegroundColor Red
            $allPassed = $false
        }
    } else {
        Write-Host "$Yellow Codespell not installed, skipping spell check" -ForegroundColor Yellow
        Write-Host "$Blue Install with: pip install codespell" -ForegroundColor Blue
    }
}

# Final result
Write-Host ""
Write-Host "==================================================" -ForegroundColor Magenta
if ($allPassed) {
    Write-Host "$Green All QA checks passed! 🎉" -ForegroundColor Green
    exit 0
} else {
    Write-Host "$Red Some QA checks failed. Please fix the issues above." -ForegroundColor Red
    exit 1
}
