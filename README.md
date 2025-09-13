# CodeCapsule 💊

**A private, offline AI coding assistant for Visual Studio Code, powered by local, open-weight models.**

![Status](https://img.shields.io/badge/status-in_development-green)
![License](https://img.shields.io/badge/license-MIT-blue)



## ## Table of Contents
1. [Core Idea & Motivation](#core-idea--motivation-)
2. [Features in Detail](#-features-in-detail)
3. [Technical Architecture](#-technical-architecture)
4. [File Structure](#-file-structure)
5. [Getting Started](#-getting-started)
6. [Usage](#-usage)

---
## ## Core Idea & Motivation 💡

The core idea behind CodeCapsule was born from a real-world problem faced by students and professionals alike: the need for powerful AI coding assistance without an internet connection.

In many situations, such as university exams where campus internet is disabled to prevent cheating, or in corporate environments with strict firewalls handling proprietary code, developers are cut off from cloud-based AI tools. This creates a significant disadvantage, hindering productivity and learning.

CodeCapsule was designed to solve this. It's built on the principle of **"AI-powered development without compromise."** It provides a suite of advanced coding features that run entirely on your local machine, ensuring:

* **100% Offline Capability:** It works perfectly on an airplane, during an exam, or on a secure network.
* **Absolute Privacy:** Your code is never sent to an external server. It is processed locally by the `gpt-oss` model running on your own hardware.
* **Openness:** It leverages the power of open-weight models, putting control back in the hands of the developer.

Essentially, CodeCapsule is a self-contained AI development assistant that brings the power of a large language model directly into the VS Code editor.

---
## ## ✨ Features in Detail

CodeCapsule offers four distinct, context-aware features accessible from the editor's right-click menu. All features provide their responses in a real-time streaming panel for an interactive experience.

#### ### Explain Code
* **Input:** A block of selected code that is confusing or unfamiliar.
* **Process:** The selected code is sent to the `gpt-oss` model with a prompt instructing it to act as an expert programmer and provide a clear, concise explanation formatted in Markdown.
* **Output:** A detailed, step-by-step explanation of the code's logic, purpose, and key components streams into a new side panel.

#### ### Find Bugs
* **Input:** A selected function or block of code.
* **Process:** The code is sent to the model with a prompt asking it to perform a static analysis, looking for potential bugs, logical errors, or unhandled edge cases.
* **Output:** A Markdown-formatted list of potential issues found in the code, complete with explanations of why they might be problematic.

#### ### Refactor Code
* **Input:** A piece of working but inefficient or poorly written code.
* **Process:** The code is sent to the model with instructions to act as an expert in clean code principles. The model is asked to rewrite the code for better readability, performance, and maintainability.
* **Output:** A response containing the refactored code inside a Markdown code block, followed by a brief list of the specific changes made and the reasoning behind them.

#### ### Generate Program from this
* **Input:** A selected line of text, typically a comment or function signature describing a desired program (e.g., `// a C program for quicksort`).
* **Process:** The selected text is sent to the model with a prompt instructing it to act as a code generator and produce a complete, runnable program.
* **Output:** The full source code for the requested program is streamed into the side panel, ready to be copied, saved, and compiled.

---
## ## 🛠️ Technical Architecture

The architecture is designed to be simple and robust, consisting of a frontend (the VS Code extension) and a backend (the local Ollama server).

* **Frontend (VS Code Extension):**
    * Written in **TypeScript**.
    * Uses the **VS Code Extension API** to create UI elements like context menus and Webview panels.
    * Handles user input, formats prompts, and displays the streamed response in a custom, styled Webview.

* **Backend (Local Server):**
    * **Ollama** serves as the backend, managing and running the AI model.
    * The model used is OpenAI's **`gpt-oss-20b`**.
    * The server runs on `localhost` and exposes a REST API endpoint (`/api/generate`).

* **Communication Workflow:**
    ```
    User Action (Right-click) -> VS Code Extension -> HTTP POST Request -> Ollama Server -> gpt-oss-20b Model -> Streamed Response -> Webview Panel
    ```

---
## ## 📂 File Structure

The project is organized as a standard VS Code extension.

```
/CodeCapsule
│
├── .vscode/
│   ├── launch.json       # Defines how to launch the extension for debugging (F5)
│
├── node_modules/         # Folder where all dependencies are installed
│
├── out/                  # The compiled JavaScript code (generated from TypeScript)
│
├── src/
│   └── extension.ts      # The heart of the project. All TypeScript source code is here.
│
├── .gitignore            # Specifies files for Git to ignore
├── package.json          # The project's manifest: defines commands, dependencies, etc.
├── package-lock.json     # Locks the specific versions of dependencies
└── tsconfig.json         # Configuration for the TypeScript compiler
```
---
## ## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### ### Prerequisites

Make sure you have the following installed on your system:
* [Node.js](https://nodejs.org/) (which includes npm)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Ollama](https://ollama.com/)

### ### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/prateekiiitg56/CodeCapsule.git](https://github.com/prateekiiitg56/CodeCapsule.git)
    cd CodeCapsule
    ```
2.  **Download the AI Model:**
    * Pull the `gpt-oss-20b` model using Ollama. This will take some time and disk space.
        ```sh
        ollama pull gpt-oss-20b
        ```
    * **Note:** If your primary drive is full, you must set the `OLLAMA_MODELS` environment variable to a different path before running the pull command.

3.  **Install Project Dependencies:**
    * This step may require you to close VS Code and run the command from an external terminal.
        ```sh
        npm install
        ```

4.  **Run the Extension:**
    * Open the project folder in VS Code.
    * Press **`F5`** to launch the Extension Development Host window. The extension will now be running in this new window.

---
## ## 📖 Usage

1.  **Start the Local Server:** Before testing, you must start the Ollama server manually in a PowerShell terminal.
    ```powershell
    # Replace the path with the location of your model files
    $env:OLLAMA_MODELS = "D:\Hackathons\ollama-models"
    ollama serve
    ```
    Keep this terminal running.

2.  **Use the Features:** In the Extension Development Host window (launched with F5), open any code file, select a piece of text (either code or a comment), and right-click on it. You will see the "CodeCapsule" options in the context menu.

