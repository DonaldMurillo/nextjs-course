# Chapter 6: Next.js with TypeScript

## Overview

Next.js has first-class TypeScript support. This chapter covers typing pages, layouts, server components, server actions, API routes, and all the Next.js-specific patterns.

## Setup

```bash
# New project with TypeScript
npx create-next-app@latest my-app --typescript

# Add to existing project
touch tsconfig.json
npm install --save-dev typescript @types/react @types/node
npm run dev  # Auto-configures TypeScript
```

## Page Components

### Basic Page

```tsx
// app/page.tsx
export default function Home() {
  return <h1>Welcome</h1>;
}
```

### Page with Params

```tsx
// app/blog/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  return <article>Post: {slug}</article>;
}
```

### Page with Search Params

```tsx
// app/search/page.tsx
type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function Search({ searchParams }: PageProps) {
  const { q, page } = await searchParams;
  return <div>Searching for: {q}, Page: {page ?? "1"}</div>;
}
```

### Page with Both

```tsx
// app/products/[category]/page.tsx
type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; filter?: string }>;
};

export default async function Products({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { sort, filter } = await searchParams;
  
  return (
    <div>
      <h1>{category}</h1>
      <p>Sort: {sort}, Filter: {filter}</p>
    </div>
  );
}
```

## Layout Components

```tsx
// app/layout.tsx
type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.tsx
type DashboardLayoutProps = {
  children: React.ReactNode;
  analytics: React.ReactNode;  // Parallel route
  team: React.ReactNode;       // Parallel route
};

export default function DashboardLayout({
  children,
  analytics,
  team,
}: DashboardLayoutProps) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2">
        {analytics}
        {team}
      </div>
    </div>
  );
}
```

## Metadata

### Static Metadata

```tsx
// app/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to my site",
  openGraph: {
    title: "Home",
    description: "Welcome to my site",
    images: ["/og-image.png"],
  },
};
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      images: [post.coverImage],
    },
  };
}
```

## Server Actions

### Basic Action

```tsx
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  
  await db.posts.create({ data: { title, content } });
}
```

### Action with Return Value

```tsx
// app/actions.ts
"use server";

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { id: string };
};

export async function createPost(formData: FormData): Promise<ActionResult> {
  try {
    const title = formData.get("title") as string;
    
    if (!title) {
      return { success: false, error: "Title is required" };
    }
    
    const post = await db.posts.create({ data: { title } });
    return { success: true, data: { id: post.id } };
  } catch {
    return { success: false, error: "Failed to create post" };
  }
}
```

### Action with useActionState

```tsx
// app/actions.ts
"use server";

export type FormState = {
  message: string;
  errors?: {
    title?: string[];
    content?: string[];
  };
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get("title") as string;
  
  if (!title) {
    return {
      message: "error",
      errors: { title: ["Title is required"] },
    };
  }
  
  await db.posts.create({ data: { title } });
  return { message: "success" };
}

// components/PostForm.tsx
"use client";

import { useActionState } from "react";
import { createPost, type FormState } from "@/app/actions";

const initialState: FormState = { message: "" };

export function PostForm() {
  const [state, formAction, isPending] = useActionState(createPost, initialState);
  
  return (
    <form action={formAction}>
      <input name="title" />
      {state.errors?.title && <p>{state.errors.title[0]}</p>}
      <button disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

### Action with Bound Arguments

```tsx
// app/actions.ts
"use server";

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<void> {
  const title = formData.get("title") as string;
  await db.posts.update({ where: { id: postId }, data: { title } });
}

// components/EditForm.tsx
import { updatePost } from "@/app/actions";

export function EditForm({ postId }: { postId: string }) {
  const updatePostWithId = updatePost.bind(null, postId);
  
  return (
    <form action={updatePostWithId}>
      <input name="title" />
      <button>Update</button>
    </form>
  );
}
```

## Route Handlers (API Routes)

### Basic Handler

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const posts = await db.posts.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const post = await db.posts.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
```

### Handler with Params

```tsx
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  const post = await db.posts.findUnique({ where: { id } });
  
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  
  return NextResponse.json(post);
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  await db.posts.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
```

### Typed Request Body

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";

type CreatePostBody = {
  title: string;
  content: string;
  published?: boolean;
};

export async function POST(request: NextRequest) {
  const body: CreatePostBody = await request.json();
  
  // Type-safe access
  const post = await db.posts.create({
    data: {
      title: body.title,
      content: body.content,
      published: body.published ?? false,
    },
  });
  
  return NextResponse.json(post, { status: 201 });
}
```

## Data Fetching Types

### Typed Fetch

```tsx
// lib/api.ts
type User = {
  id: string;
  name: string;
  email: string;
};

export async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  return response.json();
}
```

### With Prisma

```tsx
// lib/db.ts
import { prisma } from "./prisma";

// Prisma generates types automatically
export async function getPost(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { author: true },
  });
}

// Return type is inferred from Prisma
type PostWithAuthor = Awaited<ReturnType<typeof getPost>>;
```

## Middleware

```tsx
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

## Error & Loading Files

```tsx
// app/error.tsx
"use client";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}

// app/not-found.tsx
export default function NotFound() {
  return <div>Page not found</div>;
}
```

## generateStaticParams

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await db.posts.findMany({ select: { slug: true } });
  return posts.map((post) => ({ slug: post.slug }));
}
```

## Common Type Imports

```tsx
import type { 
  Metadata,
  ResolvingMetadata,
} from "next";

import type { 
  NextRequest,
  NextResponse,
} from "next/server";

import type {
  ReadonlyURLSearchParams,
} from "next/navigation";
```

## Key Takeaways

- Next.js auto-configures TypeScript
- Page props: `params` and `searchParams` are Promises (await them)
- Use `Metadata` type for static/dynamic metadata
- Server Actions: type the return value for error handling
- Route Handlers: use `NextRequest` and `NextResponse`
- Prisma generates types automatically from your schema
- Import `type` to avoid including types in the bundle

## Questions & Answers

### Q: Why are params and searchParams Promises now?
**A:** Next.js 15 made them async for better performance. Always await them before use.

### Q: How do I type a component that can be used in both server and client?
**A:** Just type the props—React components work the same way. The server/client distinction is about what APIs you can use inside, not the types.

### Q: Should I use `any` for form data?
**A:** No, use type assertions: `formData.get("title") as string`. For runtime validation, use Zod.

## Resources

- [Next.js: TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Next.js: API Reference](https://nextjs.org/docs/app/api-reference)

---

**Next:** [Chapter 7: Quick Reference / Cheat Sheet](./07-quick-reference.md)
