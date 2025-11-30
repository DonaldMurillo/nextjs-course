# Chapter 14: Performance & Optimization

## Overview

Next.js provides many performance optimizations out of the box, but understanding them helps you make informed decisions. This chapter covers caching, bundle optimization, Core Web Vitals, and performance debugging.

## Next.js Built-in Optimizations

### Automatic Optimizations

Next.js automatically provides:

1. **Code Splitting**: Each route is a separate bundle
2. **Prefetching**: Links in viewport are prefetched
3. **Image Optimization**: Automatic format conversion and sizing
4. **Font Optimization**: Self-hosted, zero layout shift
5. **Script Optimization**: Control loading priorities
6. **Tree Shaking**: Unused code is removed

## Caching Strategies

### Request Memoization

Duplicate fetch requests in the same render pass are automatically deduplicated:

```tsx
// Both components fetch the same data
// Only ONE request is made

async function Header() {
  const user = await getUser(); // Request 1
  return <h1>Welcome, {user.name}</h1>;
}

async function Sidebar() {
  const user = await getUser(); // Same request - deduplicated
  return <nav>{user.role}</nav>;
}
```

### Data Cache

By default, `fetch` results are cached:

```tsx
// Cached indefinitely (default)
const data = await fetch('https://api.example.com/data');

// Revalidate every 60 seconds
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
});

// No caching
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store',
});
```

### Full Route Cache

Static routes are cached at build time. Dynamic routes are cached after first request.

```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Force static rendering
export const dynamic = 'force-static';

// Revalidate entire page every 60 seconds
export const revalidate = 60;
```

### On-Demand Revalidation

```tsx
// app/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function updatePost(id: string, data: FormData) {
  await db.posts.update({ where: { id }, data: { ... } });

  // Revalidate specific path
  revalidatePath(`/blog/${id}`);

  // Or revalidate by tag
  revalidateTag('posts');
}
```

Tag your fetches for granular revalidation:

```tsx
const posts = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] },
});
```

## Bundle Optimization

### Analyze Bundle Size

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Add to next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

### Dynamic Imports

Split code that isn't needed immediately:

```tsx
import dynamic from 'next/dynamic';

// Load component only when needed
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable server-side rendering if not needed
});

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

### Lazy Load Below-Fold Content

```tsx
'use client';

import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

const Comments = dynamic(() => import('./Comments'));

export function LazyComments({ postId }: { postId: string }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? <Comments postId={postId} /> : <div className="h-96" />}
    </div>
  );
}
```

### Tree Shaking

Import only what you need:

```tsx
// ❌ Bad - imports entire library
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Good - imports only debounce
import debounce from 'lodash/debounce';
debounce(fn, 300);
```

## Core Web Vitals

### LCP (Largest Contentful Paint)

Measures loading performance. Target: < 2.5 seconds.

```tsx
// Optimize LCP
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero"
      width={1200}
      height={600}
      priority  // Preload LCP image
    />
  );
}
```

### FID/INP (Interaction to Next Paint)

Measures interactivity. Target: < 200ms.

```tsx
// Split heavy computations
'use client';

import { useTransition } from 'react';

export function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition();
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    const value = e.target.value;

    // Non-urgent update - doesn't block input
    startTransition(() => {
      setResults(filterResults(value));
    });
  };

  return (
    <>
      <input onChange={handleSearch} />
      {isPending ? <Spinner /> : <ResultList results={results} />}
    </>
  );
}
```

### CLS (Cumulative Layout Shift)

Measures visual stability. Target: < 0.1.

```tsx
// Prevent CLS
// 1. Always set image dimensions
<Image src="/photo.jpg" width={800} height={600} alt="" />

// 2. Reserve space for dynamic content
<div className="min-h-[200px]">
  {isLoading ? <Skeleton /> : <Content />}
</div>

// 3. Use font-display: swap
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});
```

## Server Components Performance

### Streaming with Suspense

```tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Shows immediately */}
      <StaticContent />

      {/* Streams in when ready */}
      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <SlowDataTable />
      </Suspense>
    </div>
  );
}
```

### Parallel Data Fetching

```tsx
// ❌ Sequential - slow
async function Page() {
  const user = await getUser();
  const posts = await getPosts(); // Waits for user
  const comments = await getComments(); // Waits for posts
}

