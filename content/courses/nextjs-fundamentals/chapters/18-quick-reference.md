# Chapter 18: Quick Reference / Cheat Sheet

## File Conventions

```
app/
├── layout.tsx        # Root layout (required)
├── page.tsx          # Home page (/)
├── loading.tsx       # Loading UI
├── error.tsx         # Error UI (client component)
├── not-found.tsx     # 404 UI
├── route.ts          # API endpoint
├── template.tsx      # Re-mounting layout
├── default.tsx       # Parallel route fallback
└── [folder]/         # Route segment
    └── page.tsx
```

## Routing Patterns

```
// Static route
app/about/page.tsx → /about

// Dynamic route
app/blog/[slug]/page.tsx → /blog/my-post

// Catch-all route
app/docs/[...slug]/page.tsx → /docs/a/b/c

// Optional catch-all
app/shop/[[...slug]]/page.tsx → /shop, /shop/a, /shop/a/b

// Route groups (no URL impact)
app/(marketing)/about/page.tsx → /about
app/(dashboard)/settings/page.tsx → /settings

// Private folders
app/_components/ → Not routable
```

## Component Types

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetch('...');
  return <div>{data}</div>;
}

// Client Component
"use client";
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Data Fetching

```tsx
// Server Component - direct fetch
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data}</div>;
}

// With caching
const data = await fetch(url, {
  cache: 'force-cache',     // Cache indefinitely
  cache: 'no-store',        // Never cache
  next: { revalidate: 60 }, // Revalidate every 60s
  next: { tags: ['posts'] } // Tag for revalidation
});

// Parallel fetching
const [users, posts] = await Promise.all([
  getUsers(),
  getPosts()
]);
```

## Server Actions

```ts
// Define action
"use server";
export async function createItem(formData) {
  const name = formData.get('name');
  await db.items.create({ data: { name } });
  revalidatePath('/items');
}

// Use in form
<form action={createItem}>
  <input name="name" />
  <button type="submit">Create</button>
</form>

// With bound arguments
const updateWithId = updateItem.bind(null, itemId);
<form action={updateWithId}>...</form>
```

## Form Hooks

```tsx
// useFormStatus - get form pending state
"use client";
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>;
}

// useActionState - manage form state
import { useActionState } from 'react';

function Form() {
  const [state, formAction, isPending] = useActionState(action, null);
  return (
    <form action={formAction}>
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>Submit</button>
    </form>
  );
}

// useOptimistic - optimistic updates
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (state, newItem) => [...state, { ...newItem, pending: true }]
);
```

## Navigation

```tsx
// Link component
import Link from 'next/link';
<Link href="/about">About</Link>
<Link href="/blog/[slug]" as={`/blog/${post.slug}`}>Post</Link>

// Programmatic navigation
"use client";
import { useRouter } from 'next/navigation';

function Component() {
  const router = useRouter();
  router.push('/dashboard');    // Navigate
  router.replace('/login');     // Replace history
  router.back();                // Go back
  router.refresh();             // Refresh current route
}

// Server-side redirect
import { redirect } from 'next/navigation';
redirect('/login');

// Permanent redirect
import { permanentRedirect } from 'next/navigation';
permanentRedirect('/new-url');
```

## URL Hooks

```tsx
"use client";
import { usePathname, useSearchParams, useParams } from 'next/navigation';

const pathname = usePathname();     // '/blog/post'
const searchParams = useSearchParams(); // ?q=search
const params = useParams();         // { slug: 'post' }

// Get search param
const query = searchParams.get('q');
```

## Metadata

```tsx
// Static metadata
export const metadata = {
  title: 'My Page',
  description: 'Page description',
};

// Dynamic metadata
export async function generateMetadata({ params }) {
  const post = await getPost(params.id);
  return {
    title: post.title,
    description: post.excerpt,
  };
}
```

## Cache Revalidation

```ts
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate a path
revalidatePath('/posts');
revalidatePath('/posts/[id]', 'page');
revalidatePath('/', 'layout'); // Everything

// Revalidate by tag
revalidateTag('posts');
```

## Route Segment Config

```ts
// Dynamic behavior
export const dynamic = 'force-dynamic'; // Always dynamic
export const dynamic = 'force-static';  // Always static

// Revalidation
export const revalidate = 3600; // Seconds
export const revalidate = false; // Never

// Runtime
export const runtime = 'edge'; // or 'nodejs'
```

## Route Handlers

```tsx
// app/api/posts/route.ts
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  return NextResponse.json({ data });
}

export async function POST(request) {
  const body = await request.json();
  return NextResponse.json(result, { status: 201 });
}

// With dynamic params
// app/api/posts/[id]/route.ts
export async function GET(request, { params }) {
  const { id } = await params;
  return NextResponse.json({ id });
}
```

## Prisma Queries

```ts
import { prisma } from '@/lib/prisma';

// Create
await prisma.user.create({ data: { name: 'Alice' } });

// Read
const user = await prisma.user.findUnique({ where: { id } });
const users = await prisma.user.findMany({ where: { active: true } });

// Update
await prisma.user.update({ where: { id }, data: { name: 'Bob' } });

// Delete
await prisma.user.delete({ where: { id } });

// With relations
const user = await prisma.user.findUnique({
  where: { id },
  include: { posts: true },
});
```

## CSS Modules

```tsx
// styles.module.css
.button {
  background: blue;
}

// Component
import styles from './styles.module.css';
<button className={styles.button}>Click</button>

// Dynamic classes
<div className={`${styles.base} ${isActive ? styles.active : ''}`} />
```

## Tailwind CSS

```tsx
// Basic utilities
<div className="p-4 m-2 bg-blue-500 text-white rounded-lg shadow-md">

// Responsive
<div className="text-sm md:text-base lg:text-lg">

// States
<button className="bg-blue-500 hover:bg-blue-700 disabled:opacity-50">

// Dark mode
<div className="bg-white dark:bg-gray-800">
```

## Common Patterns

### Protected Route

```tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  
  return <Dashboard user={session.user} />;
}
```

### Loading with Suspense

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  );
}
```

### Error Boundary

```tsx
// error.tsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found

```tsx
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const item = await getItem(params.id);
  if (!item) notFound();
  
  return <div>{item.name}</div>;
}
```

## Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://...
API_SECRET=secret

# Public (accessible in browser)
NEXT_PUBLIC_API_URL=https://api.example.com
```

```ts
// Server-only
const dbUrl = process.env.DATABASE_URL;

// Client-accessible
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## Commands

```bash
# Development
npx create-next-app@latest my-app
npm run dev

# Build & production
npm run build
npm start

# Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio

# Linting
npm run lint
```

---

This completes the Next.js Fundamentals course! Return to [Chapter 1: Introduction](./01-introduction.md) to review or explore any chapter using the navigation links.
