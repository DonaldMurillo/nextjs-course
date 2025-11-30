# Chapter 2: npm - Node Package Manager

## Overview

npm (Node Package Manager) is the default package manager for Node.js. It lets you install, share, and manage JavaScript packages (reusable code libraries). npm comes bundled with Node.js, so when you install Node, you get npm automatically.

## What is a Package Manager?

A package manager does three main things:

1. **Downloads packages** from a registry (npmjs.com)
2. **Manages dependencies** (packages your project needs)
3. **Runs scripts** (start server, run tests, build project)

```
┌─────────────────────────────────────────────────────┐
│                    Your Project                      │
├─────────────────────────────────────────────────────┤
│  package.json (lists what you need)                 │
│       ↓                                             │
│  npm install                                        │
│       ↓                                             │
│  node_modules/ (downloaded packages)                │
│       ↓                                             │
│  Your code uses those packages                      │
└─────────────────────────────────────────────────────┘
```

## Getting Started

### Check Installation

```bash
# Check Node.js version
node --version
# v20.10.0

# Check npm version
npm --version
# 10.2.3
```

### Initialize a Project

```bash
# Create a new directory
mkdir my-project
cd my-project

# Initialize with prompts
npm init

# Or skip prompts with defaults
npm init -y
```

This creates `package.json`:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

## Installing Packages

### Install a Package

```bash
# Install a package (adds to dependencies)
npm install lodash

# Shorthand
npm i lodash

# Install multiple packages
npm install express cors dotenv
```

### Install Types

```bash
# Production dependency (needed to run your app)
npm install express

# Development dependency (only needed for development)
npm install --save-dev nodemon
npm install -D jest

# Global installation (available system-wide)
npm install -g typescript
```

### package.json After Installing

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Version Numbers

npm uses semantic versioning (semver):

```
   4  .  18  .  2
   │      │     │
 major  minor  patch

major: Breaking changes
minor: New features (backward compatible)
patch: Bug fixes
```

### Version Ranges

```json
{
  "dependencies": {
    "exact": "4.18.2",           // Exactly this version
    "patch": "~4.18.2",          // 4.18.x (patch updates only)
    "minor": "^4.18.2",          // 4.x.x (minor + patch updates)
    "any": "*",                   // Any version (dangerous!)
    "range": ">=4.0.0 <5.0.0"    // Version range
  }
}
```

**Default:** `^` (caret) - allows minor and patch updates

## Common Commands

### Installing & Removing

```bash
# Install all dependencies from package.json
npm install
npm i

# Install specific package
npm install express

# Install specific version
npm install express@4.18.2

# Remove a package
npm uninstall express
npm remove express
npm rm express

# Update packages
npm update

# Check for outdated packages
npm outdated
```

### Running Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "build": "tsc"
  }
}
```

```bash
# Run scripts
npm start          # Special: doesn't need 'run'
npm test           # Special: doesn't need 'run'
npm run dev        # Custom scripts need 'run'
npm run build
```

### Information

```bash
# List installed packages
npm list
npm ls

# List top-level only
npm list --depth=0

# View package info
npm view express

# Search packages
npm search http server
```

## node_modules and package-lock.json

### node_modules/

This folder contains all installed packages and their dependencies. It can get huge.

```
node_modules/
├── express/
├── lodash/
├── accepts/          ← dependency of express
├── body-parser/      ← dependency of express
└── ... hundreds more
```

**Important:** Never commit `node_modules` to git!

```gitignore
# .gitignore
node_modules/
```

### package-lock.json

This file locks exact versions of every package (including sub-dependencies).

**Why it matters:**
- Ensures everyone gets the exact same versions
- Makes installations faster and more reliable
- Should be committed to git

```bash
# Install from lock file (exact versions)
npm ci

# Use this in CI/CD pipelines instead of npm install
```

## npm Scripts In-Depth

### Basic Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```

### Pre and Post Scripts

```json
{
  "scripts": {
    "prebuild": "rm -rf dist",
    "build": "tsc",
    "postbuild": "echo 'Build complete!'"
  }
}
```

Running `npm run build` executes: prebuild → build → postbuild

### Chaining Commands

```json
{
  "scripts": {
    "all": "npm run lint && npm run test && npm run build",
    "parallel": "npm run watch:css & npm run watch:js"
  }
}
```

- `&&` runs sequentially (stops on failure)
- `&` runs in parallel (Unix only)

## npx - Execute Packages

npx runs packages without installing them globally:

```bash
# Without npx (requires global install)
npm install -g create-next-app
create-next-app my-app

# With npx (no install needed)
npx create-next-app my-app

# Run specific version
npx create-next-app@14 my-app

# Run local package
npx jest
```

**When to use npx:**
- One-time commands (scaffolding tools)
- Running locally installed packages
- Trying packages without installing

## Common Workflows

### Starting a New Project

```bash
mkdir my-project
cd my-project
npm init -y
npm install express
npm install -D nodemon

# Edit package.json scripts
# Create your files
npm run dev
```

### Cloning an Existing Project

```bash
git clone <repo-url>
cd project
npm install        # Installs from package.json
npm run dev        # Or whatever start script exists
```

### Updating Dependencies

```bash
# Check what's outdated
npm outdated

# Update all (within semver ranges)
npm update

# Update specific package
npm install express@latest

# Interactive update tool
npx npm-check-updates -i
```

## Key Takeaways

- npm comes bundled with Node.js
- `package.json` lists your project's dependencies and scripts
- `node_modules/` contains installed packages (don't commit it)
- `package-lock.json` locks exact versions (do commit it)
- Use `npm install` for dependencies, `-D` for dev dependencies
- Use `npm ci` in CI/CD for reliable installs
- Use `npx` to run packages without global installation

## Questions & Answers

### Q: What's the difference between dependencies and devDependencies?
**A:** `dependencies` are needed to run your app in production. `devDependencies` are only needed during development (testing, building, linting). In production, you can skip devDependencies with `npm install --production`.

### Q: Should I commit package-lock.json?
**A:** Yes! It ensures everyone gets the exact same dependency versions.

### Q: npm install vs npm ci?
**A:** `npm install` updates package-lock.json if needed. `npm ci` requires an existing lock file and installs exact versions. Use `npm ci` in CI/CD pipelines.

### Q: How do I fix "npm audit" vulnerabilities?
**A:** Run `npm audit fix` for automatic fixes. For breaking changes, use `npm audit fix --force` (carefully) or update packages manually.

## Resources

- [npm Documentation](https://docs.npmjs.com)
- [npm Registry](https://www.npmjs.com)
- [Semantic Versioning](https://semver.org)
- [package.json Reference](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)

---

**Next:** [Chapter 3: pnpm - Fast, Efficient Package Manager](./03-pnpm.md)
