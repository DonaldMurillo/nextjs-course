# Chapter 16: Capstone Project - Developer Portfolio

## Overview

In this capstone project, you'll build a complete developer portfolio website using everything you've learned. The portfolio includes a homepage, projects section, blog with MDX, contact form with database storage, and is styled with Tailwind CSS.

## Project Features

- **Homepage** with hero section and featured projects
- **Projects page** with filtering
- **Blog** with MDX content
- **Contact form** with Prisma database
- **Dark mode** toggle
- **Responsive design** with Tailwind CSS
- **SEO optimization** with metadata

## Project Setup

### Create the Project

```bash
npx create-next-app@latest portfolio
# ✔ TypeScript: No
# ✔ ESLint: Yes
# ✔ Tailwind CSS: Yes
# ✔ src/ directory: No
# ✔ App Router: Yes
# ✔ Import alias: Yes (@/*)

cd portfolio
```

### Install Dependencies

```bash
npm install @prisma/client prisma
npm install @next/mdx @mdx-js/loader @mdx-js/react
npm install gray-matter reading-time
npm install clsx
```

### Initialize Prisma

```bash
npx prisma init --datasource-provider sqlite
```

## Project Structure

```
portfolio/
├── app/
│   ├── layout.js
│   ├── page.js
│   ├── globals.css
│   ├── projects/
│   │   ├── page.js
│   │   └── [slug]/
│   │       └── page.js
│   ├── blog/
│   │   ├── page.js
│   │   └── [slug]/
│   │       └── page.js
│   ├── contact/
│   │   └── page.js
│   └── actions.js
├── components/
│   ├── Header.js
│   ├── Footer.js
│   ├── ProjectCard.js
│   ├── BlogCard.js
│   ├── ContactForm.js
│   └── ThemeToggle.js
├── content/
│   ├── projects/
│   │   ├── project-1.mdx
│   │   └── project-2.mdx
│   └── blog/
│       ├── post-1.mdx
│       └── post-2.mdx
├── lib/
│   ├── prisma.js
│   ├── content.js
│   └── utils.js
└── prisma/
    └── schema.prisma
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Contact {
  id        String   @id @default(cuid())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}
```

```bash
npx prisma migrate dev --name init
```

## Core Files

### Root Layout

```jsx
// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | Your Name',
    default: 'Your Name - Developer',
  },
  description: 'Full-stack developer specializing in React and Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
}

@layer components {
  .container {
    @apply max-w-5xl mx-auto px-4 sm:px-6;
  }
  
  .prose {
    @apply max-w-none;
  }
  
  .prose h2 {
    @apply text-2xl font-bold mt-8 mb-4;
  }
  
  .prose p {
    @apply mb-4 leading-relaxed;
  }
  
  .prose code {
    @apply bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm;
  }
  
  .prose pre {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4;
  }
}
```

### Homepage

```jsx
// app/page.js
import Link from 'next/link';
import { getProjects } from '@/lib/content';
import { ProjectCard } from '@/components/ProjectCard';

export default async function HomePage() {
  const projects = await getProjects();
  const featuredProjects = projects.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="container py-20">
        <h1 className="text-5xl font-bold mb-6">
          Hi, I'm <span className="text-blue-500">Your Name</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
          A full-stack developer passionate about building beautiful, 
          functional web applications with React and Next.js.
        </p>
        <div className="flex gap-4">
          <Link
            href="/projects"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            View Projects
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Contact Me
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/projects"
            className="text-blue-500 hover:underline"
          >
            View all projects →
          </Link>
        </div>
      </section>
    </div>
  );
}
```

### Content Library

