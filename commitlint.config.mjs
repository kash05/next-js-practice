/**
 * Commitlint Configuration
 * -----------------------------------------------------------------------------
 * This project follows the Conventional Commits specification.
 *
 * Recommended Commit Format:
 *
 *   <type>(optional-scope): <subject>
 *
 * The scope is OPTIONAL but highly recommended.
 * It represents the module, feature, or area affected by your changes.
 *
 * Examples:
 * ✔ feat(user): add edit profile page
 * ✔ feat(auth): implement forgot password
 * ✔ fix(order): resolve duplicate invoice generation
 * ✔ refactor(payment): simplify payment validation
 * ✔ docs(readme): update installation guide
 * ✔ chore(deps): update eslint dependencies
 *
 * Common Scopes (Examples):
 * - user
 * - auth
 * - dashboard
 * - order
 * - payment
 * - invoice
 * - api
 * - ui
 * - docker
 * - ci
 * - config
 *
 * Invalid Examples:
 * ✘ Added new feature
 * ✘ Fixed Login Issue
 * ✘ FEAT: Add Login
 * ✘ feat: Add User Profile
 * ✘ feat(user):
 *
 * Guidelines:
 * - Use one of the allowed commit types.
 * - Prefer adding a scope to indicate the affected module.
 * - Keep the subject short, meaningful, and action-oriented.
 * - Write the subject in lowercase.
 * - Do not end the subject with a period.
 *
 * Why follow this convention?
 * - Makes Git history clean and easy to understand.
 * - Helps reviewers quickly identify the affected module.
 * - Enables automatic changelog generation.
 * - Supports semantic versioning and release automation.
 */

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  // Base rules from Conventional Commits
  extends: ["@commitlint/config-conventional"],

  rules: {
    /**
     * Allowed commit types.
     *
     * Format:
     *   <type>(optional-scope): <subject>
     *
     * Examples:
     * ✔ feat(user): add profile picture upload
     * ✔ fix(auth): resolve jwt validation issue
     *
     * Available Types:
     * feat      -> Introduces a new feature
     * fix       -> Fixes a bug
     * docs      -> Documentation changes only
     * style     -> Formatting, whitespace, linting (no logic changes)
     * refactor  -> Improves code without changing functionality
     * perf      -> Performance improvements
     * test      -> Adds or updates tests
     * chore     -> Maintenance tasks (dependencies, configs, tooling)
     * revert    -> Reverts a previous commit
     * ci        -> CI/CD pipeline or workflow changes
     */
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "revert",
        "ci",
      ],
    ],

    /**
     * Commit subject must be lowercase.
     *
     * ✔ feat(user): add edit profile page
     * ✔ fix(order): resolve duplicate invoice generation
     * ✔ docs(api): update swagger documentation
     *
     * ✘ feat(user): Add Edit Profile Page
     * ✘ fix(order): Resolve Duplicate Invoice
     *
     * Recommended:
     * - Start with an action verb (add, update, remove, fix, refactor, optimize...)
     * - Keep it concise and descriptive.
     */
    "subject-case": [2, "always", "lower-case"],

    /**
     * Keep commit messages concise.
     *
     * Maximum allowed subject length: 100 characters.
     */
    "subject-max-length": [2, "always", 100],

    /**
     * Prevent empty commit subjects.
     *
     * ✔ feat(user): add profile page
     * ✘ feat(user):
     */
    "subject-empty": [2, "never"],
  },
};

export default config;
