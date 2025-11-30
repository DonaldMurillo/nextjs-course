# Chapter 10: Images, Fonts & Metadata

## Overview

Next.js provides built-in optimization for images, fonts, and metadata. These optimizations improve performance, Core Web Vitals, and SEO without manual configuration.

## Next.js Image Component

The `next/image` component automatically optimizes images:

```jsx
import Image from 'next/image';

export function Hero() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority
    />
  );
}
```

### Key Features

- **Automatic optimization**: WebP/AVIF conversion, resizing
- **Lazy loading**: Images load as they enter viewport
- **Blur placeholder**: Show blur while loading
- **Prevents layout shift**: Reserves space before load

### Required Props

```jsx
// Local images (from public folder)
<Image
  src="/images/photo.jpg"
  alt="Description"
  width={800}
  height={600}
/>

// Remote images (external URLs)
<Image
  src="https://example.com/photo.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

### Sizing Options

```jsx
// Fixed size
<Image src="/photo.jpg" alt="" width={400} height={300} />

// Fill container
<div className="relative h-64">
  <Image
    src="/photo.jpg"
    alt=""
    fill
    className="object-cover"
  />
</div>

// Responsive
<Image
  src="/photo.jpg"
  alt=""
  sizes="(max-width: 768px) 100vw, 50vw"
  fill
/>
```

### Priority Loading

Use `priority` for above-the-fold images (LCP):

```jsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority  // Preloads image
/>
```

### Placeholder Blur

```jsx
// For local images - automatic
import heroImage from '../public/hero.jpg';

<Image
  src={heroImage}
  alt="Hero"
  placeholder="blur"  // Uses automatically generated blur
/>

// For remote images - provide blurDataURL
<Image
  src="https://example.com/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Remote Image Configuration

Configure allowed remote domains:

```ts
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
};

export default config;
```

## Font Optimization

Next.js provides automatic font optimization with `next/font`:

### Google Fonts

```tsx
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Local Fonts

```jsx
import localFont from 'next/font/local';

const myFont = localFont({
  src: [
    {
      path: '../fonts/MyFont-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/MyFont-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-my-font',
});
```

### Using with Tailwind

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-roboto-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
```

```jsx
<p className="font-sans">Using Inter</p>
<code className="font-mono">Using Roboto Mono</code>
```

## Metadata

### Static Metadata

```tsx
// app/layout.tsx or app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Website',
  description: 'Welcome to my website',
  keywords: ['Next.js', 'React', 'TypeScript'],
  authors: [{ name: 'John Doe' }],
  openGraph: {
    title: 'My Website',
    description: 'Welcome to my website',
    url: 'https://example.com',
    siteName: 'My Website',
    images: [
      {
        url: 'https://example.com/og.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Website',
    description: 'Welcome to my website',
    images: ['https://example.com/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
    },
  };
}
```

### Template Titles

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | My Website',
    default: 'My Website',
  },
};

// app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About', // Renders: "About | My Website"
};
```

### Favicon and Icons

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};
```

Or use file conventions:

```
app/
├── favicon.ico
├── icon.png
├── apple-icon.png
└── opengraph-image.png
```

## Examples

### Basic Example: Blog Post with Image

```tsx
// app/blog/[slug]/page.tsx
import Image from 'next/image';
import type { Metadata } from 'next';
import { getPost } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article>
      <div className="relative h-96">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
      </div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Normal Example: Image Gallery

```tsx
// components/Gallery.tsx
import Image from 'next/image';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  blurDataURL: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

export function Gallery({ images }: GalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={image.id} className="relative aspect-square">
          <Image
            src={image.url}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover rounded-lg"
            placeholder="blur"
            blurDataURL={image.blurDataURL}
            priority={index < 6} // Priority for first 6 images
          />
        </div>
      ))}
    </div>
  );
}
```

### Complex Example: E-commerce Product Page

```tsx
// app/products/[id]/page.tsx
import Image from 'next/image';
import type { Metadata } from 'next';
import { getProduct } from '@/lib/products';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images.map((img) => ({
        url: img.url,
        width: 800,
        height: 800,
        alt: product.name,
      })),
    },
    other: {
      'product:price:amount': String(product.price),
      'product:price:currency': 'USD',
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square">
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-lg"
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {product.images.slice(1).map((image) => (
            <div key={image.id} className="relative aspect-square">
              <Image
                src={image.url}
                alt=""
                fill
                sizes="25vw"
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Product Info */}
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-semibold mt-4">${product.price}</p>
        <p className="mt-4 text-gray-600">{product.description}</p>
      </div>
    </div>
  );
}
```

## JSON-LD Structured Data

```tsx
// app/products/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images[0].url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>{/* Product content */}</div>
    </>
  );
}
```

## Key Takeaways

- Use `next/image` for automatic image optimization
- Set `priority` for above-the-fold images
- Use `fill` with `object-cover` for responsive images
- `next/font` eliminates layout shift and improves performance
- Define metadata with static objects or `generateMetadata`
- Use template titles for consistent page titles
- Add structured data (JSON-LD) for rich search results

## Questions & Answers

### Q: Why are my images not loading?
**A:** For remote images, add the domain to `remotePatterns` in `next.config.js`.

### Q: How do I handle different image sizes for different devices?
**A:** Use the `sizes` prop:
```jsx
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

### Q: Do I need to self-host Google Fonts?
**A:** No. `next/font/google` automatically self-hosts fonts at build time.

### Q: How do I add a favicon?
**A:** Place `favicon.ico` in the `app` directory, or use the `icons` metadata property.

## Resources

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Font Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Schema.org](https://schema.org) - Structured data reference

