# Chapter 4: The App Router

## What Is the App Router?

The App Router is Next.js's file-system based router built on React Server Components. Introduced in Next.js 13 and stabilized in Next.js 14, it represents a fundamental shift in how we build React applications.

Instead of manually configuring routes, you create folders and files. The file structure becomes your URL structure.

```
app/
├── page.tsx         →  /
├── about/
│   └── page.tsx     →  /about
├── blog/
│   ├── page.tsx     →  /blog
│   └── [slug]/
│       └── page.tsx →  /blog/my-post
└── dashboard/
    ├── page.tsx     →  /dashboard
    └── settings/
        └── page.tsx →  /dashboard/settings
```

## The Good

### Intuitive Routing
Creating a route is as simple as creating a folder with a `page.tsx` file. No configuration files, no route declarations. The structure mirrors your URL hierarchy.

### Colocation
Keep everything related together. Components, styles, tests, and utilities can live alongside the pages that use them:

```
app/
└── blog/
    ├── page.tsx          # The page component
    ├── BlogPost.tsx      # Page-specific component
    ├── blog.module.css   # Page-specific styles
    └── utils.ts          # Page-specific utilities
```

### Nested Layouts
Layouts persist across navigations without re-rendering. Define a layout once, and it wraps all pages in that segment. Perfect for navigation, sidebars, and persistent UI.

### Built-in Loading and Error States
Every route segment can have its own `loading.js` and `error.js`. Users see instant loading feedback while data fetches, and errors are contained to the affected segment.

### Server Components by Default
Components in the App Router are Server Components by default. They run on the server, can access databases directly, and send no JavaScript to the browser. This results in faster initial page loads and smaller bundle sizes.

### Parallel and Intercepting Routes
Advanced patterns like modals, split views, and conditional routing that were complex to implement are now declarative.

## The Bad

### Learning Curve
The mental model is different from traditional React. Understanding when code runs on the server vs client, how caching works, and which components can use which features takes time.

### Migration Complexity
Moving from Pages Router to App Router isn't straightforward. Different file conventions, different data fetching patterns, and some features work differently.

### Breaking Changes
Between Next.js 13-15, caching behavior and defaults have changed multiple times. Code that worked one way might work differently after an upgrade.

