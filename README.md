# Rosetta Translate 📜

[![Deno](https://img.shields.io/badge/deno-^2.40-black?logo=deno)](https://deno.land)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful, flexible, and cost-effective tool for translating large text files using your favorite AI models via [OpenRouter](https://openrouter.ai).

Rosetta Translate is designed to handle long documents, like meeting transcripts or reports, that exceed the context window of most AI models. It intelligently splits the text into logical chunks, translates each one, and seamlessly reconstructs the document in the target language.

Available as both a **command-line tool** and a **web API** (deployable to Cloudflare Workers).

## ✨ Key Features

*   **📚 Translate Large Files**: Overcomes AI model context limits by translating documents paragraph by paragraph.
*   **💸 Cost-Effective & Flexible**: Leverages [OpenRouter](https://openrouter.ai) to let you choose from a wide variety of models.
*   **🏗️ Preserves Structure**: Retains original paragraph breaks, speaker labels, and overall document flow.
*   **📦 Single Executable**: Can be compiled into a single, dependency-free executable for Windows, macOS, or Linux.
*   **☁️ Cloud Deployment**: Deploy as a web API to Cloudflare Workers for serverless edge translation.

## 🚀 Getting Started

### Prerequisites

1.  **Deno**: You need the Deno runtime installed. You can install it from [deno.land](https://deno.land).
2.  **OpenRouter API Key**: Sign up at [OpenRouter.ai](https://openrouter.ai) and create an API key.

### Installation & Setup

#### Option 1: Download Pre-built Binaries (Recommended)
Download the latest release for your platform from the [Releases page](https://github.com/arvid-berndtsson/rosetta-translate/releases). The latest version includes binaries for:
- **Windows**: `rosetta-translate-windows.exe`
- **macOS ARM**: `rosetta-translate-macos-arm`
- **macOS Intel**: `rosetta-translate-macos-intel`
- **Linux**: `rosetta-translate-linux`

#### Option 2: Build from Source
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arvid-berndtsson/rosetta-translate.git
    cd rosetta-translate
    ```

2.  **Create a `.env` file** and add your OpenRouter API key:
    ```
    OPENROUTER_API_KEY="sk-or-your-secret-key-here"
    ```

## ⚙️ Usage

### 1. Running with Deno

```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts --input <source-file.txt> --output <translated-file.txt> --api-key <API-KEY>
```

### 2. Running the Compiled Executable

#### On Windows:
```bash
rosetta-translate-windows.exe --input transcript_en.txt --output transcript_de.txt
```
#### On macOS ARM:
```bash
./rosetta-translate-macos-arm --input transcript_en.txt --output transcript_de.txt
```
#### On macOS Intel:
```bash
./rosetta-translate-macos-intel --input transcript_en.txt --output transcript_de.txt
```
#### On Linux:
```bash
./rosetta-translate-linux --input transcript_en.txt --output transcript_de.txt
```
### 📦 Compiling to an Executable
Create a self-contained executable with the following command.
#### For Windows:
```bash
deno compile --allow-net=openrouter.ai --allow-read --allow-write --allow-env --output rosetta-translate.exe --target x86_64-pc-windows-msvc main.ts
```
#### For macOS or Linux:
```
deno compile --allow-net=openrouter.ai --allow-read --allow-write --allow-env --output rosetta-translate main.ts
```

## ☁️ Deploy to Cloudflare Workers

Rosetta Translate can also be deployed as a web API to Cloudflare Workers, providing a serverless edge translation service.

### Prerequisites

1. **Deno**: Install Deno from [deno.land](https://deno.land)
2. **Denoflare**: Install the Denoflare CLI tool
   ```bash
   deno install --unstable-worker-options --allow-read --allow-net --global --allow-env --allow-run --name denoflare --force https://raw.githubusercontent.com/skymethod/denoflare/v0.7.0/cli/cli.ts
   ```
3. **Cloudflare Account**: Create a free account at [cloudflare.com](https://cloudflare.com)
4. **OpenRouter API Key**: Get your API key from [OpenRouter.ai](https://openrouter.ai)

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
