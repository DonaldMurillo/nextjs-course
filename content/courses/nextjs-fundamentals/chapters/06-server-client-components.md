# Chapter 6: Server Components vs Client Components

## Overview

The distinction between Server Components and Client Components is the most important concept in Next.js 15. It changes how you think about building React applications—instead of everything running in the browser, you now choose where each component executes.

This chapter explains the mental model, when to use each type, and how they work together.

## The Paradigm Shift

Traditional React (before Server Components):
```
Browser loads JavaScript → React renders UI → User interacts → More JavaScript runs
```

Everything happened in the browser. Your database queries needed an API. Your components were bundled and shipped to users. Large applications meant large JavaScript bundles.

Next.js with Server Components:
```
Server renders components → HTML + minimal JS sent → User sees content immediately
Browser hydrates interactive parts → User interacts
```

Server Components run on the server and send HTML. Client Components run in the browser for interactivity. You choose the right tool for each job.

## Server Components

Server Components (SC) are the default in the App Router. They:
- Execute on the server
- Can directly access databases, file systems, and backend services
- Send zero JavaScript to the browser
- Cannot use hooks or browser APIs

```tsx
// app/page.tsx
// This is a Server Component by default

async function getProducts() {
  // Direct database access - no API needed!
  const products = await db.products.findMany();
  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <main>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </main>
  );
}
```

No `useEffect`, no loading states to manage, no API routes to create. The component fetches data and renders HTML on the server.

## Client Components

Client Components (CC) run in the browser. They:
- Enable interactivity (clicks, inputs, state)
- Can use hooks (useState, useEffect, etc.)
- Can access browser APIs (window, localStorage)
- Are bundled and sent to the browser

Mark a component as a Client Component with `"use client"`:

```tsx
// components/Counter.tsx
"use client";

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

The `"use client"` directive must be at the top of the file, before any imports.

## The Good

### Performance
Server Components send zero JavaScript for static content. A complex dashboard with charts, tables, and text might be mostly Server Components, with only the interactive filters being Client Components. Users download less JavaScript.

### Security
Server Components can access secrets, API keys, and databases directly. These never reach the browser. No need to create API endpoints just to hide implementation details.

### SEO and Initial Load
Content renders on the server as HTML. Search engines see complete pages. Users see content before JavaScript loads.

### Simplified Data Fetching
No more `useEffect` + loading state + error handling dance for simple data fetching. Just `await` your data.

### Direct Backend Access
Query your database, read files, call internal services—all directly in your components without intermediary APIs.

## The Bad

### Mental Model Complexity
You must constantly think about where code runs. Some React patterns don't work in Server Components. Moving code between client and server requires changes.

### The Boundary Is Infectious
Once you mark a component with `"use client"`, everything it imports becomes client-side too. This can accidentally pull more into the bundle than intended.

### Debugging Is Harder
Errors can occur on server or client. Understanding where a problem originated requires understanding which component is which type.

### Third-Party Library Compatibility
Not all libraries work in Server Components. Libraries using hooks, browser APIs, or React context need `"use client"`.

## The Ugly

### Serialization Constraints
Props passed from Server to Client Components must be serializable. No functions, no Date objects (without conversion), no class instances.

```tsx
// ❌ Can't pass functions from Server to Client
<ClientComponent onClick={handleClick} />

// ❌ Can't pass Date objects
<ClientComponent date={new Date()} />

// ✅ Pass serializable data
<ClientComponent date={date.toISOString()} />
```

### Error Messages
When you accidentally use a hook in a Server Component, error messages can be cryptic, especially in production.

### Hydration Mismatches
If server and client render different content, you get hydration errors. This happens with date/time formatting, random values, or conditional rendering based on browser state.

## When to Use Each

### Use Server Components When:
- Fetching data
- Accessing backend resources directly
- Keeping sensitive information on the server
- Reducing client-side JavaScript
- The component doesn't need interactivity

### Use Client Components When:
- Using event handlers (onClick, onChange)
- Using state (useState, useReducer)
- Using effects (useEffect)
- Using browser APIs (window, localStorage)
- Using custom hooks that depend on state/effects
- Using React Context

### Quick Decision Flow

```
Does it need useState, useEffect, or event handlers?
├─ Yes → Client Component
└─ No
   Does it need browser APIs (window, localStorage)?
   ├─ Yes → Client Component
   └─ No → Server Component (default)
```

## The Composition Model

Server Components can import and render Client Components. Client Components cannot import Server Components (but can render them as children).

```tsx
// app/page.tsx (Server Component)
import { InteractiveWidget } from '@/components/InteractiveWidget';

export default async function Page() {
  const data = await fetchData();
  
  return (
    <main>
      <h1>Dashboard</h1>
      <p>Static content rendered on server</p>
      <InteractiveWidget initialData={data} />
    </main>
  );
}
```

```tsx
// components/InteractiveWidget.tsx (Client Component)
"use client";

import { useState } from 'react';

export function InteractiveWidget({ initialData }) {
  const [data, setData] = useState(initialData);
  
  return (
    <div onClick={() => setData(/*...*/)}>
      {/* Interactive UI */}
    </div>
  );
}
```

## What You'll Learn

This chapter is divided into sub-chapters:

### [6.1 The Mental Model](./06.1-mental-model.md)
- How Server and Client Components work
- The render lifecycle
- Data flow between components
- The "use client" boundary

### [6.2 Composition Patterns](./06.2-composition-patterns.md)
- Mixing Server and Client Components
- The children pattern
- Provider patterns
- Component organization strategies

### [6.3 Common Mistakes & Gotchas](./06.3-common-mistakes.md)
- Serialization errors
- Hydration mismatches
- Import issues
- Performance anti-patterns

## Key Takeaways

- Server Components run on the server, send HTML, and ship no JS
- Client Components run in the browser for interactivity
- Components are Server Components by default in the App Router
- Use `"use client"` to mark Client Components
- Server Components can render Client Components
- Props between them must be serializable
- Choose based on whether you need interactivity or hooks

## Questions & Answers

### Q: Are Server Components new to React or Next.js?
**A:** Server Components are a React feature, but Next.js provides the most mature implementation. React introduced them; Next.js made them practical.

### Q: Can I use Server Components without Next.js?
**A:** Eventually, yes. The React team is working on other implementations, but Next.js is currently the primary way to use them.

### Q: Does "use client" make my whole app client-side?
**A:** No. It marks a boundary. That component and its imports are client-side, but the rest of your app can still be Server Components.

### Q: Why can't Client Components import Server Components?
**A:** Client Components run in the browser, which can't execute Server Component code. Server Components may access databases or secrets that can't exist in the browser.

### Q: Are Client Components bad?
**A:** No! They're essential for interactivity. The goal isn't to avoid them but to use each type appropriately. Interactive UIs need Client Components.

### Q: Do Server Components make SPAs obsolete?
**A:** Not exactly. Server Components are great for content-heavy pages and initial loads. Complex interactive applications (like Figma or VS Code web) still benefit from heavy client-side code.

## Resources

- [Next.js: Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js: Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React: Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Dan Abramov: Server Components Intro](https://github.com/reactwg/server-components/discussions/5)

---

**Next:** [6.1 The Mental Model](./06.1-mental-model.md) - Understand how Server and Client Components really work.
