import * as vscode from 'vscode';
import fetch from 'node-fetch';
import MarkdownIt from 'markdown-it';

// Reusable function to stream a response to a VS Code Webview
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
                // Ignore parsing errors from incomplete chunks
            }
        }
        panel.webview.postMessage({ command: 'complete' });

    } catch (err) {
        vscode.window.showErrorMessage('Error connecting to CodeCapsule server. Is Ollama running?');
        console.error(err);
    }
}

// This is the main function that runs when your extension is activated
export function activate(context: vscode.ExtensionContext) {

    // 1. Explain Code Command
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

    // 2. Find Bugs Command
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

    // 3. Refactor Code Command
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

    // 4. Generate Program Command
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

    // Add all command subscriptions to the context
    context.subscriptions.push(
        explainDisposable,
        findBugsDisposable,
        refactorDisposable,
        generateProgramDisposable
    );
}

// This function runs when your extension is deactivated
export function deactivate() { }

// This is a helper function to generate the HTML content for the webview
function getWebviewContent(initialContent: string): string {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CodeCapsule Response</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                padding: 1em;
            }
            code {
                background-color: rgba(0,0,0,0.2);
                padding: 0.2em 0.4em;
                border-radius: 3px;
                font-family: 'Courier New', Courier, monospace;
            }
            pre {
                background-color: rgba(0,0,0,0.2);
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