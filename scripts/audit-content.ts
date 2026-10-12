/**
 * Editorial quality gate.
 *   npm run audit:content              errors fail; warnings reported
 *   npm run audit:content -- --launch  also require recorded human approval
 *   npm run audit:content -- --info    include draft/info items
 *   npm run audit:content -- --json    machine-readable output
 */
import "./_env";
import { runFullAudit, summarize } from "../src/lib/audit";
import { printIssues } from "./_print";

const args = new Set(process.argv.slice(2));
const issues = runFullAudit({ launch: args.has("--launch") });
const s = summarize(issues);

if (args.has("--json")) {
  console.log(JSON.stringify({ summary: s, issues }, null, 2));
} else {
  printIssues(issues, args.has("--info"));
  console.log(`\n${s.errors} error(s), ${s.warnings} warning(s), ${s.info} info`);
}
process.exit(s.errors > 0 ? 1 : 0);
