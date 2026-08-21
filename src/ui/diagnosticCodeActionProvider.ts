/**
 * Offers a "Fix with Antigravity" quick fix for any diagnostic on the current
 * line — the code-action counterpart to the "Ask About Selection" command,
 * seeded from the problem instead of a manual question.
 */
import * as vscode from "vscode";

import { DiagnosticSummary } from "../core/diagnosticPrompt";

const SEVERITY_NAMES: Record<number, DiagnosticSummary["severity"]> = {
  [vscode.DiagnosticSeverity.Error]: "error",
  [vscode.DiagnosticSeverity.Warning]: "warning",
  [vscode.DiagnosticSeverity.Information]: "information",
  [vscode.DiagnosticSeverity.Hint]: "hint"
};

/** Reduces a `vscode.Diagnostic` to the plain fields `diagnosticPrompt` needs. */
export function toDiagnosticSummary(d: vscode.Diagnostic): DiagnosticSummary {
  const code =
    typeof d.code === "object" && d.code !== null
      ? String((d.code as { value: string | number }).value)
      : d.code !== undefined
        ? String(d.code)
        : undefined;
  return { message: d.message, severity: SEVERITY_NAMES[d.severity], source: d.source, code };
}

export class DiagnosticCodeActionProvider implements vscode.CodeActionProvider {
  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
  };

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    if (context.diagnostics.length === 0) {
      return [];
    }
    const line = range.start.line;
    const action = new vscode.CodeAction("Ask Antigravity to fix this", vscode.CodeActionKind.QuickFix);
    action.diagnostics = [...context.diagnostics];
    action.command = {
      command: "antigravity.askAboutDiagnostics",
      title: "Ask Antigravity to fix this",
      arguments: [document, line, context.diagnostics.map(toDiagnosticSummary)]
    };
    return [action];
  }
}
