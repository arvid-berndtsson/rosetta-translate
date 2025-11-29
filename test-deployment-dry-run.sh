#!/bin/bash

# test-deployment-dry-run.sh
# Script to test the deployment setup without actually deploying to production
# This validates that all the changes work correctly

set -e  # Exit on error

echo "🧪 Rosetta Translate - Deployment Dry Run Test"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass_test() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((TESTS_FAILED++))
}

info() {
    echo -e "${YELLOW}ℹ${NC}  $1"
}

# Test 1: Check if Deno is installed
echo "Test 1: Checking Deno installation..."
echo "--------------------------------------"
if command -v deno &> /dev/null; then
    DENO_VERSION=$(deno --version | head -n1)
    pass_test "Deno is installed: $DENO_VERSION"
else
    fail_test "Deno is not installed"
    echo ""
    echo "Please install Deno first:"
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi
echo ""

# Test 2: Test Denoflare installation with new --allow-import flag
echo "Test 2: Testing Denoflare installation with --allow-import flag..."
echo "-------------------------------------------------------------------"
info "Installing Denoflare with updated command..."

# Try the installation
if deno install --unstable-worker-options --allow-read --allow-net --allow-import --global --allow-env --allow-run --name denoflare-test --force https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts &> /tmp/denoflare-install.log; then
    pass_test "Denoflare installation succeeded with --allow-import flag"
    
    # Check if the binary is accessible
    export PATH="$HOME/.deno/bin:$PATH"
    if command -v denoflare-test &> /dev/null; then
        DENOFLARE_VERSION=$(denoflare-test --version 2>&1 || echo "unknown")
        pass_test "Denoflare binary is accessible: $DENOFLARE_VERSION"
    else
        fail_test "Denoflare binary not found in PATH"
    fi
else
    fail_test "Denoflare installation failed"
    echo "Installation log:"
    cat /tmp/denoflare-install.log
    exit 1
fi
echo ""

# Test 3: Validate worker.ts syntax
echo "Test 3: Validating worker.ts syntax..."
echo "---------------------------------------"
if deno check worker.ts 2>&1; then
    pass_test "worker.ts has valid TypeScript syntax"
else
    fail_test "worker.ts has syntax errors"
fi
echo ""

# Test 4: Check if worker can be bundled (without serving)
echo "Test 4: Testing worker bundling..."
echo "----------------------------------"
info "Attempting to bundle worker.ts..."
if deno bundle worker.ts /tmp/worker-bundle.js &> /tmp/bundle.log; then
    pass_test "Worker can be bundled successfully"
    BUNDLE_SIZE=$(du -h /tmp/worker-bundle.js | cut -f1)
    info "Bundle size: $BUNDLE_SIZE"
else
    fail_test "Worker bundling failed"
    echo "Bundle log:"
    cat /tmp/bundle.log
fi
echo ""

# Test 5: Validate .denoflare.example structure
echo "Test 5: Validating .denoflare.example configuration..."
echo "-------------------------------------------------------"
if [ -f ".denoflare.example" ]; then
    pass_test ".denoflare.example file exists"
    
    # Check for required fields
    if grep -q "rosetta-translate" .denoflare.example && \
       grep -q "worker.ts" .denoflare.example && \
       grep -q "OPENROUTER_API_KEY" .denoflare.example && \
       grep -q "accountId" .denoflare.example && \
       grep -q "apiToken" .denoflare.example; then
        pass_test ".denoflare.example contains all required fields"
    else
        fail_test ".denoflare.example is missing required fields"
    fi
else
    fail_test ".denoflare.example file not found"
fi
echo ""

# Test 6: Validate GitHub Actions workflow
echo "Test 6: Validating GitHub Actions workflow..."
echo "----------------------------------------------"
if [ -f ".github/workflows/deploy-cloudflare.yml" ]; then
    pass_test "deploy-cloudflare.yml exists"
    
    # Check if it contains the --allow-import flag
    if grep -q "\-\-allow-import" .github/workflows/deploy-cloudflare.yml; then
        pass_test "Workflow contains --allow-import flag"
    else
        fail_test "Workflow is missing --allow-import flag"
    fi
    
    # Check for required secrets placeholders
    if grep -q "CLOUDFLARE_ACCOUNT_ID" .github/workflows/deploy-cloudflare.yml && \
       grep -q "CLOUDFLARE_API_TOKEN" .github/workflows/deploy-cloudflare.yml && \
       grep -q "OPENROUTER_API_KEY" .github/workflows/deploy-cloudflare.yml; then
        pass_test "Workflow references all required secrets"
    else
        fail_test "Workflow is missing required secret references"
    fi
else
    fail_test "deploy-cloudflare.yml not found"
fi
echo ""

# Test 7: Check documentation updates
echo "Test 7: Validating documentation updates..."
echo "--------------------------------------------"
FILES_TO_CHECK=("README.md" "CLOUDFLARE_DEPLOYMENT.md" "install-denoflare.sh")
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "\-\-allow-import" "$file"; then
            pass_test "$file contains --allow-import flag"
        else
            fail_test "$file is missing --allow-import flag"
        fi
    else
        fail_test "$file not found"
    fi
done
echo ""

# Test 8: Simulate deployment preparation (without actual deployment)
echo "Test 8: Simulating deployment preparation..."
echo "---------------------------------------------"
info "Creating temporary .denoflare config from example..."
cp .denoflare.example /tmp/.denoflare.test
if [ -f "/tmp/.denoflare.test" ]; then
    pass_test "Config file can be created from example"
    
    # Replace placeholders with dummy values
    sed -i 's/YOUR_OPENROUTER_API_KEY_HERE/sk-test-key-dummy/g' /tmp/.denoflare.test
    sed -i 's/YOUR_CLOUDFLARE_ACCOUNT_ID_HERE/test-account-id/g' /tmp/.denoflare.test
    sed -i 's/YOUR_CLOUDFLARE_API_TOKEN_HERE/test-api-token/g' /tmp/.denoflare.test
    
    pass_test "Config placeholders can be replaced"
else
    fail_test "Failed to create config from example"
fi
echo ""

# Test 9: Check if denoflare can parse the config (dry-run)
echo "Test 9: Testing denoflare config parsing..."
echo "--------------------------------------------"
info "Note: This may fail with authentication errors, which is expected"
# This will fail with auth errors but should at least parse the config
if denoflare-test push rosetta-translate --config /tmp/.denoflare.test --dry-run 2>&1 | grep -q "rosetta-translate\|config\|script" || true; then
    info "Denoflare can attempt to parse the config (auth errors expected)"
else
    info "Denoflare command structure is correct (actual deployment would require valid credentials)"
fi
echo ""

# Summary
echo "=============================================="
echo "Dry Run Test Summary"
echo "=============================================="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "The deployment setup appears to be correct."
    echo ""
    echo "Next steps for actual deployment:"
    echo "1. Copy .denoflare.example to .denoflare"
    echo "2. Add your real Cloudflare credentials to .denoflare"
    echo "3. Add your OpenRouter API key to .denoflare"
    echo "4. Test locally with: deno task worker:serve"
    echo "5. Deploy with: deno task worker:push"
    echo ""
    echo "Or use GitHub Actions by:"
    echo "1. Adding secrets to your GitHub repository:"
    echo "   - CLOUDFLARE_ACCOUNT_ID"
    echo "   - CLOUDFLARE_API_TOKEN"
    echo "   - OPENROUTER_API_KEY"
    echo "2. Pushing to the main branch"
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC}"
    echo ""
    echo "Please review the failures above before attempting deployment."
    exit 1
fi
