import type { AuditIssue } from "../src/lib/audit";

const color = { error: "\x1b[31m", warning: "\x1b[33m", info: "\x1b[36m", reset: "\x1b[0m", dim: "\x1b[2m" };

export function printIssues(issues: AuditIssue[], showInfo = false) {
  const byScope = new Map<string, AuditIssue[]>();
  for (const i of issues) {
    if (i.level === "info" && !showInfo) continue;
    byScope.set(i.scope, [...(byScope.get(i.scope) ?? []), i]);
  }
  for (const [scope, list] of [...byScope].sort()) {
    console.log(`\n${scope}`);
    for (const i of list) console.log(`  ${color[i.level]}${i.level.padEnd(7)}${color.reset} ${i.code.padEnd(26)} ${color.dim}${i.message}${color.reset}`);
  }
}
