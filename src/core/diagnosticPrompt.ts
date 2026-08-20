/**
 * Pure logic for turning VS Code diagnostics on a line into an agent prompt —
 * the code-action counterpart to `buildSelectionPrompt` in `commands/index.ts`,
 * kept `vscode`-free (per the `core/` convention) so it is directly testable.
 */
import * as path from "node:path";

export type DiagnosticSeverityName = "error" | "warning" | "information" | "hint";

/** A `vscode.Diagnostic` reduced to the plain fields the prompt needs. */
export interface DiagnosticSummary {
  message: string;
  severity: DiagnosticSeverityName;
  source?: string;
  code?: string;
}

const SEVERITY_LABEL: Record<DiagnosticSeverityName, string> = {
  error: "Error",
  warning: "Warning",
  information: "Info",
  hint: "Hint"
};

/**
 * Builds a prompt asking the agent to fix the diagnostic(s) reported on one
 * line, in the same fenced-code-with-file-context style as the selection
 * prompt ("Ask About Selection").
 */
export function buildDiagnosticPrompt(
  relPath: string,
  languageId: string,
  lineText: string,
  line: number,
  diagnostics: DiagnosticSummary[]
): string {
  const list = diagnostics.map((d) => `- ${describe(d)}`).join("\n");
  const plural = diagnostics.length > 1 ? "s" : "";
  return (
    `Fix the following problem${plural} in \`${path.basename(relPath)}\` (line ${line}):\n\n` +
    `${list}\n\n\`\`\`${languageId}\n${lineText}\n\`\`\``
  );
}

function describe(d: DiagnosticSummary): string {
  const tag = d.source ? ` (${d.source}${d.code ? ` ${d.code}` : ""})` : "";
  return `${SEVERITY_LABEL[d.severity]}${tag}: ${d.message}`;
}