### "Magic" File Names
You must use exact file names: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`. Typos like `pages.tsx` or `Page.tsx` won't work, and the error messages don't always make it obvious.

## The Ugly

### Debugging Complexity
When something goes wrong, understanding why requires knowing whether you're debugging server code, client code, or the boundary between them. Stack traces can be confusing.

### Caching Gotchas
The caching system is powerful but opaque. Data might be cached when you don't expect it, or not cached when you want it to be. Next.js 15 changed some defaults, which helped but also broke some existing code.

### Limited Escape Hatches
When the file-based system doesn't fit your needs (complex dynamic routes, programmatic routing), the workarounds can be awkward.

## App Router vs Pages Router

| Feature | App Router (`app/`) | Pages Router (`pages/`) |
|---------|---------------------|-------------------------|
| **Status** | Current, recommended | Supported, legacy |
| **Components** | Server Components default | Client Components only |
| **Layouts** | Nested, persistent | Per-page, re-mount |
| **Data Fetching** | `async` components, `fetch` | `getServerSideProps`, `getStaticProps` |
| **Loading States** | `loading.tsx` file | Manual implementation |
| **Error Handling** | `error.tsx` file | `_error.tsx` page |
| **Route Handlers** | `route.ts` | `pages/api/*` |

### Why Two Routers?

The Pages Router served Next.js well for years. The App Router was built to take advantage of React Server Components and provide better patterns for modern applications. Both will work in the same project during migration, but new projects should use the App Router.

## Key Concepts

### Route Segments

Each folder in the `app` directory is a route segment that maps to a URL segment:

```
app/dashboard/settings/page.tsx
    └─────┬─────┘└──┬───┘
      segment    segment
          ↓
    /dashboard/settings
```

### File Conventions

Special files create UI for a route segment:

| File | Purpose |
|------|---------|
| `page.tsx` | UI for the route (required for the route to be accessible) |
| `layout.tsx` | Shared UI wrapping pages and child segments |
| `loading.tsx` | Loading UI (shown while page loads) |
| `error.tsx` | Error UI (shown when errors occur) |
| `not-found.tsx` | 404 UI (shown when route doesn't exist) |
| `route.ts` | API endpoint (cannot coexist with `page.tsx`) |
| `template.tsx` | Like layout, but re-mounts on navigation |

### Private Folders

Prefix a folder with `_` to exclude it from routing:

```
app/
├── _components/      # Not a route, just organization
│   └── Header.tsx
├── _lib/             # Not a route, just utilities
│   └── utils.ts
└── dashboard/
    └── page.tsx      # This IS a route: /dashboard
```

### Route Groups

Wrap folder names in parentheses to organize without affecting URLs:

```
app/
├── (marketing)/
│   ├── about/
│   │   └── page.tsx  →  /about (not /marketing/about)
│   └── pricing/
│       └── page.tsx  →  /pricing
└── (dashboard)/
    ├── layout.tsx    # Different layout for dashboard section
    └── settings/
        └── page.tsx  →  /settings
```

## The Mental Model

Think of the App Router in three layers:

1. **File System = Routes**: Folders map to URLs
2. **Special Files = UI Slots**: Each file type fills a specific role
3. **Component Tree = Nesting**: Layouts wrap pages, segments nest

```
URL: /dashboard/settings

File System:
app/
├── layout.tsx         ─┐
├── dashboard/          │ Component Tree:
│   ├── layout.tsx     ─┤  <RootLayout>
│   └── settings/       │    <DashboardLayout>
│       └── page.tsx   ─┘      <SettingsPage />
```

Each layout wraps its children. The root layout wraps the dashboard layout, which wraps the settings page.

## What You'll Learn

This chapter is divided into sub-chapters:

### [4.1 File Conventions](./04.1-file-conventions.md)
- `page.tsx` for route UI
- `layout.tsx` for shared layouts
- `loading.tsx` for loading states
- `error.tsx` for error boundaries
- `not-found.tsx` for 404 pages

### [4.2 Route Groups & Organization](./04.2-route-groups.md)
- Organizing routes with `(groups)`
- Private folders with `_underscore`
- Colocation strategies
- Project structure best practices

## Key Takeaways

- The App Router uses file-system based routing
- Special files (`page.tsx`, `layout.tsx`, etc.) create UI for route segments
- Components are Server Components by default
- Layouts are persistent and don't re-render on navigation
- Route groups `(name)` organize without affecting URLs
- The learning curve is steeper but the patterns are more powerful

## Questions & Answers

### Q: Can I use Pages Router and App Router together?
**A:** Yes, during migration. Routes in `app/` take precedence over `pages/` for the same path. However, you should plan to fully migrate eventually.

### Q: Do I need both `app/` and `pages/` directories?
**A:** No. For new projects, use only `app/`. The `pages/` directory is for legacy projects or incremental migration.

### Q: What happened to `getServerSideProps` and `getStaticProps`?
**A:** They don't exist in the App Router. Instead, you fetch data directly in Server Components using `async/await`, and control caching with `fetch` options.

### Q: Why are my components Server Components by default?
**A:** Server Components run on the server, reducing the JavaScript sent to browsers. They can directly access databases and file systems. You opt into Client Components with `'use client'` when you need interactivity.

### Q: How do I create an API endpoint?
**A:** Create a `route.ts` (or `route.tsx`) file instead of `page.tsx`. Export functions named `GET`, `POST`, `PUT`, `DELETE`, etc.

### Q: Can I have both `page.tsx` and `route.ts` in the same folder?
**A:** No. A route segment can be either a page (UI) or an API route, not both. Move API routes to a separate path like `app/api/`.

## Resources

- [Next.js: App Router Documentation](https://nextjs.org/docs/app)
- [Next.js: Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js: Project Structure](https://nextjs.org/docs/getting-started/project-structure)
- [Vercel: App Router Explained (Video)](https://www.youtube.com/watch?v=DrxiNfbr63s)

