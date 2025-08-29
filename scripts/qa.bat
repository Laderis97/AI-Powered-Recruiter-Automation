@echo off
REM Quality Assurance Script for Windows
REM This script runs all quality checks: linting, testing, and security scanning

setlocal enabledelayedexpansion

REM Check if we have parameters
if "%1"=="install-hooks" goto :install_hooks
if "%1"=="lint" goto :lint
if "%1"=="test" goto :test
if "%1"=="test-unit" goto :test_unit
if "%1"=="test-int" goto :test_int
if "%1"=="test-e2e" goto :test_e2e
if "%1"=="test-all" goto :test_all
if "%1"=="test-coverage" goto :test_coverage
if "%1"=="test-debug" goto :test_debug
if "%1"=="test-flaky" goto :test_flaky
if "%1"=="scan" goto :scan
if "%1"=="sbom" goto :sbom
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
echo   test-unit     - Run unit tests only
echo   test-int      - Run integration tests only
echo   test-e2e      - Run E2E tests only
echo   test-all      - Run all test types
echo   test-coverage - Generate test coverage report
echo   test-debug    - Run tests in debug mode
echo   test-flaky    - Run flaky tests
echo   scan          - Run security and spell checks
echo   sbom          - Generate Software Bill of Materials
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

:test_unit
echo 🧪 Running unit tests...
call npm run test:unit
if %ERRORLEVEL% neq 0 (
    echo ❌ Unit tests failed
    goto :end
)
echo ✅ Unit tests passed!
goto :end

:test_int
echo 🔗 Running integration tests...
call npm run test:int
if %ERRORLEVEL% neq 0 (
    echo ❌ Integration tests failed
    goto :end
)
echo ✅ Integration tests passed!
goto :end

:test_e2e
echo 🌐 Running E2E tests...
call npm run test:e2e
if %ERRORLEVEL% neq 0 (
    echo ❌ E2E tests failed
    goto :end
)
echo ✅ E2E tests passed!
goto :end

:test_all
echo 🚀 Running all test types...
call npm run test:all
if %ERRORLEVEL% neq 0 (
    echo ❌ Tests failed
    goto :end
)
echo ✅ All tests passed!
goto :end

:test_coverage
echo 📊 Generating test coverage report...
call npm run test:coverage
if %ERRORLEVEL% neq 0 (
    echo ❌ Coverage generation failed
    goto :end
)
echo ✅ Coverage report generated in /coverage
goto :end

:test_debug
echo 🐛 Running tests in debug mode...
call npm run test:debug
if %ERRORLEVEL% neq 0 (
    echo ❌ Debug tests failed
    goto :end
)
echo ✅ Debug tests completed
goto :end

:test_flaky
echo ⚠️  Running flaky tests...
call npm run test:flaky
if %ERRORLEVEL% neq 0 (
    echo ❌ Flaky tests failed
    goto :end
)
echo ✅ Flaky tests completed
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

:sbom
echo 📋 Generating Software Bill of Materials...
echo.
echo Using npx to generate SBOM...
call npx @cyclonedx/cyclonedx-npm --output-format json --output-file cyclonedx.json
if %ERRORLEVEL% equ 0 (
    echo ✅ SBOM generated: cyclonedx.json
    echo ✅ SBOM generation completed!
) else (
    echo ❌ Failed to generate SBOM
)
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
