# Chapter 3: pnpm - Fast, Efficient Package Manager

## Overview

pnpm (performant npm) is an alternative package manager that's faster and more disk-efficient than npm. It uses a content-addressable store and hard links to save disk space and speed up installations.

## Why pnpm?

### The Problem with npm

Every project has its own `node_modules` with complete copies of packages:

```
project-a/node_modules/lodash/     ← 1.4 MB
project-b/node_modules/lodash/     ← 1.4 MB (duplicate!)
project-c/node_modules/lodash/     ← 1.4 MB (duplicate!)
```

10 projects using lodash = 14 MB of duplicated files.

### pnpm's Solution

pnpm stores packages once in a global store and links to them:

```
~/.pnpm-store/
└── lodash@4.17.21/               ← Single copy (1.4 MB)

project-a/node_modules/lodash → links to store
project-b/node_modules/lodash → links to store
project-c/node_modules/lodash → links to store
```

10 projects using lodash = 1.4 MB total.

## npm vs pnpm Comparison

| Feature | npm | pnpm |
|---------|-----|------|
| **Disk Space** | Duplicates packages | Shares packages via links |
| **Install Speed** | Standard | 2-3x faster |
| **node_modules Structure** | Flat (hoisted) | Strict (isolated) |
| **Lock File** | package-lock.json | pnpm-lock.yaml |
| **Strictness** | Allows phantom dependencies | Prevents phantom dependencies |

### What are Phantom Dependencies?

With npm's flat `node_modules`, you can accidentally use packages you didn't install:

```js
// package.json only has "express"
// But express depends on "debug"

// npm: This works (but shouldn't!)
const debug = require('debug');  // Phantom dependency

// pnpm: This fails (correct behavior)
// Error: Cannot find module 'debug'
```

pnpm's strict structure prevents this bug.

## Installation

```bash
# Using npm
npm install -g pnpm

# Using Homebrew (macOS)
brew install pnpm

# Using Corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate

# Verify installation
pnpm --version
```

## Basic Commands

pnpm commands are nearly identical to npm:

| Action | npm | pnpm |
|--------|-----|------|
| Install all | `npm install` | `pnpm install` |
| Add package | `npm install pkg` | `pnpm add pkg` |
| Add dev dependency | `npm install -D pkg` | `pnpm add -D pkg` |
| Remove package | `npm uninstall pkg` | `pnpm remove pkg` |
| Run script | `npm run dev` | `pnpm dev` |
| Execute | `npx create-next-app` | `pnpm dlx create-next-app` |

### Key Differences

```bash
# npm uses "install", pnpm uses "add"
npm install express     →  pnpm add express

# pnpm scripts don't need "run" for any script
npm run dev            →  pnpm dev
npm run build          →  pnpm build

# Execute packages
npx create-next-app    →  pnpm dlx create-next-app
# or
pnpm create next-app
```

## Getting Started with pnpm

### New Project

```bash
mkdir my-project
cd my-project

# Initialize
pnpm init

# Add dependencies
pnpm add express
pnpm add -D nodemon typescript

# Run scripts
pnpm dev
```

### Migrate from npm

```bash
cd existing-project

# Remove npm artifacts
rm -rf node_modules
rm package-lock.json

# Install with pnpm
pnpm install

# This creates pnpm-lock.yaml
```

### Import from npm

```bash
# Import existing package-lock.json
pnpm import

# Then install
pnpm install
```

## node_modules Structure

### npm (Flat/Hoisted)

```
node_modules/
├── express/
├── lodash/           ← Hoisted from express
├── debug/            ← Hoisted from express
├── body-parser/      ← Hoisted from express
└── ...               ← Everything at root level
```

### pnpm (Isolated/Strict)

```
node_modules/
├── .pnpm/
│   ├── express@4.18.2/
│   │   └── node_modules/
│   │       ├── express/
│   │       ├── body-parser → ../.pnpm/body-parser@1.20.2/...
│   │       └── ...
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash/
│   └── ...
├── express → .pnpm/express@4.18.2/node_modules/express
└── (only your direct dependencies appear here)
```

