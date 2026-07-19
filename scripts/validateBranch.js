/**
 * -----------------------------------------------------------------------------
 * Branch Name Validation
 * -----------------------------------------------------------------------------
 *
 * This script validates Git branch names before allowing a push.
 *
 * Permanent branches (always allowed):
 *
 *   ✔ main
 *   ✔ master
 *   ✔ dev
 *   ✔ develop
 *   ✔ staging
 *   ✔ uat
 *
 * -----------------------------------------------------------------------------
 * Recommended Feature Branch Format
 * -----------------------------------------------------------------------------
 *
 * With Ticket (Preferred)
 *
 *   <type>/<ticket-id>-<description>
 *
 * Examples
 *
 *   ✔ feat/PROJ-123-user-login
 *   ✔ fix/PROJ-456-checkout-crash
 *   ✔ refactor/PROJ-789-payment-service
 *   ✔ docs/PROJ-999-api-documentation
 *
 * Without Ticket (Also Allowed)
 *
 *   <type>/<description>
 *
 * Examples
 *
 *   ✔ feat/user-login
 *   ✔ fix/payment-timeout
 *   ✔ docs/docker-setup
 *   ✔ chore/update-eslint
 *
 * -----------------------------------------------------------------------------
 * Notes
 * -----------------------------------------------------------------------------
 *
 * • Ticket ID is OPTIONAL but highly recommended whenever working on
 *   a tracked Jira/Azure DevOps task.
 *
 * • Use lowercase for the description.
 *
 * • Separate words using hyphens (-).
 *
 * • Do not use spaces or underscores.
 *
 * -----------------------------------------------------------------------------
 */

const { execSync } = require("child_process");

const branchName = execSync("git rev-parse --abbrev-ref HEAD")
  .toString()
  .trim();

/**
 * Permanent branches
 */
const permanentBranches = [
  "main",
  "master",
  "dev",
  "develop",
  "staging",
  "uat",
];

/**
 * Allowed branch prefixes
 */
const allowedTypes = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "chore",
  "ci",
  "hotfix",
  "release",
];

if (permanentBranches.includes(branchName)) {
  console.log(`✅ Branch "${branchName}" is valid.`);
  process.exit(0);
}

const parts = branchName.split("/");

if (parts.length !== 2) {
  printError();
}

const [type, branch] = parts;

if (!allowedTypes.includes(type)) {
  printError();
}

/**
 * Supported formats
 *
 * feat/user-login
 *
 * feat/PROJ-123-user-login
 */

const branchPattern = /^([A-Z]+-\d+-)?[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!branchPattern.test(branch)) {
  printError();
}

console.log(`✅ Branch "${branchName}" is valid.`);

function printError() {
  console.error(`
❌ Invalid Branch Name

Current Branch

  ${branchName}

──────────────────────────────────────────────

Permanent Branches

  main
  master
  dev
  develop
  staging
  uat

──────────────────────────────────────────────

Recommended Branch Format

  <type>/<ticket-id>-<description>

Examples

  feat/PROJ-123-user-login
  fix/PROJ-456-checkout-crash
  refactor/PROJ-789-payment-service
  docs/PROJ-100-api-documentation

──────────────────────────────────────────────

Without Ticket (Also Allowed)

  <type>/<description>

Examples

  feat/user-login
  fix/payment-timeout
  docs/docker-setup
  chore/update-eslint

──────────────────────────────────────────────

Allowed Types

  feat
  fix
  docs
  style
  refactor
  perf
  test
  chore
  ci
  hotfix
  release

──────────────────────────────────────────────

Rules

• Ticket ID is optional but recommended.
• Description must be lowercase.
• Use hyphens (-) between words.
• Do not use spaces.
• Do not use underscores.

`);
  process.exit(1);
}
