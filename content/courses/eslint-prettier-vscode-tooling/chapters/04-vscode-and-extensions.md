# Chapter 4: VS Code & Extensions – Glueing It All Together

## Overview

You now have:

- **ESLint** – for code quality and best practices.
- **Prettier** – for formatting.
- **Husky + lint-staged** – to enforce everything on commit.

Final step: wire your **editor** (VS Code) into this workflow so:

- Problems show up as you type.
- Code formats automatically on save.
- ESLint and Prettier stay in sync with your project settings.

---

## Recommended VS Code Extensions

Install these from the VS Code Marketplace:

1. **ESLint**  
   ID: `dbaeumer.vscode-eslint`  
   - Shows ESLint errors/warnings inline.
   - Can auto-fix problems on save.

2. **Prettier – Code Formatter**  
   ID: `esbenp.prettier-vscode`  
   - Formats code using Prettier.
   - Integrates with `Format Document` / `Format on Save`.

3. (Optional) **EditorConfig for VS Code**  
   ID: `EditorConfig.EditorConfig`  
   - Honors `.editorconfig` files if you use them.

---

## Global VS Code Settings

Open **Settings (JSON)**:

- Command Palette → “Preferences: Open Settings (JSON)”

Add something like:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

Now when you save:

1. Prettier formats the file.
2. ESLint fixes what it can and reports remaining issues.

---

## Project-Level Settings (`.vscode/settings.json`)

To keep behavior consistent for everyone opening the repo in VS Code, create a `.vscode/settings.json` file in your project:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

This way:

- Anyone with the ESLint + Prettier extensions installed gets the same behavior.
- The project “brings its own” editor defaults.

---

## Typical End-to-End Workflow

With everything in place, a normal day looks like this:

1. **Edit code in VS Code**
   - ESLint highlights issues as you type.
   - On save, Prettier formats and ESLint fixes simple problems.

2. **Run local checks (optional but recommended)**
   - `npm run lint`
   - `npm run format:check` (or rely on ESLint’s Prettier integration)

3. **Commit your changes**
   - `git add .`
   - `git commit -m "feat: add feature"`
   - Husky runs `lint-staged`:
     - ESLint + Prettier on staged files.
     - Commit only succeeds if checks pass.

4. **CI pipeline (recommended)**
   - `npm run lint`
   - `npm run format:check`
   - `npm test`

Result: your main branch stays clean, and everyone has the same DX.

---

## Troubleshooting

### ESLint not working in VS Code?

- Make sure the **ESLint extension** is installed and enabled.
- Ensure dependencies are installed (`npm install` / `pnpm install`).
- Check that your ESLint config is at the project root (or configure `eslint.workingDirectories`).

### Prettier not formatting?

- Ensure the **Prettier extension** is installed.
- Confirm `"editor.defaultFormatter": "esbenp.prettier-vscode"` is set.
- Check that `editor.formatOnSave` is enabled.
- Make sure no other formatter extension is taking over for that language.

### Conflicts between ESLint and Prettier?

- Confirm you have `eslint-config-prettier` or `plugin:prettier/recommended` in your ESLint `extends`.
- If ESLint is complaining about formatting that Prettier just changed, you still have conflicting style rules enabled.

---

## Q & A

### Q: What if someone doesn’t use VS Code?

**A:** The core tooling (ESLint, Prettier, Husky, lint-staged) is editor-agnostic. They can configure their editor of choice to run ESLint/Prettier, and Git hooks + CI still enforce rules.

### Q: Do I still need `npm run lint` if I have pre-commit hooks?

**A:** Yes, especially in CI. Hooks can be bypassed; CI should be the final gate.

### Q: Is this overkill for small projects?

**A:** For tiny throwaway scripts maybe. But for any repo you’ll touch more than once (or share with others), it quickly pays for itself.

---

## Summary

You now have a complete workflow:

- **ESLint** keeps your code clean and catches issues early.
- **Prettier** keeps your formatting consistent.
- **Husky + lint-staged** enforce checks on every commit.
- **VS Code + extensions** give you real-time feedback and auto-fixes on save.

Drop this setup into any JS/TS project and you’ve got a solid, modern developer experience out of the box.
