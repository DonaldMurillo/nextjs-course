# Chapter 8: Server Actions & Forms

## Overview

Server Actions are async functions that run on the server. They're the primary way to handle form submissions and data mutations in Next.js. Instead of creating API routes, you define functions that execute server-side and can be called from Client Components.

## What Are Server Actions?

Server Actions are functions marked with `"use server"` that run exclusively on the server:

```tsx
// app/actions.ts
"use server";

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  await db.posts.create({
    data: { title, content }
  });
  
  revalidatePath('/posts');
}
```

Call them from forms or Client Components:

```tsx
// app/posts/new/page.tsx
import { createPost } from '@/app/actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## The Good

### No API Routes Needed
For simple mutations, Server Actions eliminate the need to create separate API routes. Define the action and use it directly.

### Progressive Enhancement
Forms using Server Actions work without JavaScript. The form submits traditionally, the server processes it, and returns a response. When JS loads, it enhances with client-side handling.

### Type Safety
With TypeScript, Server Actions provide end-to-end type safety between client and server.

### Automatic Revalidation
Call `revalidatePath` or `revalidateTag` inside actions to update cached data after mutations.

### Integrated with React
Use `useFormStatus` and `useActionState` hooks for loading states and form state management.

## The Bad

### Learning Curve
The `"use server"` directive and how actions work with forms requires new mental models.

### Limited Return Values
Actions can only return serializable data. Complex objects, errors, and types need careful handling.

### Security Considerations
Actions are public endpoints. Anyone can call them. Always validate and authorize.

## The Ugly

### Error Handling Complexity
Handling errors gracefully while maintaining progressive enhancement requires careful design.

### Form State Management
Managing form state across submissions, especially with validation errors, can get complex.

## Creating Server Actions

### In Separate Files (Recommended)

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';

export async function createPost(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  
  const post = await db.posts.create({
    data: { title, content }
  });
  
  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}

export async function deletePost(postId) {
  await db.posts.delete({ where: { id: postId } });
  revalidatePath('/posts');
}
```

### Inline in Server Components

```tsx
// app/posts/page.tsx
export default function PostsPage() {
  async function deletePost(formData) {
    "use server";
    const id = formData.get('id');
    await db.posts.delete({ where: { id } });
    revalidatePath('/posts');
  }
  
  return (
    <form action={deletePost}>
      <input type="hidden" name="id" value={postId} />
      <button type="submit">Delete</button>
    </form>
  );
}
```

## What You'll Learn

This chapter is divided into sub-chapters:

### [8.1 Server Actions Basics](./08.1-server-actions-basics.md)
- Creating and using Server Actions
- Form submissions
- Passing arguments
- Return values

### [8.2 Form Handling & Validation](./08.2-form-handling-validation.md)
- useFormStatus for loading states
- useActionState for form state
- Validation patterns
- Error handling

### [8.3 Optimistic Updates](./08.3-optimistic-updates.md)
- useOptimistic hook
- Optimistic UI patterns
- Rollback on failure

## Key Takeaways

- Server Actions are async functions that run on the server
- Mark with `"use server"` at function or file level
- Use directly in form `action` prop
- Call `revalidatePath` or `revalidateTag` after mutations
- Forms work without JavaScript (progressive enhancement)
- Always validate and authorize in actions

## Questions & Answers

### Q: Are Server Actions just API routes?
**A:** Similar, but integrated differently. Actions are called like functions, work with forms natively, and don't require separate route files.

### Q: Can I call Server Actions from Client Components?
**A:** Yes! Import and call them directly. They execute on the server.

### Q: What about file uploads?
**A:** Use `formData.get('file')` to access uploaded files. Process them on the server.

### Q: How do I handle authentication in actions?
**A:** Check auth at the start of every action:
```tsx
"use server";
export async function action() {
  const user = await getUser();
  if (!user) throw new Error('Unauthorized');
  // ...
}
```

### Q: Can I use Server Actions outside of forms?
**A:** Yes! Call them from event handlers in Client Components:
```tsx
"use client";
import { likePost } from '@/app/actions';

function LikeButton({ postId }) {
  return <button onClick={() => likePost(postId)}>Like</button>;
}
```

## Resources

- [Next.js: Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [React: Server Actions](https://react.dev/reference/rsc/server-actions)
- [Next.js: Forms and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)