// ✅ Parallel - fast
async function Page() {
  const [user, posts, comments] = await Promise.all([
    getUser(),
    getPosts(),
    getComments(),
  ]);
}
```

### Preload Pattern

```tsx
// lib/data.ts
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  return db.users.findUnique({ where: { id } });
});

export const preloadUser = (id: string) => {
  void getUser(id);
};
```

```tsx
// app/user/[id]/page.tsx
import { getUser, preloadUser } from '@/lib/data';

export default async function UserPage({ params }) {
  // Start fetching immediately
  preloadUser(params.id);

  // Do other work...

  // Data is likely ready by now
  const user = await getUser(params.id);
}
```

## Monitoring Performance

### Next.js Analytics

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Performance Marks

```tsx
'use client';

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    console.log(metric);

    // Send to analytics
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  });

  return null;
}
```

## Examples

### Basic Example: Optimized Image Gallery

```tsx
import Image from 'next/image';

export function Gallery({ images }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="relative aspect-square">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            loading={index < 6 ? 'eager' : 'lazy'}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
```

### Normal Example: Optimized Data Loading

```tsx
import { Suspense } from 'react';

async function RecentPosts() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 },
  }).then((r) => r.json());

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}

async function UserStats() {
  const stats = await fetch('https://api.example.com/stats', {
    next: { revalidate: 300 },
  }).then((r) => r.json());

  return <div>Views: {stats.views}</div>;
}

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-8">
      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <UserStats />
      </Suspense>
    </div>
  );
}
```

### Complex Example: Full Optimization

```tsx
// app/products/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for heavy component
const ProductFilters = dynamic(() => import('./ProductFilters'), {
  loading: () => <FiltersSkeleton />,
});

// Cached data fetching
async function getProducts() {
  return fetch('https://api.example.com/products', {
    next: { tags: ['products'], revalidate: 60 },
  }).then((r) => r.json());
}

async function getFeaturedProducts() {
  return fetch('https://api.example.com/products/featured', {
    next: { tags: ['products', 'featured'] },
  }).then((r) => r.json());
}

// Parallel data loading
async function ProductsContent() {
  const [products, featured] = await Promise.all([
    getProducts(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <FeaturedCarousel products={featured} />
      <ProductGrid products={products} />
    </>
  );
}

export default function ProductsPage() {
  return (
    <div className="flex gap-8">
      <aside className="w-64">
        <ProductFilters />
      </aside>

      <main className="flex-1">
        <Suspense fallback={<ProductsGridSkeleton />}>
          <ProductsContent />
        </Suspense>
      </main>
    </div>
  );
}

// Revalidation action
export async function revalidateProducts() {
  'use server';
  revalidateTag('products');
}
```

## Performance Checklist

- [ ] Use `priority` on LCP images
- [ ] Set `sizes` on responsive images
- [ ] Use `next/font` for fonts
- [ ] Dynamic import heavy components
- [ ] Stream with Suspense boundaries
- [ ] Fetch data in parallel
- [ ] Cache appropriately with revalidation
- [ ] Monitor Core Web Vitals
- [ ] Analyze bundle size regularly
- [ ] Use Server Components where possible

## Key Takeaways

- Next.js optimizes by default - understand what it does
- Use caching strategically with appropriate revalidation
- Stream content with Suspense for faster perceived performance
- Dynamic imports reduce initial bundle size
- Monitor Core Web Vitals continuously
- Parallel data fetching eliminates waterfalls

## Questions & Answers

### Q: How do I know if my page is static or dynamic?
**A:** Check build output. Static pages show as `○` (static) or `●` (SSG). Dynamic pages show as `λ` (server) or `ƒ` (dynamic).

### Q: When should I use `cache: 'no-store'`?
**A:** For data that must always be fresh: user-specific data, real-time prices, live feeds.

### Q: How do I debug slow pages?
**A:** Use React DevTools Profiler, Chrome DevTools Performance tab, and Next.js build output analysis.

### Q: Does ISR work with the App Router?
**A:** Yes, use `revalidate` in route segment config or `next.revalidate` in fetch options.

## Resources

- [Next.js: Caching](https://nextjs.org/docs/app/building-your-application/caching)
- [Next.js: Optimizing](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Next Chapter:** [15. Deployment](./15-deployment.md) - Deploy your Next.js application to production.
