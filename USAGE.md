# Rosetta Translate Usage Guide

## Web Application

### Quick Start

1. **Start the server:**
   ```bash
   deno task webapp
   ```

2. **Open your browser** to `http://localhost:8000`

3. **Configure your translation:**
   - Enter your API key (OpenRouter or OpenAI)
   - Select your provider
   - Choose a model
   - Select source and target languages
   - Paste your text
   - Click "Translate"

### Supported Providers

#### OpenRouter
- API Key format: `sk-or-...`
- Sign up at: https://openrouter.ai
- Models available:
  - Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
  - GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo
  - Google Gemini Pro
  - Meta Llama 3.1 70B
  - And many more!

#### OpenAI
- API Key format: `sk-...`
- Sign up at: https://platform.openai.com
- Models available:
  - GPT-4 Turbo
  - GPT-4
  - GPT-3.5 Turbo

### Supported Languages

- English
- Spanish
- French
- German
- Italian
- Portuguese
- Chinese
- Japanese
- Korean
- Russian
- Arabic

## Command-Line Interface

### Basic Usage

```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input input.txt \
  --output output.txt \
  --api-key YOUR_API_KEY
```

### Advanced Options

```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input transcript_en.txt \
  --output transcript_es.txt \
  --api-key sk-or-your-key \
  --provider openrouter \
  --model anthropic/claude-3.5-sonnet \
  --source-lang English \
  --target-lang Spanish
```

### Using Environment Variables

Create a `.env` file:
```
OPENROUTER_API_KEY=sk-or-your-key-here
# or
OPENAI_API_KEY=sk-your-openai-key-here
```

Then run without `--api-key`:
```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input input.txt \
  --output output.txt
```

### CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input, -i` | Input text file path | Required |
| `--output, -o` | Output file path | Required |
| `--api-key` | API key (overrides .env) | From .env |
| `--provider` | Provider: openrouter or openai | openrouter |
| `--model` | Model identifier | anthropic/claude-3.5-sonnet |
| `--source-lang` | Source language | English |
| `--target-lang` | Target language | German |

## Examples

### Web App Example

1. Start the server:
   ```bash
   deno task webapp
   ```

2. Open http://localhost:8000

3. Enter:
   - API Key: `sk-or-your-key`
   - Provider: `OpenRouter`
   - Model: `Claude 3.5 Sonnet`
   - Source: `English`
   - Target: `Spanish`
   - Text: `Hello, how are you today?`

4. Result: `Hola, ¿cómo estás hoy?`

### CLI Example

Create `input.txt`:
```
Hello, world!

This is a test translation.

It preserves paragraph breaks.
```

Run translation:
```bash
deno run --allow-net --allow-read --allow-write --allow-env main.ts \
  --input input.txt \
  --output output.txt \
  --api-key sk-or-your-key \
  --target-lang Spanish
```

Result in `output.txt`:
```
¡Hola, mundo!

Esta es una traducción de prueba.

Preserva los saltos de párrafo.
```

## Tips & Best Practices

### Choosing a Model

- **For quality**: Use Claude 3.5 Sonnet or GPT-4
- **For speed**: Use Claude 3 Haiku or GPT-3.5 Turbo
- **For cost**: Check OpenRouter pricing at https://openrouter.ai/models

### Text Length

- The app automatically splits text by paragraphs
- Each paragraph is translated separately
- This allows translation of documents exceeding model context limits
- Best for: meeting transcripts, articles, reports

### API Key Security

- **Web App**: Keys are never stored or logged
- **CLI**: Use `.env` file instead of command-line arguments
- Add `.env` to `.gitignore` to prevent committing keys
- Never share or commit your API keys

### Performance

- Translation time depends on:
  - Text length (number of paragraphs)
  - Model speed
  - Network latency
- Expect 1-3 seconds per paragraph
- Progress is shown in real-time

## Troubleshooting

### "API key not found"
- Check your API key is correct
- Verify it starts with `sk-or-` (OpenRouter) or `sk-` (OpenAI)
- For CLI: Check your `.env` file or use `--api-key`

### "Translation failed"
- Verify your API key has credits
- Check your internet connection
- Try a different model
- Ensure text is not empty

### "Provider mismatch"
- OpenRouter models require OpenRouter API key
- OpenAI models require OpenAI API key
- Select matching provider and model

### Port already in use
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use a different port
# Edit webapp.ts: const PORT = 8001;
```

## Development

### Running Tests

```bash
deno test --allow-read --allow-env
```

### Watch Mode

```bash
deno task webapp:dev  # Web app with auto-reload
deno task dev         # CLI with auto-reload
```

### Building

Compile the CLI to a binary:
```bash
deno compile --allow-net --allow-read --allow-write --allow-env \
  --output rosetta-translate \
  main.ts
```

## Support

- Issues: https://github.com/arvid-berndtsson/rosetta-translate/issues
- Documentation: See README.md
- License: MIT
