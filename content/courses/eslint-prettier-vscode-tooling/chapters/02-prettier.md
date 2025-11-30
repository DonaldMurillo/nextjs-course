# Chapter 2: Prettier – Automatic Code Formatting

## Overview

Prettier is an **opinionated code formatter**. You give it messy code; it gives you consistently formatted code.

Prettier handles:

- Indentation
- Quotes (single vs double)
- Semicolons
- Trailing commas
- Line length and wrapping
- And more

The idea: **stop arguing about style** and let a tool decide.

---

## Why Prettier?

### Without Prettier

- Every dev uses their own style.
- PRs have huge diffs with spacing/indent changes.
- Reviews waste time on “use double quotes please”.

### With Prettier

- One consistent style.
- Minimal diffs.
- Reviews focus on logic, not whitespace.

---

## Installing Prettier

```bash
# npm
npm install --save-dev prettier

# pnpm
pnpm add -D prettier
```

Create `.prettierrc`:

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Create `.prettierignore`:

```txt
node_modules
dist
build
coverage
package-lock.json
pnpm-lock.yaml
```

---

## Running Prettier

Add scripts to `package.json`:

```json
{
  "scripts": {
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,md,css,scss}\"",
    "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,md,css,scss}\""
  }
}
```

Use them:

```bash
npm run format        # rewrites files with Prettier's formatting
npm run format:check  # exits non-zero if any files need formatting
```

---

## ESLint + Prettier: Who Does What?

Goal:

- **ESLint** → logical issues, patterns, best practices
- **Prettier** → formatting

To avoid conflicts, we:

1. Disable ESLint’s formatting rules.
2. Let Prettier decide all formatting.
3. Optionally surface Prettier issues via ESLint.

Install helpers:

```bash
npm install --save-dev   eslint-config-prettier   eslint-plugin-prettier
```

Update `.eslintrc`:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ]
}
```

What `plugin:prettier/recommended` does:

- Adds `eslint-config-prettier` (turns off conflicting rules).
- Adds the `prettier/prettier` rule to report format issues as ESLint errors.

---

## Example Combined Setup

`.eslintrc.json`:

```json
{
  "root": true,
  "env": {
    "browser": true,
    "node": true,
    "es2023": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint",
    "prettier"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "rules": {
    "prettier/prettier": [
      "error",
      {
        "singleQuote": true,
        "semi": true,
        "trailingComma": "all",
        "printWidth": 100
      }
    ]
  }
}
```

Now:

- Prettier formatting problems show up as ESLint errors.
- Running `npm run lint` will fail if formatting is wrong.

---

## Where to Put Prettier Options

Two common patterns:

1. **Dedicated `.prettierrc` file**  
   - Simple, obvious.
   - Used by editor, CLI, and other tools directly.

2. **Inline options in ESLint (`prettier/prettier` rule)**  
   - Single place for options (ESLint).
   - Only works when tools use ESLint (e.g., editor integration).

Pick one approach and stick with it. Using both is fine as long as they match.

---

## Q & A

### Q: Can Prettier replace ESLint?

**A:** No. Prettier doesn’t care about bugs or best practices. It only formats code.

### Q: What if I don’t like Prettier’s style?

**A:** You can tweak a few settings (quotes, semi, print width), but it’s intentionally limited. That’s the trade-off for consistency.

### Q: Should I run Prettier before or after ESLint?

**A:** Common flow is:

1. Run Prettier (format).
2. Run ESLint (logic + format check if using `prettier/prettier` rule).

---

**Next:** [Chapter 3: Pre-Commit Hooks with Husky & lint-staged](./03-precommit-hooks.md)
