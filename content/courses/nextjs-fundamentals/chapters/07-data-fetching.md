# Chapter 7: Data Fetching

## Overview

Data fetching in Next.js is fundamentally different from traditional React. Instead of `useEffect` and loading states, Server Components fetch data directly during rendering. This chapter covers how to fetch data, manage caching, and handle loading and error states.

## The New Paradigm

### Traditional React (Client-Side)

```tsx
// Everything happens in the browser
function ProductPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/product/123')
      .then(res => res.json())
      .then(setProduct)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <ProductDisplay product={product} />;
}
```

### Next.js (Server Components)

```tsx
// Fetching happens on the server
async function ProductPage({ params }) {
  const product = await fetch(`https://api.example.com/product/${params.id}`)
    .then(res => res.json());
  
  return <ProductDisplay product={product} />;
}
```

No `useEffect`, no loading state management, no error handling boilerplate. The component fetches data, renders, and sends HTML to the browser.

## Fetching Methods

### 1. Native fetch (Recommended)

Next.js extends the native `fetch` API with caching and revalidation options:

```tsx
// Basic fetch
const data = await fetch('https://api.example.com/data');

// With caching options
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache',  // Cache indefinitely (default in some cases)
  // or
  cache: 'no-store',     // Don't cache, always fresh
  // or
  next: { revalidate: 3600 }  // Cache for 1 hour
});
```

### 2. Direct Database Access

Server Components can query databases directly:

```tsx
import { db } from '@/lib/db';

async function ProductsPage() {
  const products = await db.products.findMany();
  return <ProductList products={products} />;
}
```

### 3. Third-Party Libraries

Use any data fetching library that works in Node.js:

```tsx
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

async function Dashboard() {
  // Prisma
  const users = await prisma.user.findMany();
  
  // Supabase
  const supabase = createClient(url, key);
  const { data } = await supabase.from('posts').select();
  
  return <DashboardView users={users} posts={data} />;
}
```

## The Good

### Simpler Code
No more `useEffect` → `useState` → loading → error dance. Just `await` your data and render.

### Better Performance
Data fetches happen on the server, closer to your database. Users get HTML immediately—no JavaScript execution needed for initial content.

### Automatic Request Deduplication
Multiple components requesting the same data? Next.js deduplicates identical `fetch` requests within a render pass.

### Secure Data Access
Server Components can safely access databases and secrets. API keys never reach the browser.

### SEO Benefits
Search engines see fully rendered content. No waiting for JavaScript to fetch and display data.

## The Bad

### Caching Complexity
Understanding when data is cached, where it's cached, and how to invalidate it requires deep knowledge.

### Limited Reactivity
Server Components can't update without a full re-render or navigation. Real-time data needs Client Components.

### Debugging Difficulty
When data is stale, figuring out which cache layer is responsible can be challenging.

## The Ugly

### Cache Defaults Changed
Between Next.js 14 and 15, caching defaults changed. Code that worked before might behave differently after upgrade.

### Waterfall Potential
Sequential `await` statements create waterfalls. Parallel fetching requires explicit `Promise.all`.

### Mixed Mental Model
Some data fetching is server-side, some is client-side. Knowing when to use each takes experience.

## Caching Overview

Next.js has multiple cache layers:

```
Request → Router Cache → Full Route Cache → Data Cache → Origin
            (client)        (server)          (server)
```

| Cache | Location | Purpose |
|-------|----------|---------|
| **Data Cache** | Server | Caches fetch responses |
| **Full Route Cache** | Server | Caches rendered HTML |
| **Router Cache** | Client | Caches visited pages in browser |

### Cache Behavior in Next.js 15

By default in Next.js 15:
- `fetch` requests are **not cached** (changed from v14)
- You must opt into caching explicitly

```tsx
// Not cached (default in Next.js 15)
const data = await fetch('https://api.example.com/data');

// Opt into caching
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'  // Cache indefinitely
});

// Time-based revalidation
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 }  // Cache for 60 seconds
});
```

## What You'll Learn

This chapter is divided into sub-chapters:

### [7.1 Fetching in Server Components](./07.1-fetching-server-components.md)
- Using fetch in Server Components
- Direct database queries
- Parallel vs sequential fetching
- Request deduplication

### [7.2 Caching & Revalidation](./07.2-caching-revalidation.md)
- Cache options and strategies
- Time-based revalidation
- On-demand revalidation
- Cache tags

### [7.3 Loading & Error States](./07.3-loading-error-states.md)
- loading.tsx for instant loading UI
- error.tsx for error boundaries
- Streaming with Suspense
- Handling edge cases

## Key Takeaways

- Server Components fetch data during render—no `useEffect` needed
- Next.js extends `fetch` with caching and revalidation options
- Next.js 15 defaults to no caching—opt in explicitly
- Multiple cache layers exist: Data Cache, Full Route Cache, Router Cache
- Use `loading.tsx` and `error.tsx` for loading and error states
- Direct database access is possible and recommended in Server Components

## Questions & Answers

### Q: Should I still use useEffect for data fetching?
**A:** Only in Client Components that need real-time updates or user-triggered fetches. For initial page data, use Server Components.

### Q: What about libraries like React Query or SWR?
**A:** They're still useful for client-side data management, real-time updates, and optimistic mutations. But for initial page load, Server Components often eliminate the need.

### Q: How do I fetch data based on user input?
**A:** For search/filter: Update the URL with searchParams, then fetch in the Server Component based on those params. For instant feedback: Use a Client Component with client-side fetching.

### Q: Does caching work in development?
**A:** Caching behavior can differ between development and production. Test caching in production builds.

### Q: How do I handle authentication in data fetching?
**A:** Access cookies/headers in Server Components using `cookies()` or `headers()` from `next/headers`, then pass auth tokens to your fetch calls.

## Resources

- [Next.js: Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js: Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js: fetch API Extensions](https://nextjs.org/docs/app/api-reference/functions/fetch)
- [Vercel: Understanding Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

---

**Next:** [7.1 Fetching in Server Components](./07.1-fetching-server-components.md) - Learn the fundamentals of fetching data in Server Components.
