# The App Router

The App Router is the recommended way to build Next.js applications. It uses React Server Components by default.

## File-based Routing

Pages are created by adding files to the `app` directory:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/blog/[slug]/page.tsx` → `/blog/:slug`

## Layouts

Layouts are UI shared between multiple pages:

```tsx
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
```

## Dynamic Routes

Use square brackets for dynamic segments:

```
app/blog/[slug]/page.tsx
```

Access the parameter:

```tsx
export default function Page({ params }: { params: { slug: string } }) {
  return <div>Post: {params.slug}</div>
}
```