**Benefits:**
- Only packages in your `package.json` are accessible
- No phantom dependencies
- Better security (can't accidentally access nested packages)

## Workspaces (Monorepos)

pnpm has excellent workspace support for monorepos:

### Setup

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```
my-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── packages/
│   ├── ui/
│   │   └── package.json
│   └── utils/
│       └── package.json
└── apps/
    ├── web/
    │   └── package.json
    └── api/
        └── package.json
```

### Workspace Commands

```bash
# Install all workspace dependencies
pnpm install

# Add dependency to specific package
pnpm add lodash --filter ui
pnpm add express --filter api

# Run script in specific package
pnpm --filter web dev
pnpm --filter api build

# Run script in all packages
pnpm -r build
pnpm --recursive test

# Add workspace package as dependency
pnpm add @myorg/utils --filter web --workspace
```

### Internal Dependencies

```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/ui": "workspace:*",
    "@myorg/utils": "workspace:^"
  }
}
```

`workspace:*` means use the local workspace version.

## Useful Commands

```bash
# Why was a package installed?
pnpm why lodash

# List all packages
pnpm list
pnpm ls --depth=0

# Check for outdated
pnpm outdated

# Update packages
pnpm update
pnpm update --latest

# Clean store (remove orphaned packages)
pnpm store prune

# View store path
pnpm store path
```

## Configuration

### .npmrc

```ini
# .npmrc (project root)

# Use strict peer dependencies
strict-peer-dependencies=true

# Auto-install peers
auto-install-peers=true

# Hoist patterns (if needed for compatibility)
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=*prettier*

# Shamefully hoist everything (last resort for compatibility)
# shamefully-hoist=true
```

### Dealing with Compatibility Issues

Some tools expect npm's flat structure. Options:

```ini
# Option 1: Hoist specific packages
public-hoist-pattern[]=*prisma*

# Option 2: Hoist everything (not recommended)
shamefully-hoist=true

# Option 3: Use node-linker
node-linker=hoisted
```

## pnpm vs npm vs yarn

| Feature | npm | yarn | pnpm |
|---------|-----|------|------|
| **Disk Efficiency** | ❌ Duplicates | ❌ Duplicates | ✅ Shared store |
| **Install Speed** | Slow | Fast | Fastest |
| **Strictness** | Loose | Loose | Strict |
| **Monorepo Support** | Basic | Good | Excellent |
| **Lock File** | package-lock.json | yarn.lock | pnpm-lock.yaml |
| **Plug'n'Play** | ❌ | ✅ (yarn 2+) | ❌ |

## When to Use pnpm

**Use pnpm when:**
- You have many projects sharing dependencies
- Disk space is a concern
- You want faster installs
- You're building a monorepo
- You want stricter dependency isolation

**Stick with npm when:**
- You need maximum compatibility
- Team isn't comfortable switching
- Project has many tools expecting npm structure

## Quick Reference

```bash
# Initialize
pnpm init

# Dependencies
pnpm add <pkg>              # Add dependency
pnpm add -D <pkg>           # Add dev dependency
pnpm add -g <pkg>           # Add global
pnpm remove <pkg>           # Remove

# Install
pnpm install                # Install all
pnpm install --frozen-lockfile  # CI mode (like npm ci)

# Scripts
pnpm <script>               # Run any script
pnpm dev                    # No 'run' needed

# Execute
pnpm dlx <pkg>              # Like npx
pnpm create <pkg>           # Scaffold (create-*)

# Workspaces
pnpm --filter <name> <cmd>  # Run in specific package
pnpm -r <cmd>               # Run in all packages

# Info
pnpm list                   # List installed
pnpm why <pkg>              # Why installed
pnpm outdated               # Check updates
```

## Key Takeaways

- pnpm saves disk space by storing packages once in a global store
- It's 2-3x faster than npm for installations
- Strict `node_modules` structure prevents phantom dependencies
- Commands are similar to npm (`add` instead of `install`)
- Excellent workspace support for monorepos
- Some tools may need configuration for compatibility

## Questions & Answers

### Q: Can I use pnpm in an existing npm project?
**A:** Yes! Remove `node_modules` and `package-lock.json`, then run `pnpm install`. You can also use `pnpm import` to migrate the lock file.

### Q: Will pnpm work with all packages?
**A:** Almost all. Some packages that rely on npm's flat structure may need `.npmrc` configuration. Use `public-hoist-pattern` or `shamefully-hoist` if needed.

### Q: Do I need to install packages again for each project?
**A:** No! pnpm's store is shared. If you've installed `lodash@4.17.21` once, all projects link to that same copy.

### Q: How much disk space will I save?
**A:** It varies. Projects with many shared dependencies can save 50-70% disk space. The more projects you have, the more you save.

## Resources

- [pnpm Official Website](https://pnpm.io)
- [pnpm Documentation](https://pnpm.io/motivation)
- [pnpm vs npm vs yarn](https://pnpm.io/benchmarks)
- [Workspaces](https://pnpm.io/workspaces)

---

**Course Complete!** 

You now understand:
- What Node.js is and why to use it
- How npm manages packages and dependencies
- How pnpm improves on npm with efficiency and strictness

Happy coding! 🚀
