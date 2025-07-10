# Rosetta Translate 📜

[![Deno](https://img.shields.io/badge/deno-^2.40-black?logo=deno)](https://deno.land)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A powerful, flexible, and cost-effective command-line tool for translating large text files using your favorite AI models via [OpenRouter](https://openrouter.ai).

Rosetta Translate is designed to handle long documents, like meeting transcripts or reports, that exceed the context window of most AI models. It intelligently splits the text into logical chunks, translates each one, and seamlessly reconstructs the document in the target language.

## ✨ Key Features

*   **📚 Translate Large Files**: Overcomes AI model context limits by translating documents paragraph by paragraph.
*   **💸 Cost-Effective & Flexible**: Leverages [OpenRouter](https://openrouter.ai) to let you choose from a wide variety of models.
*   **🏗️ Preserves Structure**: Retains original paragraph breaks, speaker labels, and overall document flow.
*   **📦 Single Executable**: Can be compiled into a single, dependency-free executable for Windows, macOS, or Linux.

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

📄 License
This project is licensed under the [MIT License](LICENSE).
