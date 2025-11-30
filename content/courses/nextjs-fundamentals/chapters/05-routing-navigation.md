# Chapter 5: Routing & Navigation

## Overview

Routing is how users move through your application. The App Router provides powerful, file-based routing with support for dynamic segments, catch-all routes, and advanced patterns. Navigation can happen through links, programmatically, or through browser history.

## The Routing System

Next.js uses the file system as the router. Each folder represents a URL segment, and special files define the UI for that segment.

```
URL Structure:
https://example.com/blog/2024/my-post
        └─────┬─────┘└──┬─┘└──┬──┘└──┬──┘
           domain    segment segment segment

File Structure:
app/
└── blog/
    └── [year]/
        └── [slug]/
            └── page.tsx
```

## Types of Routes

### Static Routes

Fixed paths that don't change:

```
app/
├── page.tsx           →  /
├── about/
│   └── page.tsx       →  /about
└── contact/
    └── page.tsx       →  /contact
```

### Dynamic Routes

Paths with variable segments, wrapped in brackets:

```
app/
├── blog/
│   └── [slug]/
│       └── page.tsx   →  /blog/hello-world, /blog/my-post, etc.
├── users/
│   └── [id]/
│       └── page.tsx   →  /users/1, /users/abc, etc.
└── shop/
    └── [category]/
        └── [product]/
            └── page.tsx  →  /shop/electronics/phone
```

### Catch-All Routes

Match multiple segments with `[...param]`:

```
app/
└── docs/
    └── [...slug]/
        └── page.tsx   →  /docs/a, /docs/a/b, /docs/a/b/c
```

### Optional Catch-All Routes

Match zero or more segments with `[[...param]]`:

```
app/
└── shop/
    └── [[...categories]]/
        └── page.tsx   →  /shop, /shop/clothes, /shop/clothes/shirts
```

## The Good

### Intuitive Mental Model
The file structure mirrors your URL structure. No routing configuration files, no learning a routing DSL. Create a folder, add a page, you have a route.

### Type-Safe Parameters
With TypeScript, route parameters are type-safe. You know exactly what parameters a page receives.

### Automatic Code Splitting
Each route is automatically code-split. Users only download the JavaScript they need for the current page.

### Prefetching
Next.js automatically prefetches linked pages in the viewport, making navigation feel instant.

### Parallel Data Fetching
Multiple components can fetch data simultaneously, reducing waterfalls and improving load times.

## The Bad

### Limited Flexibility
Some routing patterns are hard to express in files. Complex conditional routing or programmatic route generation can be awkward.

### Directory Explosion
Large applications can end up with deeply nested directories that are hard to navigate.

### Naming Constraints
Folder names become URL segments. If you want `/api` as a route, you must name the folder `api`. This can conflict with organizational preferences.

## The Ugly

### Bracket Soup
Dynamic routes with multiple parameters get hard to read:

```
app/[locale]/shop/[category]/[subcategory]/[productId]/page.tsx
```

### Refactoring Pain
Changing URL structures means moving folders, updating imports, and fixing all references. Large refactors can be tedious.

### Edge Cases
Some valid URL patterns are hard to express:
- Routes that differ only by query params
- Routes with optional middle segments
- Complex conditional routing

## Navigation Methods

### 1. Link Component

For declarative navigation in JSX:

```tsx
import Link from 'next/link';

<Link href="/about">About</Link>
<Link href="/blog/my-post">Read Post</Link>
<Link href={{ pathname: '/search', query: { q: 'nextjs' } }}>Search</Link>
```

### 2. useRouter Hook

For programmatic navigation in Client Components:

```tsx
'use client';
import { useRouter } from 'next/navigation';

function LoginButton() {
  const router = useRouter();
  
  const handleLogin = async () => {
    await login();
    router.push('/dashboard');
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```

### 3. redirect Function

For server-side redirects in Server Components:

```tsx
import { redirect } from 'next/navigation';

async function ProfilePage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return <Profile user={user} />;
}
```

### 4. Native History API

For advanced cases, you can use the browser's history API:

```tsx
'use client';

function Component() {
  const handleBack = () => {
    window.history.back();
  };
  
  return <button onClick={handleBack}>Go Back</button>;
}
```

## URL Handling

### Building URLs

Use string templates or the URL constructor:

```tsx
// Simple
const url = `/blog/${slug}`;

// With query params
const url = `/search?q=${encodeURIComponent(query)}&page=${page}`;

// Using URLSearchParams
const params = new URLSearchParams({ q: query, page: page.toString() });
const url = `/search?${params}`;
```

### Reading URL Information

Different hooks for different purposes:

```tsx
'use client';
import { usePathname, useSearchParams, useParams } from 'next/navigation';

function SearchPage() {
  const pathname = usePathname();         // /search
  const searchParams = useSearchParams(); // ?q=nextjs
  const params = useParams();             // { slug: 'my-post' }
  
  const query = searchParams.get('q');    // 'nextjs'
  
  return <div>...</div>;
}
```

## What You'll Learn

This chapter is divided into sub-chapters:

### [5.1 Dynamic Routes](./05.1-dynamic-routes.md)
- Single dynamic segments `[param]`
- Multiple dynamic segments
- Catch-all routes `[...param]`
- Optional catch-all `[[...param]]`
- Generating static params

### [5.2 Parallel & Intercepting Routes](./05.2-parallel-intercepting-routes.md)
- Parallel routes with `@folder`
- Intercepting routes with `(.)`, `(..)`, `(...)`
- Modal patterns
- Conditional rendering based on routes

### [5.3 Navigation](./05.3-navigation.md)
- Link component in depth
- useRouter hook
- Programmatic navigation
- Scroll behavior
- Navigation events

## Key Takeaways

- File structure equals URL structure in the App Router
- Dynamic routes use brackets: `[param]`, `[...param]`, `[[...param]]`
- Use `Link` for declarative navigation, `useRouter` for programmatic
- `redirect()` works in Server Components for server-side redirects
- URL reading hooks: `usePathname`, `useSearchParams`, `useParams`
- Next.js automatically prefetches and code-splits routes

## Questions & Answers

### Q: How do I create a 404 page?
**A:** Create `app/not-found.tsx` for a global 404, or add `not-found.tsx` to specific segments. Call `notFound()` to trigger it programmatically.

### Q: Can I have routes with the same path but different methods?
**A:** Yes, in Route Handlers (API routes). Create `route.ts` and export different functions: `GET`, `POST`, `PUT`, `DELETE`.

### Q: How do I handle trailing slashes?
**A:** Configure in `next.config.ts`:
```ts
module.exports = {
  trailingSlash: true, // /about/
  // or
  trailingSlash: false, // /about (default)
};
```

### Q: Can I nest dynamic routes?
**A:** Yes:
```
app/[category]/[subcategory]/[productId]/page.tsx
→ /electronics/phones/iphone-15
```

### Q: How do I redirect from one route to another?
**A:** Use `redirect()` in Server Components, `router.push()` in Client Components, or configure redirects in `next.config.ts` for permanent redirects.

### Q: What's the difference between `router.push` and `router.replace`?
**A:** `push` adds to history (back button works), `replace` replaces current entry (back button skips it).

## Resources

- [Next.js: Routing Fundamentals](https://nextjs.org/docs/app/building-your-application/routing)
- [Next.js: Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [Next.js: Linking and Navigating](https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating)
- [Next.js: Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

