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

const db = new Dexie('CourseDatabase') as Dexie & {
  courses: EntityTable<Course, 'id'>;
  progress: EntityTable<Progress, 'id'>;
};

db.version(1).stores({
  courses: 'id, title, createdAt',
  progress: 'id, completed, lastRead'
});

db.on('populate', () => {
  db.courses.add({
    id: 'nextjs-fundamentals',
    title: 'Next.js Fundamentals',
    description: 'Learn the basics of Next.js 14+, including App Router, Server Components, and more.',
    content: `# Next.js Fundamentals

Welcome to the Next.js Fundamentals course!

## What you will learn
- App Router
- Server Components
- Data Fetching
- Styling

## Getting Started
Next.js is a React framework for building full-stack web applications.
    `,
    createdAt: Date.now(),
  });
});

export { db };
export type { Course, Progress };
