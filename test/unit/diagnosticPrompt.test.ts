import * as assert from "node:assert";

import { buildDiagnosticPrompt, DiagnosticSummary } from "../../src/core/diagnosticPrompt";

function diag(overrides: Partial<DiagnosticSummary> = {}): DiagnosticSummary {
  return { message: "Unexpected any. Specify a different type.", severity: "error", ...overrides };
}

describe("diagnosticPrompt.buildDiagnosticPrompt", () => {
  it("names the file (basename only) and 1-based line", () => {
    const prompt = buildDiagnosticPrompt("src/core/foo.ts", "typescript", "let x: any;", 12, [diag()]);
    assert.ok(prompt.includes("`foo.ts`"));
    assert.ok(prompt.includes("line 12"));
    assert.ok(!prompt.includes("src/core/"));
  });

  it("fences the line text with the document's language id", () => {
    const prompt = buildDiagnosticPrompt("a.py", "python", "x = 1/0", 1, [diag({ message: "division by zero" })]);
    assert.ok(prompt.includes("```python\nx = 1/0\n```"));
  });

  it("labels severity and includes source + code when present", () => {
    const prompt = buildDiagnosticPrompt("a.ts", "typescript", "x", 1, [
      diag({ severity: "warning", source: "eslint", code: "no-unused-vars" })
    ]);
    assert.ok(prompt.includes("Warning (eslint no-unused-vars): Unexpected any. Specify a different type."));
  });

  it("omits the source/code parenthetical when absent", () => {
    const prompt = buildDiagnosticPrompt("a.ts", "typescript", "x", 1, [diag({ source: undefined, code: undefined })]);
    assert.ok(prompt.includes("Error: Unexpected any."));
    assert.ok(!prompt.includes("()"));
  });

  it("says 'problem' (singular) for one diagnostic and 'problems' for several", () => {
    const one = buildDiagnosticPrompt("a.ts", "typescript", "x", 1, [diag()]);
    const two = buildDiagnosticPrompt("a.ts", "typescript", "x", 1, [diag(), diag({ severity: "warning" })]);
    assert.ok(one.includes("Fix the following problem in"));
    assert.ok(two.includes("Fix the following problems in"));
  });

  it("lists every diagnostic on the line, one bullet each", () => {
    const prompt = buildDiagnosticPrompt("a.ts", "typescript", "x", 1, [
      diag({ message: "first" }),
      diag({ severity: "hint", message: "second" })
    ]);
    assert.ok(prompt.includes("- Error: first"));
    assert.ok(prompt.includes("- Hint: second"));
  });
});
