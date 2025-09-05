"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
function activate(context) {
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
            const response = await (0, node_fetch_1.default)(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e2b-it:generateContent?key=${process.env.GEMMA_API_KEY}`, {
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
            });
            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const fixedCode = data.candidates[0].content.parts[0].text;
                editor.edit((editBuilder) => {
                    editBuilder.replace(selection, fixedCode);
                });
                vscode.window.showInformationMessage("Code fixed with Gemma 3n!");
            }
            else {
                vscode.window.showErrorMessage("Gemma API returned no result.");
                console.error(data);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage("Error contacting Gemma API: " + error.message);
        }
    });
    context.subscriptions.push(disposable);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map