```jsx
// lib/content.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const projectsDirectory = path.join(process.cwd(), 'content/projects');
const blogDirectory = path.join(process.cwd(), 'content/blog');

export async function getProjects() {
  const files = fs.readdirSync(projectsDirectory);
  
  const projects = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(projectsDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      return {
        slug: file.replace('.mdx', ''),
        ...data,
        content,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return projects;
}

export async function getProject(slug) {
  const filePath = path.join(projectsDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) return null;
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  return { slug, ...data, content };
}

export async function getBlogPosts() {
  const files = fs.readdirSync(blogDirectory);
  
  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(blogDirectory, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContent);
      
      return {
        slug: file.replace('.mdx', ''),
        ...data,
        content,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return posts;
}

export async function getBlogPost(slug) {
  const filePath = path.join(blogDirectory, `${slug}.mdx`);
  
  if (!fs.existsSync(filePath)) return null;
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContent);
  
  return { slug, ...data, content };
}
```

### Components

```jsx
// components/Header.js
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          YN
        </Link>
        
        <nav className="flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

// components/ProjectCard.js
import Link from 'next/link';
import Image from 'next/image';

export function ProjectCard({ project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
    >
      <div className="relative h-48">
        <Image
          src={project.image || '/placeholder.jpg'}
          alt={project.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-2">{project.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// components/ThemeToggle.js
'use client';

import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(saved);
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Contact Form

```jsx
// app/contact/page.js
import { ContactForm } from '@/components/ContactForm';

export const metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <div className="container py-16">
      <h1 className="text-4xl font-bold mb-8">Get in Touch</h1>
      <div className="max-w-lg">
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Have a project in mind? Let's talk about it.
        </p>
        <ContactForm />
      </div>
    </div>
  );
}

// components/ContactForm.js
'use client';

import { useActionState } from 'react';
import { submitContact } from '@/app/actions';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
          Thanks for your message! I'll get back to you soon.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <input
          name="name"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          name="email"
          type="email"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          name="message"
          rows={5}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
      >
        {isPending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

### Server Actions

```jsx
// app/actions.js
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitContact(prevState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // Validation
  if (!name || name.length < 2) {
    return { error: 'Name must be at least 2 characters' };
  }

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email' };
  }

  if (!message || message.length < 10) {
    return { error: 'Message must be at least 10 characters' };
  }

  try {
    await prisma.contact.create({
      data: { name, email, message },
    });

    return { success: true };
  } catch (error) {
    console.error('Contact form error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}
```

### Sample Content

```mdx
---
title: "E-commerce Platform"
description: "A full-stack e-commerce solution with Next.js and Stripe"
date: "2024-01-15"
image: "/projects/ecommerce.jpg"
tags: ["Next.js", "Stripe", "Prisma", "Tailwind"]
github: "https://github.com/username/ecommerce"
demo: "https://ecommerce-demo.vercel.app"
---

## Overview

This e-commerce platform provides a complete shopping experience...

## Features

- Product catalog with search and filtering
- Shopping cart with persistent storage
- Stripe checkout integration
- Order management dashboard

## Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma
- **Database:** PostgreSQL
- **Payments:** Stripe
```

## Deployment

```bash
# Build and test locally
npm run build
npm start

# Deploy to Vercel
vercel

# Or push to GitHub and connect to Vercel
git push origin main
```

## Project Extensions

Once the basic portfolio is complete, consider adding:

1. **Newsletter signup** with email service integration
2. **View counter** for blog posts
3. **Comments** on blog posts
4. **Project filtering** by technology
5. **Search functionality**
6. **RSS feed** for blog
7. **Sitemap generation**
8. **Analytics integration**

## Conclusion

Congratulations! You've built a complete, production-ready developer portfolio using Next.js. This project demonstrates:

- App Router with file-based routing
- Server and Client Components
- Server Actions for form handling
- Prisma for database operations
- Tailwind CSS for styling
- Dark mode implementation
- SEO with metadata API
- Content management with MDX

Use this as a foundation and customize it to showcase your work!

---

**Congratulations on completing the Next.js Fundamentals course!**

Return to [Resources & References](./17-resources-references.md) for continued learning, or check the [Quick Reference](./18-quick-reference.md) for a handy cheat sheet.
