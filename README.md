# Rosetta Translate 📜

[![Deno](https://img.shields.io/badge/deno-^2.40-black?logo=deno)](https://deno.land)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful, flexible, and cost-effective translation tool available as both a **web application** and **command-line tool** for translating large text files using your favorite AI models via [OpenRouter](https://openrouter.ai) or [OpenAI](https://openai.com).

Rosetta Translate is designed to handle long documents, like meeting transcripts or reports, that exceed the context window of most AI models. It intelligently splits the text into logical chunks, translates each one, and seamlessly reconstructs the document in the target language.

![Rosetta Translate Web App](https://github.com/user-attachments/assets/3e8b4974-1ba2-4154-b187-be60c0a6dd6e)

## ✨ Key Features

*   **🌐 Web Application**: Easy-to-use web interface with a beautiful design inspired by Deno
*   **🔑 Bring Your Own Key**: Use your own API keys from OpenRouter or OpenAI - your keys are never stored
*   **🎯 Multiple Providers**: Choose between OpenRouter (access to many models) or OpenAI (direct API)
*   **📚 Translate Large Files**: Overcomes AI model context limits by translating documents paragraph by paragraph
*   **💸 Cost-Effective & Flexible**: Choose from a wide variety of models including Claude, GPT-4, Gemini, and more
*   **🏗️ Preserves Structure**: Retains original paragraph breaks, speaker labels, and overall document flow
*   **📦 CLI Available**: Also available as a command-line tool and single executable for automation

## 🚀 Getting Started

### Prerequisites

1.  **Deno**: You need the Deno runtime installed. You can install it from [deno.land](https://deno.land).
2.  **API Key**: Get an API key from [OpenRouter.ai](https://openrouter.ai) or [OpenAI](https://platform.openai.com).

## 🌐 Web Application

### Running the Web App

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arvid-berndtsson/rosetta-translate.git
    cd rosetta-translate
    ```

2.  **Start the web server:**
    ```bash
    deno task webapp
    ```
    Or with auto-reload during development:
    ```bash
    deno task webapp:dev
    ```

3.  **Open your browser** and navigate to `http://localhost:8000`

4.  **Enter your settings:**
    - Paste your API key (OpenRouter or OpenAI)
    - Select your provider (OpenRouter or OpenAI)
    - Choose your model
    - Select source and target languages
    - Enter text and click "Translate"

### Features
- ✨ Beautiful, modern UI inspired by Deno's website with orange accents
- 🔒 Secure: Your API key is never stored or logged
- 🎨 Responsive design works on desktop and mobile
- 🚀 Real-time translation with progress feedback
- 🌍 Support for 11+ languages

## ⚙️ Command-Line Usage

### 1. Basic Usage with Deno

```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input <source-file.txt> \
  --output <translated-file.txt> \
  --api-key <API-KEY>
```

### 2. With Custom Options

```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input transcript_en.txt \
  --output transcript_de.txt \
  --api-key sk-or-your-key \
  --provider openrouter \
  --model anthropic/claude-3.5-sonnet \
  --source-lang English \
  --target-lang German
```

### 3. Using Environment Variables

Create a `.env` file:
```
OPENROUTER_API_KEY="sk-or-your-secret-key-here"
# or
OPENAI_API_KEY="sk-your-openai-key-here"
```

Then run:
```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input transcript_en.txt \
  --output transcript_de.txt
```

### 4. Running Pre-built Binaries

Download the latest release for your platform from the [Releases page](https://github.com/arvid-berndtsson/rosetta-translate/releases):

#### On Windows:
```bash
rosetta-translate-windows.exe --input transcript_en.txt --output transcript_de.txt --api-key YOUR_KEY
```

#### On macOS ARM:
```bash
./rosetta-translate-macos-arm --input transcript_en.txt --output transcript_de.txt --api-key YOUR_KEY
```

#### On macOS Intel:
```bash
./rosetta-translate-macos-intel --input transcript_en.txt --output transcript_de.txt --api-key YOUR_KEY
```

#### On Linux:
```bash
./rosetta-translate-linux --input transcript_en.txt --output transcript_de.txt --api-key YOUR_KEY
```

### 📦 Compiling to an Executable

Create a self-contained executable:

#### For Windows:
```bash
deno compile --allow-net --allow-read --allow-write --allow-env \
  --output rosetta-translate.exe --target x86_64-pc-windows-msvc main.ts
```

#### For macOS or Linux:
```bash
deno compile --allow-net --allow-read --allow-write --allow-env \
  --output rosetta-translate main.ts
```

## 🎯 Supported Models

### OpenRouter
- Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo
- Google Gemini Pro
- Meta Llama 3.1 70B
- And many more!

### OpenAI Direct
- GPT-4 Turbo, GPT-4, GPT-3.5 Turbo

## 📁 Project Structure

```
rosetta-translate/
├── main.ts           # CLI entry point
├── webapp.ts         # Web server entry point
├── lib/
│   └── translator.ts # Shared translation logic
├── public/
│   └── index.html    # Web UI
├── deno.json         # Deno configuration and tasks
└── README.md         # This file
```

## ☁️ Deploy to Cloudflare Workers

Rosetta Translate can also be deployed as a web API to Cloudflare Workers, providing a serverless edge translation service.

### Prerequisites

1. **Deno**: Install Deno from [deno.land](https://deno.land)
2. **Denoflare**: Install the Denoflare CLI tool
   ```bash
   deno install --unstable-worker-options --allow-read --allow-net --allow-import --global --allow-env --allow-run --name denoflare --force https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts
   ```
3. **Cloudflare Account**: Create a free account at [cloudflare.com](https://cloudflare.com)
4. **OpenRouter API Key**: Get your API key from [OpenRouter.ai](https://openrouter.ai)

### Testing the Deployment Setup (Dry Run)

Before deploying, you can test that everything is configured correctly:

```bash
./test-deployment-dry-run.sh
```

This script validates:
- Deno installation
- Denoflare installation with the `--allow-import` flag
- Worker TypeScript syntax
- Configuration file structure
- GitHub Actions workflow setup
- Documentation consistency

### Setup

1. **Configure Denoflare**
   
   Copy the example configuration file:
   ```bash
   cp .denoflare.example .denoflare
   ```
   
   Edit `.denoflare` and add your credentials:
   - `accountId`: Your Cloudflare Account ID (found in Workers dashboard)
   - `apiToken`: Your Cloudflare API token (create one with "Edit Cloudflare Workers" template)
   - `OPENROUTER_API_KEY`: Your OpenRouter API key (optional, can be sent in API requests)

2. **Test Locally**
   
   Run the worker locally to test:
   ```bash
   deno task worker:serve
   # Or: denoflare serve worker.ts --port 8787
   ```
   
   Visit `http://localhost:8787` to see the API information.

3. **Deploy to Cloudflare**
   
   Push your worker to Cloudflare:
   ```bash
   deno task worker:push
   # Or: denoflare push rosetta-translate
   ```
   
   Your worker will be deployed and accessible at `https://rosetta-translate.<your-subdomain>.workers.dev`

4. **Monitor Logs**
   
   Tail production logs in real-time:
   ```bash
   deno task worker:tail
   # Or: denoflare tail rosetta-translate
   ```

### API Usage

Once deployed, you can use the API:

**Quick Test (using the test script):**
```bash
# Test locally
./test-worker.sh

# Test production
./test-worker.sh https://rosetta-translate.<your-subdomain>.workers.dev sk-or-your-api-key
```

**Get API Information:**
```bash
curl https://rosetta-translate.<your-subdomain>.workers.dev
```

**Translate Text:**
```bash
curl -X POST https://rosetta-translate.<your-subdomain>.workers.dev/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test.\n\nThis is another paragraph.",
    "apiKey": "sk-or-your-api-key-here"
  }'
```

**Response:**
```json
{
  "translatedText": "Hallo, das ist ein Test.\n\nDas ist ein weiterer Absatz.",
  "chunks": 2,
  "model": "anthropic/claude-3.5-sonnet"
}
```

### Environment Variables

For production deployments, it's recommended to set the `OPENROUTER_API_KEY` as an environment variable in the Cloudflare Workers dashboard instead of sending it with each request.

📄 License
This project is licensed under the [MIT License](LICENSE).
