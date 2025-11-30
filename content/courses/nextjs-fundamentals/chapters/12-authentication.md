# Chapter 12: Authentication Patterns

## Overview

Authentication is how you verify who a user is. Authorization is what they're allowed to do. This chapter covers implementing authentication in Next.js using sessions, JWTs, and popular auth libraries.

## Authentication Approaches

| Approach | Pros | Cons |
|----------|------|------|
| **Session-based** | Secure, revocable | Requires session storage |
| **JWT** | Stateless, scalable | Can't revoke easily |
| **Third-party** | Quick setup, OAuth | Vendor dependency |

## Session-Based Authentication

### Cookie-Based Sessions

```jsx
// lib/session.js
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
```

### Login Action

```jsx
// app/actions/auth.js
'use server';

import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';

export async function login(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  
  // Find user
  const user = await db.users.findUnique({ where: { email } });
  
  if (!user) {
    return { error: 'Invalid credentials' };
  }
  
  // Verify password
  const valid = await bcrypt.compare(password, user.passwordHash);
  
  if (!valid) {
    return { error: 'Invalid credentials' };
  }
  
  // Create session
  await createSession(user.id);
  
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function register(prevState, formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');
  
  // Check if user exists
  const existing = await db.users.findUnique({ where: { email } });
  
  if (existing) {
    return { error: 'Email already registered' };
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await db.users.create({
    data: { email, name, passwordHash },
  });
  
  // Create session
  await createSession(user.id);
  
  redirect('/dashboard');
}
```

### Protected Routes

```jsx
// app/dashboard/page.js
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  const user = await db.users.findUnique({
    where: { id: session.userId },
  });
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
    </div>
  );
}
```

### Auth Middleware

```jsx
// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

const protectedRoutes = ['/dashboard', '/settings', '/profile'];
const authRoutes = ['/login', '/register'];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get('session')?.value;
  
  let session = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      session = payload;
    } catch {}
  }
  
  // Redirect to login if accessing protected route without session
  if (protectedRoutes.some(route => path.startsWith(route)) && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to dashboard if accessing auth routes with session
  if (authRoutes.includes(path) && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## Using NextAuth.js (Auth.js)

### Installation

```bash
npm install next-auth@beta
```

### Configuration

```jsx
// auth.js
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcrypt';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await db.users.findUnique({
          where: { email: credentials.email },
        });
        
        if (!user) return null;
        
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        
        if (!valid) return null;
        
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});
```

### Route Handler

```jsx
// app/api/auth/[...nextauth]/route.js
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

### Using Auth in Server Components

```jsx
// app/dashboard/page.js
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <div>Welcome, {session.user.name}!</div>;
}
```

### Sign In / Sign Out

```jsx
// components/AuthButtons.js
import { signIn, signOut } from '@/auth';

export function SignIn() {
  return (
    <form action={async () => {
      'use server';
      await signIn('github');
    }}>
      <button type="submit">Sign in with GitHub</button>
    </form>
  );
}

export function SignOut() {
  return (
    <form action={async () => {
      'use server';
      await signOut();
    }}>
      <button type="submit">Sign Out</button>
    </form>
  );
}
```

## Role-Based Access Control

### User Model with Roles

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Authorization Helper

```jsx
// lib/auth.js
import { getSession } from '@/lib/session';

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  
  return db.users.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(roles) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    redirect('/unauthorized');
  }
  return user;
}
```

### Protected Admin Page

```jsx
// app/admin/page.js
import { requireRole } from '@/lib/auth';

export default async function AdminPage() {
  const user = await requireRole(['ADMIN']);
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>
    </div>
  );
}
```

### Server Action Authorization

```jsx
// app/actions/admin.js
'use server';

import { requireRole } from '@/lib/auth';

export async function deleteUser(userId) {
  // Only admins can delete users
  await requireRole(['ADMIN']);
  
  await db.users.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}
```

## Examples

### Basic Example: Login Form

```jsx
// app/login/page.js
import { login } from '@/app/actions/auth';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <LoginForm action={login} />
    </div>
  );
}

// components/LoginForm.js
'use client';

import { useActionState } from 'react';

export function LoginForm({ action }) {
  const [state, formAction, isPending] = useActionState(action, null);
  
  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="p-3 bg-red-50 text-red-700 rounded">
          {state.error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          name="password"
          type="password"
          required
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Normal Example: OAuth with GitHub

```jsx
// components/OAuthButtons.js
'use client';

export function GitHubButton() {
  return (
    <form action="/api/auth/signin/github" method="POST">
      <button
        type="submit"
        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800"
      >
        <GitHubIcon />
        Continue with GitHub
      </button>
    </form>
  );
}

// Or with Server Action
import { signIn } from '@/auth';

export function GitHubSignIn() {
  return (
    <form action={async () => {
      'use server';
      await signIn('github', { redirectTo: '/dashboard' });
    }}>
      <button type="submit">Sign in with GitHub</button>
    </form>
  );
}
```

## Security Best Practices

1. **Always hash passwords** with bcrypt (cost factor 10+)
2. **Use httpOnly cookies** for session tokens
3. **Set secure flag** in production
4. **Validate on every request** - don't trust client data
5. **Rate limit login attempts** to prevent brute force
6. **Use CSRF protection** for form submissions
7. **Implement logout everywhere** for session invalidation

## Key Takeaways

- Use httpOnly cookies for storing session tokens
- Validate authentication in Server Components and Actions
- Use middleware for route protection
- Consider NextAuth.js for OAuth providers
- Implement role-based access control for authorization
- Always hash passwords, never store plain text

## Questions & Answers

### Q: Should I use JWT or sessions?
**A:** Sessions are more secure (revocable). JWTs are simpler for stateless APIs. For most Next.js apps, session-based auth is recommended.

### Q: How do I protect API routes?
**A:** Check the session at the start of each route handler:
```jsx
export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... 
}
```

### Q: Can I use middleware for all auth?
**A:** Middleware is good for redirects but runs on the Edge. Use Server Components or Actions for database queries.

## Resources

- [NextAuth.js Documentation](https://authjs.dev)
- [Next.js Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

