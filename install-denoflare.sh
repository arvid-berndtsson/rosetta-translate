#!/bin/bash

# install-denoflare.sh
# Script to install Denoflare CLI for Cloudflare Workers deployment

echo "🚀 Installing Denoflare CLI..."
echo ""

# Check if Deno is installed
if ! command -v deno &> /dev/null
then
    echo "❌ Error: Deno is not installed."
    echo "Please install Deno first from https://deno.land"
    echo ""
    echo "Quick install:"
    echo "  curl -fsSL https://deno.land/install.sh | sh"
    exit 1
fi

echo "✓ Deno found: $(deno --version | head -n1)"
echo ""

# Install Denoflare
echo "Installing Denoflare from GitHub..."
deno install --unstable-worker-options --allow-read --allow-net --allow-import --global --allow-env --allow-run --name denoflare --force https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Denoflare installed successfully!"
    echo ""
    echo "Verify installation with:"
    echo "  denoflare --version"
    echo ""
    echo "Next steps:"
    echo "1. Copy .denoflare.example to .denoflare"
    echo "2. Add your Cloudflare credentials to .denoflare"
    echo "3. Test locally with: deno task worker:serve"
    echo "4. Deploy with: deno task worker:push"
    echo ""
    echo "See CLOUDFLARE_DEPLOYMENT.md for detailed instructions."
else
    echo ""
    echo "❌ Installation failed. Please check the error messages above."
    exit 1
fi
