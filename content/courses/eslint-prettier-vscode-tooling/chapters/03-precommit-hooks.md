# Chapter 3: Pre-Commit Hooks with Husky & lint-staged

## Overview

You now have ESLint and Prettier. Next step: **make them impossible to forget**.

Git hooks let you run scripts at certain points in the Git lifecycle (like before a commit or push). We’ll use:

- **Husky** – to manage Git hooks from your Node project.
- **lint-staged** – to run ESLint/Prettier only on changed files.

Result:

- Every commit is auto-linted and auto-formatted.
- Fewer broken commits.
- Cleaner history.

---

## What Are Git Hooks?

Git stores hooks in `.git/hooks/`. Examples:

- `pre-commit` – runs before a commit is created.
- `pre-push` – runs before pushing.
- `commit-msg` – runs on the commit message.

We care about `pre-commit` for linting/formatting.

---

## Installing Husky & lint-staged

```bash
npm install --save-dev husky lint-staged
# or
pnpm add -D husky lint-staged
```

Initialize Husky:

```bash
npx husky init
```

This creates a `.husky/` folder and a default `pre-commit` hook script.

You can edit `.husky/pre-commit` to run `lint-staged`.

---

## Configure lint-staged

You want to run ESLint + Prettier **only on staged files** (not the whole repo).

In `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

Or in `lint-staged.config.js`:

```js
// lint-staged.config.js
export default {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,scss}': ['prettier --write']
};
```

---

## Husky `pre-commit` Hook

Edit `.husky/pre-commit`:

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

Make sure it’s executable (Husky usually handles this):

```bash
chmod +x .husky/pre-commit
```

Now your flow is:

1. `git add .`
2. `git commit -m "feat: something"`
3. Husky runs `npx lint-staged`.
4. `lint-staged` runs ESLint + Prettier on staged files.
5. If everything passes, the commit succeeds. If something fails, the commit is aborted.

---

## Example: All Pieces Together

`package.json` (relevant bits):

```json
{
  "scripts": {
    "lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\"",
    "lint:fix": "npm run lint -- --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,md,css,scss}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,md,css,scss}\""
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

`.husky/pre-commit`:

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

---

## Optional: `pre-push` for Tests

Add `.husky/pre-push`:

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

echo "Running tests before push..."
npm test
```

This ensures your tests pass before pushing to a remote.

---

## Performance Tips

- Use `lint-staged` so you only lint/format changed files.
- Keep pre-commit hooks fast (no full test suite or e2e).
- Use `pre-push` or CI for heavier checks (full tests, e2e).

---

## Q & A

### Q: Will this slow down my commits?

**A:** A bit, but with `lint-staged` it’s usually fast. You save much more time by catching issues early.

### Q: Can someone bypass the hooks?

**A:** Yes, with `HUSKY=0 git commit`, but CI should still run `lint` / `format:check` / tests so bad code doesn’t reach main.

### Q: Do I need both ESLint and Prettier in `lint-staged`?

**A:** It’s common to have both. At minimum, run Prettier. But having ESLint catch logic issues before they hit the repo is very nice.

---

**Next:** [Chapter 4: VS Code & Extensions – Glueing It All Together](./04-vscode-and-extensions.md)
