# Chapter 2: Development Environment Setup

## Overview

Before writing any Next.js code, you need a properly configured development environment. This chapter walks through everything you need: Node.js, a code editor, essential extensions, and creating your first Next.js project.

A well-configured environment makes development faster and catches errors before they become problems.

## Prerequisites

- A computer running macOS, Windows, or Linux
- Administrator access to install software
- Basic familiarity with using a terminal/command line

## Installing Node.js

Next.js runs on Node.js, a JavaScript runtime that executes code outside the browser. You need Node.js version 18.18 or later for Next.js 15.

### Checking Existing Installation

Open your terminal and run:

```bash
node --version
```

If you see `v18.18.0` or higher, you're good. If not, or if you get "command not found," install Node.js.

### Installation Options

#### Option 1: Direct Download (Simplest)
Download the LTS version from [nodejs.org](https://nodejs.org). Run the installer and follow the prompts.

#### Option 2: Using nvm (Recommended for Developers)
Node Version Manager (nvm) lets you install and switch between multiple Node.js versions.

**macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal, then install Node.js
nvm install --lts
nvm use --lts
```

**Windows:**
Use [nvm-windows](https://github.com/coreybutler/nvm-windows/releases). Download and run the installer, then:

```bash
nvm install lts
nvm use lts
```

#### Option 3: Using Homebrew (macOS)
```bash
brew install node
```

### Verifying Installation

After installation, verify both Node.js and npm (Node Package Manager, included with Node.js):

```bash
node --version   # Should show v18.18.0 or higher
npm --version    # Should show 9.x or higher
```

## Code Editor Setup

While you can use any text editor, Visual Studio Code (VS Code) offers the best experience for Next.js development.

### Installing VS Code

Download from [code.visualstudio.com](https://code.visualstudio.com) and install.

### Essential Extensions

Install these extensions for the best experience (Cmd/Ctrl + Shift + X to open Extensions):

#### Must Have
- **ESLint**: Catches errors and enforces code style
- **Prettier - Code formatter**: Automatic code formatting
- **ES7+ React/Redux/React-Native snippets**: Code snippets for React

#### Highly Recommended
- **Tailwind CSS IntelliSense**: Autocomplete for Tailwind classes
- **Prisma**: Syntax highlighting for Prisma schemas
- **Error Lens**: Shows errors inline in your code
- **Auto Rename Tag**: Renames paired HTML/JSX tags
- **GitLens**: Enhanced Git integration

#### Optional but Useful
- **Thunder Client**: API testing without leaving VS Code
- **Import Cost**: Shows size of imported packages
- **Path Intellisense**: Autocompletes file paths

### VS Code Settings for Next.js

Open settings (Cmd/Ctrl + ,) and add these configurations. Click the "Open Settings (JSON)" icon in the top right:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "emmet.includeLanguages": {
    "typescript": "typescriptreact"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

This configuration:
- Formats code automatically when you save
- Uses Prettier as the default formatter
- Runs ESLint fixes on save
- Enables Emmet abbreviations in TypeScript files
- Associates CSS files with Tailwind for better IntelliSense

## Creating Your First Next.js Project

Now let's create a Next.js application using the official scaffolding tool.

### Using create-next-app

Open your terminal, navigate to where you want your project, and run:

```bash
npx create-next-app@latest my-first-nextjs-app
```

You'll be prompted with configuration options:

```
✔ Would you like to use TypeScript? … No / Yes
✔ Would you like to use ESLint? … No / Yes
✔ Would you like to use Tailwind CSS? … No / Yes
✔ Would you like your code inside a `src/` directory? … No / Yes
✔ Would you like to use App Router? (recommended) … No / Yes
✔ Would you like to use Turbopack for next dev? … No / Yes
✔ Would you like to customize the import alias (@/* by default)? … No / Yes
```

**Recommended answers for this course:**
- TypeScript: **Yes** (industry standard, better tooling)
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No** (simpler structure)
- App Router: **Yes** (this is what we're learning)
- Turbopack: **Yes** (faster development builds)
- Import alias: **No** (default @/* is fine)

### Project Structure

After creation, your project looks like this:

```
my-first-nextjs-app/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── next.svg
│   └── vercel.svg
├── .eslintrc.json
├── .gitignore
├── tsconfig.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tailwind.config.ts
```

Let's understand each part:

#### `app/` Directory
This is where your application lives. The App Router uses this directory for routing and page components.

- **layout.tsx**: The root layout wrapping all pages
- **page.tsx**: The home page (renders at `/`)
- **globals.css**: Global styles
- **favicon.ico**: Browser tab icon

#### `public/` Directory
Static files served directly. Files here are accessible at the root URL:
- `public/image.png` → accessible at `/image.png`

#### Configuration Files
- **next.config.ts**: Next.js configuration
- **package.json**: Dependencies and scripts
- **tailwind.config.ts**: Tailwind CSS configuration
- **postcss.config.mjs**: PostCSS configuration (used by Tailwind)
- **.eslintrc.json**: ESLint rules
- **tsconfig.json**: TypeScript configuration, including path aliases and compiler options

### Running the Development Server

Navigate into your project and start the development server:

```bash
cd my-first-nextjs-app
npm run dev
```

You should see:

```
   ▲ Next.js 15.x.x
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in Xs
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll see the Next.js welcome page.

### Understanding the Scripts

In `package.json`, you'll find these scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

- **npm run dev**: Start development server with hot reload
- **npm run build**: Create production build
- **npm run start**: Run production server (after build)
- **npm run lint**: Check code for errors with ESLint

## Your First Code Change

Let's modify the home page to confirm everything works.

Open `app/page.tsx` and replace its contents:

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Hello, Next.js!</h1>
      <p className="mt-4 text-xl text-gray-600">
        My first Next.js application
      </p>
    </main>
  );
}
```

Save the file. Your browser automatically updates—no refresh needed. This is Fast Refresh in action.

## Project Configuration Deep Dive

### next.config.ts

The Next.js configuration file. A basic setup:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Configuration options go here
};

export default nextConfig;
```

Common configurations you might add later:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow images from external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },

  // Environment variables available in the browser
  env: {
    CUSTOM_VAR: 'value',
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

> **Docs Reference:** [next.config.ts Options](https://nextjs.org/docs/app/api-reference/config/next-config-ts)

### package.json

Your project's manifest. Key sections:

```json
{
  "name": "my-first-nextjs-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "15.x.x"
  },
  "devDependencies": {
    "eslint": "^8.x.x",
    "eslint-config-next": "15.x.x",
    "postcss": "^8.x.x",
    "tailwindcss": "^3.x.x"
  }
}
```

### tsconfig.json

Configures TypeScript compiler options and path aliases:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

This lets you use `@/` as an alias for the project root:

```tsx
// Instead of
import Header from '../../../components/Header';

// You can write
import Header from '@/components/Header';
```

## Setting Up Git

Version control is essential. Initialize a Git repository:

```bash
git init
git add .
git commit -m "Initial commit: Next.js project setup"
```

The `.gitignore` file is pre-configured to exclude:
- `node_modules/` - Dependencies (reinstall with `npm install`)
- `.next/` - Build output
- `.env*.local` - Local environment variables

### Connecting to GitHub

Create a repository on GitHub, then:

```bash
git remote add origin https://github.com/yourusername/my-first-nextjs-app.git
git branch -M main
git push -u origin main
```

## Environment Variables

Next.js has built-in support for environment variables. Create a `.env.local` file:

```bash
# .env.local
DATABASE_URL="your-database-url"
API_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://api.example.com"
```

Important rules:
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Variables without the prefix are server-only (never sent to the browser)
- `.env.local` is gitignored by default—never commit secrets

Access them in your code:

```tsx
// Server-side only
const dbUrl = process.env.DATABASE_URL;

// Available in browser (because of NEXT_PUBLIC_ prefix)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

> **Docs Reference:** [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

## Troubleshooting Common Setup Issues

### "command not found: node"
Node.js isn't installed or isn't in your PATH. Reinstall Node.js or restart your terminal.

### "EACCES permission denied"
On macOS/Linux, you might have permission issues with global npm packages. Use nvm to avoid this, or fix permissions:

```bash
sudo chown -R $(whoami) ~/.npm
```

### Port 3000 Already in Use
Another process is using port 3000. Either stop that process or use a different port:

```bash
npm run dev -- -p 3001
```

### Slow Installation
If `npm install` is slow, try using a different registry or switch to pnpm:

```bash
# Using pnpm (faster alternative to npm)
npm install -g pnpm
pnpm create next-app my-app
```

### ESLint Errors on Save
Make sure you have ESLint extension installed and the `.eslintrc.json` file exists in your project root.

## Key Takeaways

- Node.js 18.18+ is required for Next.js 15
- VS Code with recommended extensions provides the best development experience
- `create-next-app` scaffolds a properly configured project
- The `app/` directory contains your routes and pages
- Fast Refresh provides instant feedback during development
- Environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Git should be initialized from the start

## Questions & Answers

### Q: Can I use yarn or pnpm instead of npm?
**A:** Yes. Both work great with Next.js:
```bash
yarn create next-app my-app
# or
pnpm create next-app my-app
```
Many teams prefer pnpm for its speed and disk efficiency.

### Q: Do I need to eject or configure webpack?
**A:** No. Next.js handles bundling internally. You rarely need to touch webpack configuration, and when you do, Next.js provides extension points in `next.config.mjs`.

### Q: Why use Turbopack?
**A:** Turbopack is Next.js's new bundler, written in Rust. It's significantly faster than webpack for development. It's stable for `dev` but `build` still uses webpack.

### Q: Why does this course use TypeScript?
**A:** TypeScript is the industry standard for Next.js development. It provides type safety, better IDE support, catches errors at compile time, and makes refactoring safer. Next.js has excellent TypeScript support out of the box.

### Q: What's the difference between `npm install` and `npm ci`?
**A:** `npm install` updates `package-lock.json` if needed. `npm ci` installs exactly what's in `package-lock.json`, which is faster and more reliable for CI/CD environments.

### Q: Should I commit `package-lock.json`?
**A:** Yes. It ensures everyone on your team (and your deployment) uses the exact same dependency versions.

## Resources

- [Node.js Official Site](https://nodejs.org)
- [nvm GitHub Repository](https://github.com/nvm-sh/nvm)
- [VS Code Download](https://code.visualstudio.com)
- [Next.js Installation Guide](https://nextjs.org/docs/getting-started/installation)
- [Next.js Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [Environment Variables in Next.js](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

