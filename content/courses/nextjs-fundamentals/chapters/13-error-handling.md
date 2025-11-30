# Chapter 13: Error Handling

## Overview

Errors happen. Good error handling improves user experience and makes debugging easier. Next.js provides built-in conventions for handling errors at different levels of your application.

## Error Handling Hierarchy

```
global-error.js     → Root layout errors
  └── error.js      → Route segment errors
        └── try/catch  → Component-level errors
```

## error.js Convention

Create `error.js` to handle errors in a route segment:

```jsx
// app/dashboard/error.js
'use client';  // Must be a Client Component

export default function DashboardError({ error, reset }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### How It Works

Next.js wraps your page in an error boundary:

```jsx
// What Next.js does internally
<ErrorBoundary fallback={<Error />}>
  <Page />
</ErrorBoundary>
```

### Error Props

- `error`: The error object (includes `message`, `digest` for server errors)
- `reset`: Function to re-render the route segment

### Logging Errors

```jsx
'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Route error:', error);
    // logToService(error);
  }, [error]);
  
  return (
    <div>
      <h2>Error</h2>
      <button onClick={reset}>Retry</button>
    </div>
  );
}
```

## global-error.js

Handles errors in the root layout:

```jsx
// app/global-error.js
'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">{error.message}</p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Note:** `global-error.js` must include `<html>` and `<body>` tags since it replaces the root layout.

## not-found.js

Handle 404 errors:

```jsx
// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

### Triggering Not Found

```jsx
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  
  if (!product) {
    notFound();  // Renders not-found.js
  }
  
  return <ProductDetails product={product} />;
}
```

### Route-Specific Not Found

```jsx
// app/blog/[slug]/not-found.js
import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
      <p className="mb-4">We couldn't find the blog post you're looking for.</p>
      <Link href="/blog" className="text-blue-500 hover:underline">
        Browse all posts
      </Link>
    </div>
  );
}
```

## Server Action Error Handling

### Returning Errors

```jsx
// app/actions.js
'use server';

export async function createPost(prevState, formData) {
  try {
    const title = formData.get('title');
    const content = formData.get('content');
    
    // Validation
    if (!title || title.length < 3) {
      return { error: 'Title must be at least 3 characters' };
    }
    
    await db.posts.create({ data: { title, content } });
    
    return { success: true };
  } catch (error) {
    // Log error server-side
    console.error('Create post error:', error);
    
    // Return user-friendly message
    return { error: 'Failed to create post. Please try again.' };
  }
}
```

### Handling in Forms

```jsx
'use client';

import { useActionState } from 'react';
import { createPost } from '@/app/actions';

export function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, null);
  
  return (
    <form action={formAction}>
      {state?.error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="p-3 mb-4 bg-green-50 text-green-700 rounded">
          Post created successfully!
        </div>
      )}
      
      <input name="title" placeholder="Title" required />
      <textarea name="content" placeholder="Content" required />
      <button disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

## API Route Error Handling

```jsx
// app/api/posts/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const post = await db.posts.create({ data: body });
    
    return NextResponse.json(post, { status: 201 });
    
  } catch (error) {
    console.error('API error:', error);
    
    // Check for specific errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Post with this title already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Examples

### Basic Example: Simple Error Page

```jsx
// app/error.js
'use client';

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-2">Oops!</h2>
      <p className="text-gray-600 mb-4">Something went wrong.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-gray-900 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
```

### Normal Example: Error with Details

```jsx
// app/dashboard/error.js
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    // Log error
    console.error('Dashboard error:', error);
  }, [error]);
  
  return (
    <div className="p-8 max-w-md mx-auto text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      
      <h2 className="text-xl font-semibold mb-2">
        Failed to load dashboard
      </h2>
      
      <p className="text-gray-600 mb-6">
        We couldn't load your dashboard data. This might be a temporary issue.
      </p>
      
      <div className="space-x-4">
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Go home
        </Link>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error details
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  );
}
```

### Complex Example: Granular Error Handling

```jsx
// app/dashboard/page.js
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function SectionError({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-700">Failed to load section</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 text-sm text-red-600 underline"
      >
        Retry
      </button>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Each section handles errors independently */}
      <ErrorBoundary FallbackComponent={SectionError}>
        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsSection />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary FallbackComponent={SectionError}>
        <Suspense fallback={<div>Loading chart...</div>}>
          <ChartSection />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary FallbackComponent={SectionError}>
        <Suspense fallback={<div>Loading activity...</div>}>
          <ActivitySection />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary FallbackComponent={SectionError}>
        <Suspense fallback={<div>Loading tasks...</div>}>
          <TasksSection />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
```

## Custom Error Types

```jsx
// lib/errors.js
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}
```

```jsx
// app/actions.js
'use server';

import { ValidationError, NotFoundError } from '@/lib/errors';
import { notFound, redirect } from 'next/navigation';

export async function updatePost(postId, formData) {
  const post = await db.posts.findUnique({ where: { id: postId } });
  
  if (!post) {
    notFound();  // Use Next.js not found
  }
  
  const title = formData.get('title');
  
  if (!title || title.length < 3) {
    return { 
      error: 'Title must be at least 3 characters',
      field: 'title',
    };
  }
  
  await db.posts.update({
    where: { id: postId },
    data: { title },
  });
  
  return { success: true };
}
```

## Key Takeaways

- Use `error.js` for route-level error handling
- Use `global-error.js` for root layout errors
- Use `not-found.js` for 404 pages
- `error.js` must be a Client Component
- Return errors from Server Actions, don't throw
- Log errors server-side, show friendly messages to users
- Use React Error Boundaries for granular error handling

## Questions & Answers

### Q: Why must error.js be a Client Component?
**A:** Error boundaries require client-side React features to catch and recover from errors.

### Q: What's the difference between error.js and global-error.js?
**A:** `error.js` handles errors in its route segment. `global-error.js` handles errors in the root layout (and must include html/body tags).

### Q: Should I throw errors in Server Actions?
**A:** Generally no. Return error objects instead for better user experience. Use `notFound()` or `redirect()` for navigation.

## Resources

- [Next.js: Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**Next Chapter:** [14. Performance Optimization](./14-performance-optimization.md) - Optimize your Next.js application for speed.
