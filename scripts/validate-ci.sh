#!/bin/bash

# CI/CD Pipeline Local Validation Script
# This script runs the same checks as the GitHub Actions workflow locally

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🔍 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Header
echo -e "${BLUE}"
echo "=================================================="
echo "  CI/CD Pipeline Local Validation"
echo "  Convert Translation Application"
echo "=================================================="
echo -e "${NC}"

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command_exists pnpm; then
    print_error "pnpm is not installed. Please install it with: npm install -g pnpm"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js version: $NODE_VERSION"

PNPM_VERSION=$(pnpm --version)
print_success "pnpm version: $PNPM_VERSION"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

if [ ! -f "pnpm-lock.yaml" ]; then
    print_warning "pnpm-lock.yaml not found. Dependencies might not be locked."
fi

echo ""

# Step 1: Install Dependencies
print_status "Step 1: Installing dependencies..."
if pnpm install --frozen-lockfile; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Step 2: TypeScript Compilation Check
print_status "Step 2: TypeScript compilation check..."
if pnpm run type-check; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

echo ""

# Step 3: ESLint Code Quality Check
print_status "Step 3: ESLint code quality check..."
if pnpm run lint; then
    print_success "ESLint check passed"
else
    print_error "ESLint check failed"
    exit 1
fi

echo ""

# Step 4: Unit Tests Execution
print_status "Step 4: Running unit tests..."
if pnpm run test:unit -- --run --reporter=verbose; then
    print_success "All unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

echo ""

# Step 5: Component-Specific Tests
print_status "Step 5: Running component-specific tests..."

# Test skeleton components
print_status "Testing skeleton components..."
if pnpm run test:unit src/__tests__/skeleton-components.test.ts -- --run; then
    print_success "Skeleton components tests passed"
else
    print_error "Skeleton components tests failed"
    exit 1
fi

# Test file management
print_status "Testing file management..."
if pnpm run test:unit src/__tests__/file-management.test.ts -- --run; then
    print_success "File management tests passed"
else
    print_error "File management tests failed"
    exit 1
fi

# Test reactivity fixes
print_status "Testing reactivity fixes..."
if pnpm run test:unit src/__tests__/reactivity-fix.test.ts -- --run; then
    print_success "Reactivity tests passed"
else
    print_error "Reactivity tests failed"
    exit 1
fi

# Test file replacement logic
print_status "Testing file replacement logic..."
if pnpm run test:unit src/__tests__/file-replacement-fix.test.ts -- --run; then
    print_success "File replacement tests passed"
else
    print_error "File replacement tests failed"
    exit 1
fi

if pnpm run test:unit src/__tests__/file-clearing-on-confirmation.test.ts -- --run; then
    print_success "File clearing tests passed"
else
    print_error "File clearing tests failed"
    exit 1
fi

echo ""

# Step 6: Security Audit
print_status "Step 6: Running security audit..."
if pnpm audit --audit-level moderate; then
    print_success "Security audit passed"
else
    print_warning "Security audit found issues (this may not be critical)"
fi

echo ""

# Step 7: Production Build Verification
print_status "Step 7: Production build verification..."
if pnpm run build; then
    print_success "Production build successful"
else
    print_error "Production build failed"
    exit 1
fi

echo ""

# Final Success Message
echo -e "${GREEN}"
echo "=================================================="
echo "🎉 ALL CI/CD CHECKS PASSED SUCCESSFULLY!"
echo "=================================================="
echo ""
echo "✅ TypeScript compilation: PASSED"
echo "✅ ESLint code quality: PASSED"
echo "✅ Unit tests: PASSED"
echo "✅ Component testing: PASSED"
echo "✅ Security audit: COMPLETED"
echo "✅ Build verification: PASSED"
echo ""
echo "🚀 Your code is ready for push/PR!"
echo "=================================================="
echo -e "${NC}"

# Optional: Show build size
if [ -d "dist" ]; then
    echo ""
    print_status "Build output summary:"
    du -sh dist/
    echo ""
fi

exit 0
