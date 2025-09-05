import * as vscode from "vscode";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

dotenv.config();

export function activate(context: vscode.ExtensionContext) {
  console.log("AI Helper extension is now active!");

  let disposable = vscode.commands.registerCommand("ai-helper.fixCode", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage("No editor is active");
      return;
    }

    const selection = editor.selection;
    const code = editor.document.getText(selection);

    if (!code) {
      vscode.window.showErrorMessage("Please select some code to fix.");
      return;
    }

    vscode.window.showInformationMessage("Sending code to Gemma 3n...");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e2b-it:generateContent?key=${process.env.GEMMA_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `Fix the following code and improve readability:\n\n${code}` }],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const fixedCode = data.candidates[0].content.parts[0].text;

        editor.edit((editBuilder) => {
          editBuilder.replace(selection, fixedCode);
        });

        vscode.window.showInformationMessage("Code fixed with Gemma 3n!");
      } else {
        vscode.window.showErrorMessage("Gemma API returned no result.");
        console.error(data);
      }
    } catch (error: any) {
      vscode.window.showErrorMessage("Error contacting Gemma API: " + error.message);
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
