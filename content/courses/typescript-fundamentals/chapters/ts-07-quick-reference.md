# Chapter 7: TypeScript Quick Reference

## Basic Types

```ts
// Primitives
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let n: null = null;
let u: undefined = undefined;

// Arrays
let nums: number[] = [1, 2, 3];
let strs: Array<string> = ["a", "b"];

// Tuples
let tuple: [string, number] = ["hello", 42];

// Any & Unknown
let any: any = "anything";      // Avoid
let unknown: unknown = "safe";  // Must check before use

// Literal Types
let direction: "left" | "right" = "left";
let dice: 1 | 2 | 3 | 4 | 5 | 6 = 3;
```

## Objects & Interfaces

```ts
// Type alias
type User = {
  id: number;
  name: string;
  email?: string;        // Optional
  readonly role: string; // Immutable
};

// Interface
interface Product {
  id: number;
  name: string;
  price: number;
}

// Extend
interface Admin extends User {
  permissions: string[];
}

// Intersection
type AdminUser = User & { permissions: string[] };

// Index signature
type Dictionary = { [key: string]: string };
type Dict = Record<string, string>;  // Same thing
```

## Functions

```ts
// Basic function
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Arrow function
const add = (a: number, b: number): number => a + b;

// Optional & default params
function log(msg: string, level: string = "info"): void {
  console.log(`[${level}] ${msg}`);
}

// Rest params
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}

// Function type
type Callback = (data: string) => void;
```

## Generics

```ts
// Generic function
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Generic type
type Response<T> = {
  data: T;
  status: number;
};

// Generic with constraint
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

// Multiple generics
function pair<T, U>(a: T, b: U): [T, U] {
  return [a, b];
}
```

## Utility Types

```ts
type User = { id: number; name: string; email: string };

Partial<User>        // All optional
Required<User>       // All required
Readonly<User>       // All readonly
Pick<User, "id">     // { id: number }
Omit<User, "email">  // { id: number; name: string }
Record<string, User> // { [key: string]: User }

// Array element type
type Item = User[];
type SingleUser = Item[number];  // User

// Return type
type Result = ReturnType<typeof getUser>;  // Whatever getUser returns
```

## Type Guards

```ts
// typeof
if (typeof value === "string") {
  value.toUpperCase();  // TypeScript knows it's string
}

// in
if ("name" in obj) {
  obj.name;  // TypeScript knows name exists
}

// instanceof
if (error instanceof Error) {
  error.message;
}

// Custom type guard
function isUser(obj: unknown): obj is User {
  return typeof obj === "object" && obj !== null && "name" in obj;
}
```

## React Types

```tsx
// Props
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

// Event handlers
onChange: React.ChangeEvent<HTMLInputElement>
onClick: React.MouseEvent<HTMLButtonElement>
onSubmit: React.FormEvent<HTMLFormElement>
onKeyDown: React.KeyboardEvent<HTMLInputElement>

// Hooks
const [state, setState] = useState<User | null>(null);
const ref = useRef<HTMLInputElement>(null);
const context = useContext<ThemeContext>(ThemeContext);

// Extending HTML elements
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};
```

## Next.js Types

```tsx
// Page props (Next.js 15+)
type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

// Layout props
type LayoutProps = {
  children: React.ReactNode;
};

// Metadata
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Page" };

// Route handler
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: "hello" });
}

// Server Action
"use server";
export async function action(formData: FormData): Promise<{ error?: string }> {
  const name = formData.get("name") as string;
  return {};
}
```

## Common Patterns

```ts
// Nullable
type MaybeUser = User | null;

// API Response
type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// Form state
type FormState = {
  values: Record<string, string>;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
};

// Discriminated union
type Action =
  | { type: "loading" }
  | { type: "success"; data: User }
  | { type: "error"; message: string };

// Extract from union
type SuccessAction = Extract<Action, { type: "success" }>;
```

## Type Assertions

```ts
// as syntax
const input = document.getElementById("input") as HTMLInputElement;

// Non-null assertion (use sparingly!)
const element = document.getElementById("app")!;

// const assertion
const config = { api: "/users" } as const;
// Type: { readonly api: "/users" }
```

## Imports

```ts
// Type-only import (doesn't include in bundle)
import type { User } from "./types";

// Mixed import
import { getUser, type User } from "./api";
```

## tsconfig.json (Next.js)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Quick Tips

| Do | Don't |
|----|-------|
| Let TS infer when possible | Annotate everything |
| Use `unknown` for unknown types | Use `any` |
| Use type guards | Use type assertions to silence errors |
| Use `type` for unions/primitives | Force interface for everything |
| Use `interface` for objects/APIs | Mix approaches randomly |
| Import `type` for type-only imports | Import types as values |

## Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + .` | Quick fix / auto-import |
| `F2` | Rename symbol |
| `F12` | Go to definition |
| `Ctrl/Cmd + Shift + F12` | Find all references |
| `Ctrl/Cmd + Space` | Trigger autocomplete |
| `Ctrl/Cmd + Shift + Space` | Show parameter hints |

---

**Course Complete!** 🎉

You now know TypeScript for Next.js development. Key skills:
- Type primitives, objects, arrays, and functions
- Use generics for reusable, type-safe code
- Type React components, hooks, and events
- Type Next.js pages, actions, and API routes

Happy coding with TypeScript!
