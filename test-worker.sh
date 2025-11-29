#!/bin/bash

# test-worker.sh
# Script to test the Cloudflare Worker API locally or in production

# Default to localhost for testing
WORKER_URL="${1:-http://localhost:8787}"
API_KEY="${2:-}"

echo "🧪 Testing Rosetta Translate Worker API"
echo "Target: $WORKER_URL"
echo ""

# Test 1: Get API info
echo "Test 1: GET / - API Information"
echo "-----------------------------------"
curl -s "$WORKER_URL" | jq . 2>/dev/null || curl -s "$WORKER_URL"
echo ""
echo ""

# Test 2: Translate without API key (should fail if not configured in environment)
if [ -z "$API_KEY" ]; then
    echo "Test 2: POST /translate without API key (expecting 401 error)"
    echo "----------------------------------------------------------------"
    curl -s -X POST "$WORKER_URL/translate" \
      -H "Content-Type: application/json" \
      -d '{"text": "Hello, world!"}' | jq . 2>/dev/null || curl -s -X POST "$WORKER_URL/translate" \
      -H "Content-Type: application/json" \
      -d '{"text": "Hello, world!"}'
    echo ""
    echo ""
    echo "ℹ️  To test with an API key, run:"
    echo "   ./test-worker.sh $WORKER_URL YOUR_API_KEY"
else
    echo "Test 2: POST /translate with API key"
    echo "-------------------------------------"
    curl -s -X POST "$WORKER_URL/translate" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"Hello, this is a test.\\n\\nThis is another paragraph.\", \"apiKey\": \"$API_KEY\"}" | jq . 2>/dev/null || curl -s -X POST "$WORKER_URL/translate" \
      -H "Content-Type: application/json" \
      -d "{\"text\": \"Hello, this is a test.\\n\\nThis is another paragraph.\", \"apiKey\": \"$API_KEY\"}"
    echo ""
    echo ""
fi

# Test 3: Invalid method
echo "Test 3: DELETE / - Invalid method (expecting 405 error)"
echo "--------------------------------------------------------"
curl -s -X DELETE "$WORKER_URL" | jq . 2>/dev/null || curl -s -X DELETE "$WORKER_URL"
echo ""
echo ""

# Test 4: Invalid JSON
echo "Test 4: POST /translate with invalid JSON (expecting 400 error)"
echo "---------------------------------------------------------------"
curl -s -X POST "$WORKER_URL/translate" \
  -H "Content-Type: application/json" \
  -d 'not valid json' 2>&1 | head -3
echo ""
echo ""

# Test 5: Missing text field
echo "Test 5: POST /translate without text field (expecting 400 error)"
echo "-----------------------------------------------------------------"
curl -s -X POST "$WORKER_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "field"}' | jq . 2>/dev/null || curl -s -X POST "$WORKER_URL/translate" \
  -H "Content-Type: application/json" \
  -d '{"invalid": "field"}'
echo ""
echo ""

echo "✅ Testing complete!"
echo ""
echo "Usage:"
echo "  # Test locally:"
echo "  ./test-worker.sh"
echo ""
echo "  # Test locally with API key:"
echo "  ./test-worker.sh http://localhost:8787 sk-or-your-api-key"
echo ""
echo "  # Test production:"
echo "  ./test-worker.sh https://rosetta-translate.your-subdomain.workers.dev"
echo ""
echo "  # Test production with API key:"
echo "  ./test-worker.sh https://rosetta-translate.your-subdomain.workers.dev sk-or-your-api-key"
