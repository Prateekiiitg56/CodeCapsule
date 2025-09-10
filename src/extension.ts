import * as vscode from 'vscode';
import fetch from 'node-fetch';
import MarkdownIt from 'markdown-it';

async function streamToWebview(prompt: string, panelTitle: string) {
    const panel = vscode.window.createWebviewPanel(
        'codeCapsuleResponse',
        panelTitle,
        vscode.ViewColumn.Beside,
        { enableScripts: true }
    );

    const md = new MarkdownIt();
    let fullResponse = "";
    panel.webview.html = getWebviewContent("<p>Thinking...</p>");

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "gpt-oss:20b",
                prompt: prompt,
                stream: true
            }),
        });

        for await (const chunk of response.body as any) {
            try {
                const jsonResponse = JSON.parse(chunk.toString());
                const content = jsonResponse.response;
                if (content) {
                    fullResponse += content;
                    const htmlContent = md.render(fullResponse);
                    panel.webview.postMessage({ command: 'update', html: htmlContent });
                }
            } catch (e) {
            }
        }
        panel.webview.postMessage({ command: 'complete' });

    } catch (err) {
        vscode.window.showErrorMessage('Error connecting to CodeCapsule server. Is Ollama running?');
        console.error(err);
    }
}

export function activate(context: vscode.ExtensionContext) {

    const explainDisposable = vscode.commands.registerCommand('codecapsule.explainCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            const selectedText = editor.document.getText(editor.selection);
            if (selectedText) {
                const prompt = `You are an expert programmer. Explain the following code snippet using Markdown:\n\n---\n\n${selectedText}`;
                await streamToWebview(prompt, 'Code Explanation');
            }
        }
    });

    const findBugsDisposable = vscode.commands.registerCommand('codecapsule.findBugs', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            const selectedText = editor.document.getText(editor.selection);
            if (selectedText) {
                const prompt = `You are a code analysis expert. Review the following code for bugs. Format findings as a Markdown list:\n\n---\n\n${selectedText}`;
                await streamToWebview(prompt, 'Bug Analysis');
            }
        }
    });

    const refactorDisposable = vscode.commands.registerCommand('codecapsule.refactorCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            const selectedText = editor.document.getText(editor.selection);
            if (selectedText) {
                const prompt = `You are an expert in writing clean code. Refactor the following snippet. Provide the refactored code in a Markdown code block, followed by an explanation:\n\n---\n\n${selectedText}`;
                await streamToWebview(prompt, 'Code Refactor');
            }
        }
    });

    const generateProgramDisposable = vscode.commands.registerCommand('codecapsule.generateProgram', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.selection) {
            const selectedText = editor.document.getText(editor.selection);
            if (selectedText) {
                const prompt = `You are an expert code generator. Based on the following request, generate a complete program. Start your response directly with the code in a Markdown code block:\n\n---\n\nRequest: "${selectedText}"`;
                await streamToWebview(prompt, 'Generated Program');
            }
        }
    });

    context.subscriptions.push(
        explainDisposable,
        findBugsDisposable,
        refactorDisposable,
        generateProgramDisposable
    );
}

export function deactivate() { }

function getWebviewContent(initialContent: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeCapsule Response</title>
        <style>
            body {
                /* Use VS Code's theme colors for a native feel */
                background-color: var(--vscode-sideBar-background);
                color: var(--vscode-foreground);
                font-family: var(--vscode-font-family);
                line-height: 1.6;
                padding: 1.5em;
            }
            .header {
                display: flex;
                align-items: center;
                padding-bottom: 1em;
                border-bottom: 1px solid var(--vscode-sideBar-border);
                margin-bottom: 1em;
            }
            .header-icon {
                font-size: 1.5em;
                margin-right: 0.5em;
            }
            .header-title {
                font-size: 1.2em;
                font-weight: 600;
            }
            code {
                background-color: var(--vscode-textCodeBlock-background);
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: var(--vscode-editor-font-family);
            }
            pre {
                background-color: var(--vscode-textCodeBlock-background);
                padding: 1em;
                border-radius: 5px;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .cursor {
                display: inline-block;
                width: 10px;
                height: 1.2em;
                background-color: var(--vscode-editor-foreground);
                animation: blink 1s step-end infinite;
            }
            @keyframes blink {
                50% { background-color: transparent; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <span class="header-icon">💊</span>
            <span class="header-title">CodeCapsule</span>
        </div>
        <div id="response">${initialContent}</div>
        <span id="cursor" class="cursor"></span>

        <script>
            const vscode = acquireVsCodeApi();
            const responseElement = document.getElementById('response');
            const cursorElement = document.getElementById('cursor');
            
            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'update':
                        responseElement.innerHTML = message.html;
                        break;
                    case 'complete':
                        cursorElement.style.display = 'none';
                        break;
                }
            });
        </script>
    </body>
    </html>`;
} 