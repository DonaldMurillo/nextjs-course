import Dexie, { type EntityTable } from 'dexie';

interface Course {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown content
  createdAt: number;
}

interface Progress {
  id: string; // courseId
  completed: boolean;
  lastRead: number;
}

interface Note {
  id: string;
  courseId: string;
  title: string;
  content: string;
  createdAt: number;
}

const db = new Dexie('CourseDatabase') as Dexie & {
  courses: EntityTable<Course, 'id'>;
  progress: EntityTable<Progress, 'id'>;
  notes: EntityTable<Note, 'id'>;
};

db.version(1).stores({
  courses: 'id, title, createdAt',
  progress: 'id, completed, lastRead',
  notes: 'id, courseId, title, createdAt'
});

db.on('populate', () => {
  db.courses.add({
    id: 'nextjs-fundamentals',
    title: 'Next.js Fundamentals',
    description: 'Learn the basics of Next.js 14+, including App Router, Server Components, and more.',
    content: `# Next.js Fundamentals

Welcome to the Next.js Fundamentals course! This comprehensive guide will teach you everything you need to know to build modern web applications with Next.js.

## Introduction to Next.js

Next.js is a powerful React framework that enables you to build full-stack web applications. It provides a great developer experience with features like:

- **Server-Side Rendering (SSR)** - Render pages on the server for better SEO and performance
- **Static Site Generation (SSG)** - Pre-render pages at build time
- **App Router** - Modern routing with React Server Components
- **API Routes** - Build your backend API alongside your frontend
- **Automatic Code Splitting** - Only load the JavaScript needed for each page
- **Built-in CSS Support** - Import CSS files directly in your components

## Getting Started

### Installation

To create a new Next.js application, run:

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

This will create a new Next.js project with all the necessary dependencies and configuration.

### Project Structure

A typical Next.js project has the following structure:

\`\`\`
my-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── next.config.js
└── package.json
\`\`\`

## The App Router

The App Router is the recommended way to build Next.js applications. It uses React Server Components by default and provides powerful features for routing and data fetching.

### Creating Pages

Pages are created by adding files to the \`app\` directory:

- \`app/page.tsx\` → \`/\`
- \`app/about/page.tsx\` → \`/about\`
- \`app/blog/[slug]/page.tsx\` → \`/blog/:slug\`

### Layouts

Layouts are UI that is shared between multiple pages. They preserve state and don't re-render on navigation.

\`\`\`tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
\`\`\`

## Server Components vs Client Components

### Server Components (Default)

Server Components run on the server and can directly access backend resources:

\`\`\`tsx
async function getData() {
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <div>{data.title}</div>
}
\`\`\`

### Client Components

Client Components run in the browser and can use hooks and browser APIs. Mark them with \`'use client'\`:

\`\`\`tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
\`\`\`

## Data Fetching

Next.js provides several ways to fetch data:

### Server-Side Fetching

\`\`\`tsx
async function getPost(id: string) {
  const res = await fetch(\`https://api.example.com/posts/\${id}\`)
  return res.json()
}

export default async function Post({ params }: { params: { id: string } }) {
  const post = await getPost(params.id)
  return <article>{post.content}</article>
}
\`\`\`

### Client-Side Fetching

For client-side data fetching, you can use SWR or React Query:

\`\`\`tsx
'use client'

import useSWR from 'swr'

export default function Profile() {
  const { data, error } = useSWR('/api/user', fetcher)
  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return <div>Hello {data.name}!</div>
}
\`\`\`

## Styling

Next.js supports various styling methods:

### CSS Modules

\`\`\`tsx
import styles from './page.module.css'

export default function Page() {
  return <h1 className={styles.title}>Hello World</h1>
}
\`\`\`

### Tailwind CSS

Next.js works great with Tailwind CSS:

\`\`\`tsx
export default function Page() {
  return <h1 className="text-4xl font-bold">Hello World</h1>
}
\`\`\`

## API Routes

Create API endpoints in the \`app/api\` directory:

\`\`\`tsx
// app/api/hello/route.ts
export async function GET() {
  return Response.json({ message: 'Hello World' })
}
\`\`\`

## Deployment

Next.js applications can be deployed to Vercel with zero configuration:

1. Push your code to GitHub
2. Import your repository to Vercel
3. Deploy!

You can also deploy to other platforms like AWS, Google Cloud, or self-host.

## Best Practices

1. **Use Server Components by default** - Only use Client Components when you need interactivity
2. **Optimize images** - Use the \`next/image\` component for automatic optimization
3. **Implement proper error handling** - Use error.tsx and not-found.tsx files
4. **Enable TypeScript** - Get better type safety and developer experience
5. **Use environment variables** - Keep sensitive data secure

## Next Steps

Now that you understand the fundamentals, you can:

- Build a full-stack application with authentication
- Learn about advanced routing patterns
- Explore middleware and edge functions
- Optimize for performance and SEO
- Deploy to production

Happy coding! 🚀
    `,
    createdAt: Date.now(),
  });
});

export { db };
export type { Course, Progress, Note };
