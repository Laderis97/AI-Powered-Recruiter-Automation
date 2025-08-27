@echo off
REM Quality Assurance Script for Windows
REM This script runs all quality checks: linting, testing, and security scanning

setlocal enabledelayedexpansion

REM Check if we have parameters
if "%1"=="install-hooks" goto :install_hooks
if "%1"=="lint" goto :lint
if "%1"=="test" goto :test
if "%1"=="scan" goto :scan
if "%1"=="all" goto :all
if "%1"=="help" goto :help

REM Default to all if no parameters
goto :all

:help
echo.
echo Usage: qa.bat [command]
echo.
echo Commands:
echo   install-hooks  - Install pre-commit hooks
echo   lint          - Run linting and formatting checks
echo   test          - Run unit tests
echo   scan          - Run security and spell checks
echo   all           - Run all checks (default)
echo   help          - Show this help message
echo.
goto :end

:install_hooks
echo 🔧 Installing pre-commit hooks...
call npm run install-hooks
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install hooks
    goto :end
)
echo ✅ Pre-commit hooks installed successfully!
goto :end

:lint
echo 🔍 Running linting and formatting checks...
echo.
echo Running ESLint...
call npm run lint
if %ERRORLEVEL% neq 0 (
    echo ❌ ESLint check failed
    goto :end
)

echo Running Prettier check...
call npm run format:check
if %ERRORLEVEL% neq 0 (
    echo ❌ Prettier check failed
    goto :end
)

echo Running TypeScript check...
call npm run typecheck
if %ERRORLEVEL% neq 0 (
    echo ❌ TypeScript check failed
    goto :end
)

echo Running Markdown linting...
call npm run markdownlint
if %ERRORLEVEL% neq 0 (
    echo ❌ Markdown linting failed
    goto :end
)

echo ✅ All linting checks passed!
goto :end

:test
echo 🧪 Running unit tests...
call npm run test:unit
if %ERRORLEVEL% neq 0 (
    echo ❌ Unit tests failed
    goto :end
)
echo ✅ Unit tests passed!
goto :end

:scan
echo 🔒 Running security and spell checks...
echo.
echo Checking for gitleaks...
where gitleaks >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Running gitleaks secret scan...
    gitleaks detect --source . --report-format json --report-path gitleaks-report.json
    if %ERRORLEVEL% equ 0 (
        echo ✅ Gitleaks scan completed - no secrets found
    ) else (
        echo ❌ Gitleaks found potential secrets!
        goto :end
    )
) else (
    echo ⚠️  Gitleaks not installed, skipping secret scan
    echo Install from: https://github.com/gitleaks/gitleaks/releases
)

echo Checking for codespell...
where codespell >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo Running codespell check...
    codespell --ignore-words-list="crate,hist,nd,te" --skip="*.lock,*.min.js,*.min.css,node_modules,dist,build,.git" .
    if %ERRORLEVEL% equ 0 (
        echo ✅ Codespell check completed - no spelling issues found
    ) else (
        echo ❌ Codespell found spelling issues!
        goto :end
    )
) else (
    echo ⚠️  Codespell not installed, skipping spell check
    echo Install with: pip install codespell
)

echo ✅ Security and spell checks completed!
goto :end

:all
echo 🚀 AI-Powered Recruiter Automation - Quality Assurance
echo ==================================================
echo.
call :lint
if %ERRORLEVEL% neq 0 goto :end

call :test
if %ERRORLEVEL% neq 0 goto :end

call :scan
if %ERRORLEVEL% neq 0 goto :end

echo.
echo ==================================================
echo ✅ All QA checks passed! 🎉
goto :end

:end
endlocal
