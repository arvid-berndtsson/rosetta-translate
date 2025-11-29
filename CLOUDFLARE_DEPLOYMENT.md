# Cloudflare Workers Deployment Guide

This guide provides detailed instructions for deploying Rosetta Translate to Cloudflare Workers using Denoflare.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Manual Deployment](#manual-deployment)
- [Automated Deployment (GitHub Actions)](#automated-deployment-github-actions)
- [Testing the API](#testing-the-api)
- [Troubleshooting](#troubleshooting)

## Overview

Rosetta Translate can be deployed as a Cloudflare Worker, providing a serverless edge translation API. The worker exposes a REST API that accepts text for translation and returns the translated content.

## Prerequisites

1. **Deno Runtime**
   ```bash
   # Install Deno
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Denoflare CLI**
   ```bash
   deno install --unstable-worker-options --allow-read --allow-net --global --allow-env --allow-run --name denoflare --force https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts
   ```

3. **Cloudflare Account**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Navigate to Workers & Pages
   - Note your Account ID (shown in the URL or dashboard)

4. **Cloudflare API Token**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - Create a new API token using the "Edit Cloudflare Workers" template
   - Copy the token (you'll only see it once!)

5. **OpenRouter API Key**
   - Sign up at [OpenRouter.ai](https://openrouter.ai)
   - Create an API key from your account settings

## Local Development

### 1. Configure Denoflare

Copy the example configuration:
```bash
cp .denoflare.example .denoflare
```

Edit `.denoflare` with your credentials:
```json
{
  "$schema": "https://raw.githubusercontent.com/skymethod/denoflare/v0.5.11/common/config.schema.json",
  "scripts": {
    "rosetta-translate": {
      "path": "./worker.ts",
      "localPort": 8787,
      "bindings": {
        "OPENROUTER_API_KEY": {
          "value": "sk-or-your-actual-key-here"
        }
      }
    }
  },
  "profiles": {
    "default": {
      "accountId": "your-cloudflare-account-id",
      "apiToken": "your-cloudflare-api-token"
    }
  }
}
```

### 2. Test Locally

Start the local development server:
```bash
deno task worker:serve
```

Or use denoflare directly:
```bash
denoflare serve worker.ts --port 8787
```

Visit `http://localhost:8787` to see the API information.

### 3. Test the API Locally

**Get API Info:**
```bash
curl http://localhost:8787
```

**Translate Text:**
```bash
curl -X POST http://localhost:8787/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, world!\n\nThis is a test.",
    "apiKey": "sk-or-your-api-key-here"
  }'
```

## Manual Deployment

### 1. Verify Configuration

Make sure your `.denoflare` file has the correct credentials.

### 2. Deploy to Cloudflare

```bash
deno task worker:push
```

Or use denoflare directly:
```bash
denoflare push rosetta-translate
```

### 3. Verify Deployment

Your worker will be deployed to:
```
https://rosetta-translate.<your-subdomain>.workers.dev
```

Test it:
```bash
curl https://rosetta-translate.<your-subdomain>.workers.dev
```

### 4. Monitor Logs

Tail production logs in real-time:
```bash
deno task worker:tail
```

Or:
```bash
denoflare tail rosetta-translate
```

## Automated Deployment (GitHub Actions)

The repository includes a GitHub Actions workflow that automatically deploys to Cloudflare Workers when changes are pushed to the main branch.

### 1. Configure GitHub Secrets

Add these secrets to your GitHub repository:
- Go to Settings → Secrets and variables → Actions
- Add the following repository secrets:

| Secret Name | Value |
|------------|-------|
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API Token |
| `OPENROUTER_API_KEY` | Your OpenRouter API Key (optional) |

### 2. Trigger Deployment

The workflow automatically runs when:
- You push to the `main` branch
- You modify `worker.ts` or `.denoflare`
- You manually trigger it from the Actions tab

### 3. Monitor Deployment

- Go to the Actions tab in your GitHub repository
- Click on the latest "Deploy to Cloudflare Workers" workflow run
- Check the logs to see the deployment progress

## Testing the API

### API Endpoints

#### GET /
Returns API information and usage instructions.

**Example:**
```bash
curl https://rosetta-translate.<your-subdomain>.workers.dev
```

**Response:**
```json
{
  "service": "Rosetta Translate API",
  "version": "1.3.0",
  "description": "Translate large text files from English to German using AI",
  "endpoints": {
    "POST /translate": "Translate text"
  },
  "usage": {
    "method": "POST",
    "endpoint": "/translate",
    "body": {
      "text": "Text to translate (required)",
      "apiKey": "OpenRouter API key (optional if set in environment)"
    }
  }
}
```

#### POST /translate
Translates the provided text from English to German.

**Request Body:**
```json
{
  "text": "Your text to translate.\n\nIt can have multiple paragraphs.",
  "apiKey": "sk-or-your-api-key-here"
}
```

**Response:**
```json
{
  "translatedText": "Ihr zu übersetzender Text.\n\nEr kann mehrere Absätze haben.",
  "chunks": 2,
  "model": "anthropic/claude-3.5-sonnet"
}
```

**Error Response:**
```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

### Using curl

**Translate with API key in request:**
```bash
curl -X POST https://rosetta-translate.<your-subdomain>.workers.dev/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?\n\nI hope you are doing well.",
    "apiKey": "sk-or-your-api-key-here"
  }'
```

**Translate using environment variable (if configured):**
```bash
curl -X POST https://rosetta-translate.<your-subdomain>.workers.dev/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?\n\nI hope you are doing well."
  }'
```

### Using JavaScript/Fetch

```javascript
async function translateText(text, apiKey) {
  const response = await fetch('https://rosetta-translate.<your-subdomain>.workers.dev/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
      apiKey: apiKey,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Translation failed: ${error.error}`);
  }

  return await response.json();
}

// Usage
translateText('Hello, world!', 'sk-or-your-api-key-here')
  .then(result => console.log(result.translatedText))
  .catch(error => console.error(error));
```

## Troubleshooting

### Common Issues

#### 1. "API key not provided" Error

**Problem:** The worker cannot find the OpenRouter API key.

**Solution:**
- Ensure you're sending `apiKey` in the request body, OR
- Set `OPENROUTER_API_KEY` in the `.denoflare` configuration, OR
- Set it as an environment variable in the Cloudflare Workers dashboard

#### 2. "Cannot resolve host" during deployment

**Problem:** Network issues or incorrect Cloudflare credentials.

**Solution:**
- Verify your `accountId` and `apiToken` in `.denoflare`
- Check that your API token has the correct permissions ("Edit Cloudflare Workers")
- Try again after a few minutes

#### 3. "Module not found" errors

**Problem:** Worker cannot load dependencies.

**Solution:**
- Ensure all imports in `worker.ts` are accessible
- Check that you're using the correct Deno version (2.4.0 or higher)
- Try running `deno cache worker.ts` to pre-cache dependencies

#### 4. Worker crashes or times out

**Problem:** Translation takes too long or uses too much memory.

**Solution:**
- Cloudflare Workers have a 30-second CPU time limit
- Keep input text reasonably sized (under 10-20 paragraphs)
- Consider implementing pagination or batch processing for very large documents

#### 5. CORS errors in browser

**Problem:** Browser blocks requests due to CORS policy.

**Solution:**
- The worker already includes CORS headers for all origins (`*`)
- If you need to restrict origins, modify the `corsHeaders` in `worker.ts`

### Getting Help

If you encounter issues not covered here:

1. Check the [Denoflare documentation](https://denoflare.dev/)
2. Review [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)
3. Open an issue on the [GitHub repository](https://github.com/arvid-berndtsson/rosetta-translate/issues)

## Additional Resources

- [Deno Documentation](https://docs.deno.com/)
- [Denoflare GitHub](https://github.com/skymethod/denoflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [OpenRouter Documentation](https://openrouter.ai/docs)
