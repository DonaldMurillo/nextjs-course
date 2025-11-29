# Chapter 11: API Routes (Route Handlers)

## Overview

Route Handlers let you create API endpoints in Next.js. They replace the `pages/api` directory from the Pages Router with a more flexible approach using the `route.ts` file convention.

## Creating Route Handlers

Create a `route.ts` file in any route segment:

```tsx
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello, World!' });
}
```

This creates an endpoint at `/api/hello`.

## HTTP Methods

Export functions named after HTTP methods:

```tsx
// app/api/posts/route.ts
import { NextResponse } from 'next/server';

// GET /api/posts
export async function GET() {
  const posts = await db.posts.findMany();
  return NextResponse.json(posts);
}

// POST /api/posts
export async function POST(request) {
  const body = await request.json();
  const post = await db.posts.create({ data: body });
  return NextResponse.json(post, { status: 201 });
}
```

```tsx
// app/api/posts/[id]/route.ts

// GET /api/posts/:id
export async function GET(request, { params }) {
  const { id } = await params;
  const post = await db.posts.findUnique({ where: { id } });
  
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  return NextResponse.json(post);
}

// PUT /api/posts/:id
export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  
  const post = await db.posts.update({
    where: { id },
    data: body,
  });
  
  return NextResponse.json(post);
}

// DELETE /api/posts/:id
export async function DELETE(request, { params }) {
  const { id } = await params;
  await db.posts.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
```

## Request Object

Access request data:

```tsx
export async function POST(request) {
  // JSON body
  const body = await request.json();
  
  // Form data
  const formData = await request.formData();
  const name = formData.get('name');
  
  // URL search params
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  // Headers
  const authHeader = request.headers.get('authorization');
  
  // Cookies
  const token = request.cookies.get('token');
  
  return NextResponse.json({ success: true });
}
```

## Response Helpers

```tsx
import { NextResponse } from 'next/server';

// JSON response
return NextResponse.json({ data: 'value' });

// With status code
return NextResponse.json({ error: 'Not found' }, { status: 404 });

// With headers
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'max-age=3600',
  },
});

// Redirect
return NextResponse.redirect(new URL('/login', request.url));

// Rewrite
return NextResponse.rewrite(new URL('/api/v2/posts', request.url));
```

## Example: RESTful API

```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  const users = await db.users.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  
  const total = await db.users.count();
  
  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const data = UserSchema.parse(body);
    
    const user = await db.users.create({ data });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## [11.1 Database with Prisma](./11.1-prisma-database.md)

Learn how to set up Prisma ORM with SQLite for database operations.

## Key Takeaways

- Create `route.ts` files to define API endpoints
- Export functions named after HTTP methods (GET, POST, PUT, DELETE)
- Use `NextResponse` for JSON responses and redirects
- Access request body with `request.json()` or `request.formData()`
- Route Handlers support dynamic segments with `[param]`

## Questions & Answers

### Q: Can I have both page.tsx and route.ts in the same folder?
**A:** No. A route segment can be either a page OR an API route, not both.

### Q: When should I use Route Handlers vs Server Actions?
**A:** Use Server Actions for form submissions and mutations. Use Route Handlers for external APIs, webhooks, and non-form data operations.

### Q: Are Route Handlers cached?
**A:** GET requests can be cached. Use `export const dynamic = 'force-dynamic'` to opt out.

## Resources

- [Next.js: Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MDN: Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [MDN: Request](https://developer.mozilla.org/en-US/docs/Web/API/Request)

---

**Next:** [11.1 Database with Prisma](./11.1-prisma-database.md) - Set up Prisma ORM with your Next.js application.
