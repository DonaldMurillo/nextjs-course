# Getting Started

Let's set up your first Next.js project and explore the project structure.

## Installation

To create a new Next.js application, run:

```bash
npx create-next-app@latest my-app
cd my-app
npm run dev
```

This will create a new Next.js project with all the necessary dependencies and configuration.

### Interactive Setup

The CLI will ask you several questions:

- **TypeScript?** - Recommended for type safety
- **ESLint?** - Yes, for code quality
- **Tailwind CSS?** - Optional, but great for styling
- **`src/` directory?** - Optional organization preference
- **App Router?** - Yes! (This is what we'll be using)
- **Import alias?** - Customize or use default `@/*`

## Project Structure

A typical Next.js project has the following structure:

```
my-app/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── public/
│   └── images/         # Static assets
├── next.config.js      # Next.js configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript config
```

## Key Directories

### `app/` Directory

This is where your application code lives. The App Router uses this directory for:

- **Pages** - `page.tsx` files
- **Layouts** - `layout.tsx` files
- **API Routes** - `route.ts` files in `api/` folder
- **Components** - Can be co-located with pages

### `public/` Directory

Static assets that don't change:

- Images
- Fonts
- Favicon
- robots.txt

These files are served from the root URL path.

## Running Your App

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Your app will be available at `http://localhost:3000`

## Next Steps

Now that you have a project set up, let's dive into the App Router! 🎯
