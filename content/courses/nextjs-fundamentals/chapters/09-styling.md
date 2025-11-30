# Chapter 9: Styling in Next.js

## Overview

Next.js supports multiple styling approaches out of the box. This chapter covers CSS Modules for component-scoped styles and Tailwind CSS for utility-first styling—the two most popular approaches in the Next.js ecosystem.

## Styling Options in Next.js

| Approach | Scoping | Best For |
|----------|---------|----------|
| **CSS Modules** | Component-level | Traditional CSS, team familiarity |
| **Tailwind CSS** | Utility classes | Rapid development, consistency |
| **Global CSS** | Application-wide | Base styles, resets |
| **CSS-in-JS** | Component-level | Dynamic styles (some limitations with Server Components) |

## Global Styles

Global styles apply to your entire application:

```css
/* app/globals.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}
```

```tsx
// app/layout.tsx
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## What You'll Learn

### [9.1 CSS Modules](./09.1-css-modules.md)
- Creating and using CSS Modules
- Naming conventions
- Composing styles
- Dynamic class names

### [9.2 Tailwind CSS](./09.2-tailwind-css.md)
- Setup and configuration
- Utility classes
- Responsive design
- Custom configurations

### [9.3 Global Styles & Best Practices](./09.3-global-styles.md)
- CSS resets and base styles
- CSS variables
- Organizing stylesheets
- Performance considerations

## Quick Comparison

### CSS Modules

```tsx
// components/Button.module.css
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: blue;
  color: white;
}

.button:hover {
  background: darkblue;
}

// components/Button.tsx
import styles from './Button.module.css';

export function Button({ children }) {
  return <button className={styles.button}>{children}</button>;
}
```

### Tailwind CSS

```tsx
// components/Button.tsx
export function Button({ children }) {
  return (
    <button className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-700">
      {children}
    </button>
  );
}
```

## Key Takeaways

- CSS Modules provide automatic scoping with `.module.css` files
- Tailwind CSS enables rapid styling with utility classes
- Global styles go in `app/globals.css` and are imported in the root layout
- Both approaches work well with Server Components

## Resources

- [Next.js: CSS Modules](https://nextjs.org/docs/app/building-your-application/styling/css-modules)
- [Next.js: Tailwind CSS](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

