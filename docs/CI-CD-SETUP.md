# CI/CD Setup Guide

This guide explains how to set up and use the comprehensive CI/CD pipeline for the Convert Translation application.

## Quick Start

### 1. Repository Setup
The CI/CD workflow is automatically configured when you have the following files in your repository:
- `.github/workflows/ci.yml` - Main CI/CD workflow
- `scripts/validate-ci.sh` - Local validation script
- `package.json` - Updated with validation scripts

### 2. Local Validation (Recommended)
Before pushing code, run local validation to catch issues early:

```bash
# Quick validation (type-check, lint, tests)
pnpm run ci:quick

# Full validation (matches CI pipeline exactly)
pnpm run validate-ci
```

### 3. GitHub Integration
The workflow automatically runs on:
- **Push to main branch**
- **Pull requests to main**
- **Manual dispatch** (via GitHub Actions tab)

## Workflow Structure

### Job Dependencies
```
Quality Assurance (Node 18.x & 20.x)
├── Component Testing
├── Security Audit  
└── Build Matrix
    └── CI Success Check
```

### Execution Time
- **Total Pipeline**: ~10-15 minutes
- **Quality Assurance**: ~8-12 minutes
- **Component Testing**: ~5-8 minutes
- **Security Audit**: ~2-3 minutes
- **Build Matrix**: ~5-7 minutes

## Quality Gates

### ✅ TypeScript Compliance
- Zero compilation errors
- Strict mode enabled
- No `any` types or type assertions

### ✅ Code Quality
- ESLint rules compliance
- Consistent code formatting
- Vue 3 + TypeScript best practices

### ✅ Test Coverage
- **309+ unit tests** must pass
- Component behavior validation
- Integration test coverage
- Regression test protection

### ✅ Build Verification
- Production build success
- Development build success
- Asset optimization
- Bundle size validation

### ✅ Security Standards
- Dependency vulnerability scan
- Package integrity verification
- Supply chain security

## Local Development Workflow

### Pre-commit Checklist
```bash
# 1. Install dependencies
pnpm install

# 2. Run type checking
pnpm run type-check

# 3. Fix linting issues
pnpm run lint

# 4. Run tests
pnpm run test:unit -- --run

# 5. Verify build
pnpm run build

# 6. Full validation (optional)
pnpm run validate-ci
```

### IDE Integration
Configure your IDE to run these checks automatically:
- **TypeScript**: Enable strict mode checking
- **ESLint**: Auto-fix on save
- **Prettier**: Format on save
- **Vitest**: Run tests in watch mode

## GitHub Actions Configuration

### Required Secrets
No secrets are required for the basic CI/CD pipeline.

### Optional Enhancements
You can add these secrets for enhanced functionality:
- `SLACK_WEBHOOK_URL` - For Slack notifications
- `CODECOV_TOKEN` - For code coverage reporting

### Branch Protection Rules
Recommended branch protection settings for `main`:
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require review from code owners
- ✅ Dismiss stale reviews when new commits are pushed

## Troubleshooting

### Common Issues

#### TypeScript Errors
```bash
# Check specific errors
pnpm run type-check

# Common fixes
- Update type definitions
- Fix import/export issues
- Resolve interface mismatches
```

#### Test Failures
```bash
# Run specific test files
pnpm run test:unit src/__tests__/skeleton-components.test.ts -- --run
pnpm run test:unit src/__tests__/file-management.test.ts -- --run

# Debug test issues
- Check component props/events
- Verify store state management
- Validate async component loading
```

#### Build Failures
```bash
# Local build debugging
pnpm run build

# Common fixes
- Resolve import path issues
- Fix missing dependencies
- Update Vite configuration
```

#### Dependency Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Audit and fix vulnerabilities
pnpm audit --fix
```

### Performance Issues

#### Slow Pipeline
- Check cache hit rates
- Optimize test execution
- Review dependency sizes

#### Failed Caches
- Clear GitHub Actions cache
- Update cache keys
- Verify pnpm-lock.yaml integrity

## Monitoring and Maintenance

### Status Monitoring
Add this badge to your README.md:
```markdown
[![CI/CD Pipeline](https://github.com/YOUR_USERNAME/convert-translation/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/convert-translation/actions/workflows/ci.yml)
```

### Regular Maintenance
- **Weekly**: Review failed builds and fix issues
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Update GitHub Actions versions
- **Annually**: Review and optimize pipeline performance

### Metrics to Track
- **Build Success Rate**: Target >95%
- **Average Build Time**: Target <15 minutes
- **Test Coverage**: Maintain 309+ tests
- **Security Score**: Zero moderate+ vulnerabilities

## Advanced Configuration

### Custom Test Categories
Add new test categories by creating new jobs:
```yaml
custom-testing:
  name: Custom Testing
  runs-on: ubuntu-latest
  needs: quality-assurance
  steps:
    - name: Custom Test Suite
      run: pnpm run test:custom -- --run
```

### Environment-Specific Builds
Extend the build matrix for different environments:
```yaml
strategy:
  matrix:
    build-mode: [development, staging, production]
    node-version: [18.x, 20.x]
```

### Deployment Integration
Add deployment jobs after successful CI:
```yaml
deploy:
  name: Deploy
  runs-on: ubuntu-latest
  needs: ci-success
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Deploy to Production
      run: # deployment commands
```

## Support

### Getting Help
- **GitHub Issues**: Report pipeline problems
- **Documentation**: Check workflow README
- **Local Validation**: Use `pnpm run validate-ci`

### Contributing
When contributing to the CI/CD pipeline:
1. Test changes locally first
2. Update documentation
3. Verify all quality gates pass
4. Consider backward compatibility

This CI/CD pipeline ensures that all recent improvements including Pinia store integration, file replacement logic, skeleton components, and TypeScript compliance work correctly in a clean environment, providing confidence in code quality and application reliability.
