# Chapter 1: ESLint – Keeping Your Code Clean

## Overview

ESLint is a **linting tool** for JavaScript and TypeScript. It analyzes your code and reports problems:

- Syntax issues
- Bug-prone patterns
- Style violations (if you want)
- Best-practice rules

Think of ESLint as an automated code reviewer that runs **every time you save, run a script, or commit**.

---

## The Simple Explanation

**Without ESLint**

- You write code.
- You maybe run it.
- Bugs show up in the browser or in production.

**With ESLint**

- You write code.
- ESLint immediately tells you:
  - “This variable is unused.”
  - “You might have a bug here.”
  - “You forgot `===`.”

---

## Installing ESLint

Assuming you already have a Node project (npm or pnpm initialized):

```bash
# Using npm
npm install --save-dev eslint

# Using pnpm
pnpm add -D eslint
```

Initialize ESLint:

```bash
npx eslint --init
```

You’ll be asked things like:

- How you want to use ESLint (JS, TS, framework, etc.)
- Where your code runs (Browser / Node / Both)
- Module type (ESM or CommonJS)
- Style guide (e.g. Airbnb) or your own rules
- Whether to use TypeScript
- Whether to install extra dependencies now

This generates an ESLint config file, usually:

- `.eslintrc.cjs` or
- `.eslintrc.js` or
- `.eslintrc.json`

---

## Basic ESLint Configuration (JavaScript)

Example `.eslintrc.json`:

```json
{
  "root": true,
  "env": {
    "browser": true,
    "node": true,
    "es2023": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "eqeqeq": ["error", "always"]
  }
}
```

Key pieces:

- `env` – where your code runs (browser, node, etc.)
- `extends` – base configs you inherit from
- `rules` – overrides for specific rules

---

## ESLint with TypeScript

For TypeScript support:

```bash
npm install --save-dev   typescript   @typescript-eslint/parser   @typescript-eslint/eslint-plugin
```

Config example:

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ]
  }
}
```

---

## Running ESLint

Add scripts to `package.json`:

```json
{
  "scripts": {
    "lint": "eslint \"src/**/*.{js,jsx,ts,tsx}\"",
    "lint:fix": "npm run lint -- --fix"
  }
}
```

Run:

```bash
npm run lint
npm run lint:fix
```

- `lint` – reports problems
- `lint:fix` – auto-fixes what ESLint can fix

---

## Ignoring Files

Create `.eslintignore` to avoid linting generated files:

```txt
node_modules
dist
build
coverage
*.config.js
```

---

## ESLint vs Prettier (High Level)

- **ESLint**: code quality and potential bugs
- **Prettier**: code formatting (spaces, quotes, line length, etc.)

You *can* let ESLint do formatting, but it’s far more common to let:

- ESLint handle **logic and best practices**
- Prettier handle **formatting**

We’ll wire them together in the next chapter.

---

## Q & A

### Q: Do I need ESLint if I use TypeScript?

**A:** Yes. TypeScript focuses on types; ESLint focuses on patterns, best practices, and style. They work together.

### Q: Is ESLint only useful for big teams?

**A:** No. Even solo devs benefit from catching bugs early and having consistent rules.

### Q: Does ESLint slow development down?

**A:** If integrated into your editor (and with auto-fix on save), it usually speeds you up by catching problems immediately.

---

**Next:** [Chapter 2: Prettier – Automatic Code Formatting](./02-prettier.md)
