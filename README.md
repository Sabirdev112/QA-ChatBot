# 🤖 QA CO-PILOT: Senior Architect Assistant

QA Co-Pilot is a high-performance, AI-powered automation architect designed to streamline the creation and maintenance of enterprise-grade QA frameworks. It interfaces directly with your local machine and Ollama instances to transform requirements into executable Playwright code.

---

## ⚡ Core Engine Features

### 1. "Stealth" Project Scaffolding
- **🚀 One-Click Generation**: The `➕ Create` button triggers a sophisticated hidden prompt that instructs the AI to generate a complete Playwright framework structure.
- **🤫 Clean UI**: During scaffolding, the chat window shows a clean *"Generating framework... ⏳"* status while the AI code blocks are streamed invisibly in the background.
- **📂 Automatic Disk Writing**: Files are automatically created and populated in your `D:/projects/` directory using a custom Vite API proxy.

### 2. Intelligent Project Updates
- **🔄 Sync Logic**: The `🔄 Update` button reads your local `testcases.json` from disk and feeds it to the AI for analysis.
- **🧠 Delta Updates**: The AI identifies missing files or required logic updates and generates ONLY the code needed to synchronize your framework with new requirements.

### 3. Local File System Integration
- **Direct Access**: Leverages a robust Vite middleware to `read` and `write` files directly to your hard drive, bypassing browser sandbox limitations.
- **Path Awareness**: Enforces strict folder structures including `/tests/pages`, `/tests/e2e`, `/tests/api`, and `/tests/load-testing`.

---

## 🧠 AI & Conversation Management

### 4. Conversation Memory & History
- **💾 Local Persistence**: All chat sessions are saved to `localStorage`. Your workspace remains exactly as you left it after a browser reload.
- **📜 Navigation Panel**: A dedicated right-side sidebar allows you to name, switch between, and delete multiple project threads.
- **🏷️ Smart Naming**: Sessions automatically rename themselves based on the first requirement you provide.

### 5. Advanced Generation Control
- **🛑 Stop Button**: A pulsing red "Stop" button replaces the send button during generation, allowing you to instantly abort an incorrect or long response using `AbortSignal`.
- **🛠️ Automated Model Switching**: The assistant dynamically switches between models (e.g., CodeLlama for logic, DeepSeek for debugging) based on your intent.
- **🚫 Zero-Question Mode**: The system prompt is tuned for "Action First," assuming Playwright + TypeScript + POM defaults without asking clarifying questions.

---

## 🏗️ Technical Standards

### 6. "REEL-WAIT" Coding Pattern
Every generated Playwright Page Object Model (POM) follows strict "Wait-Before-Action" rules:
- Mandatory use of `await expect(locator).toBeVisible()` before interactions.
- Automatic inclusion of `toBeEnabled()` checks for buttons.
- Logic is split between reusable helpers (`tests/utils`) and feature-specific pages.

### 7. Multi-Protocol Testing
- **🌐 Web E2E**: Comprehensive Playwright POM and spec generation.
- **🔌 API Testing**: Dedicated prompt templates for Playwright API request scripts and case tables.
- **🚀 Load Testing**: Integrated **k6** templates featuring automatic login logic, refresh token handling, and robust session retry mechanisms.

### 8. Clipboard Efficiency
- **📋 Excel-Ready Tables**: Tables in chat are automatically formatted as **TSV (Tab-Separated Values)** when copied, allowing for instant, clean pasting into Excel or Google Sheets.

---

## 🎨 UI & UX Design
- **💎 Glassmorphism**: A premium, modern interface with vibrant gradients and subtle micro-animations.
- **📑 Markdown Architecture**: Full support for GFM tables, syntax highlighting for 10+ languages, and readable typography.
- **🎯 Quick Actions**: Sidebar shortcuts for common QA tasks like "Generate Edge Cases", "API Scripts", and "Load Testing".

---

## 🚀 Setup & Requirements
1. **Ollama**: Must be running at `http://localhost:11434`.
2. **Models**: Recommended models are `llama3`, `codellama`, and `deepseek-coder`.
3. **Environment**: Ensure your drive has a `D:/projects` directory for file output.
