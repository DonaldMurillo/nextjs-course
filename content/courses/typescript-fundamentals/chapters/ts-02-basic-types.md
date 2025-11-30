# Chapter 2: Basic Types & Type Annotations

## Overview

TypeScript adds type annotations to JavaScript. This chapter covers the fundamental types you'll use daily in Next.js development.

## Type Annotations

Add a colon and type after variable names:

```ts
// Variables
let name: string = "Alice";
let age: number = 30;
let isActive: boolean = true;

// TypeScript often infers types - annotations optional
let name = "Alice";     // TypeScript knows this is string
let age = 30;           // TypeScript knows this is number
let isActive = true;    // TypeScript knows this is boolean
```

**Rule of thumb:** Let TypeScript infer when it can. Add annotations when it can't or when you want to be explicit.

## Primitive Types

```ts
// string
let title: string = "Hello";
let template: string = `Hello, ${name}`;

// number (integers and floats)
let count: number = 42;
let price: number = 19.99;
let hex: number = 0xff;

// boolean
let isDone: boolean = false;

// null and undefined
let nothing: null = null;
let notDefined: undefined = undefined;

// symbol (rarely used)
let sym: symbol = Symbol("key");

// bigint (for very large numbers)
let big: bigint = 100n;
```

## Arrays

```ts
// Two syntaxes - both mean the same thing
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["Alice", "Bob"];

// Mixed arrays (less common)
let mixed: (string | number)[] = [1, "two", 3];

// Array of objects
let users: { name: string; age: number }[] = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
];
```

## Objects

```ts
// Inline object type
let user: { name: string; age: number } = {
  name: "Alice",
  age: 30,
};

// Optional properties with ?
let config: { debug?: boolean; timeout: number } = {
  timeout: 5000,
  // debug is optional
};

// Readonly properties
let point: { readonly x: number; readonly y: number } = {
  x: 10,
  y: 20,
};
point.x = 5; // ❌ Error: Cannot assign to 'x' because it is read-only
```

## Union Types

A value can be one of several types:

```ts
// string OR number
let id: string | number;
id = "abc";  // ✅
id = 123;    // ✅
id = true;   // ❌ Error

// Common pattern: value OR null
let user: User | null = null;

// Literal unions (specific values)
type Status = "pending" | "approved" | "rejected";
let orderStatus: Status = "pending";  // ✅
orderStatus = "cancelled";            // ❌ Error: not in union
```

## Literal Types

Narrow types to specific values:

```ts
// Specific strings
let direction: "left" | "right" | "up" | "down";
direction = "left";    // ✅
direction = "forward"; // ❌ Error

// Specific numbers
let dice: 1 | 2 | 3 | 4 | 5 | 6;
dice = 3;  // ✅
dice = 7;  // ❌ Error

// Boolean shortcuts
type Yes = true;
type LoadingState = true | false;  // Same as boolean
```

## Any, Unknown, Never

```ts
// any - Turns off type checking (avoid when possible)
let anything: any = "hello";
anything = 42;
anything.foo.bar;  // No error, but might crash at runtime!

// unknown - Safe "any" (must check before using)
let uncertain: unknown = "hello";
uncertain.toUpperCase();           // ❌ Error: Object is of type 'unknown'
if (typeof uncertain === "string") {
  uncertain.toUpperCase();         // ✅ Now TypeScript knows it's a string
}

// never - Impossible values (functions that never return)
function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

## Type Inference

TypeScript is smart—it infers types automatically:

```ts
// TypeScript infers these types
let name = "Alice";           // string
let count = 42;               // number
let items = [1, 2, 3];        // number[]
let user = { name: "Alice" }; // { name: string }

// Inference from functions
function double(n: number) {
  return n * 2;  // Return type inferred as number
}

// Inference from context
const names = ["Alice", "Bob"];
names.map(name => name.toUpperCase());  // name inferred as string
```

**When inference isn't enough:**

```ts
// Empty array - TypeScript doesn't know what goes in it
let items = [];        // any[] - not helpful
let items: string[] = []; // ✅ Now TypeScript knows

// Function parameters - always need annotations
function greet(name) { }        // ❌ 'name' implicitly has 'any' type
function greet(name: string) { } // ✅
```

## Type Assertions

Tell TypeScript you know more than it does:

```ts
// as syntax (preferred)
const input = document.getElementById("name") as HTMLInputElement;
input.value = "Alice";  // Now TypeScript knows it's an input

// angle-bracket syntax (doesn't work in JSX)
const input = <HTMLInputElement>document.getElementById("name");

// Non-null assertion (use sparingly!)
const element = document.getElementById("app")!;  // Trust me, it exists
```

**Warning:** Assertions override TypeScript's checks. Use carefully!

```ts
// This compiles but crashes at runtime
const user = {} as { name: string };
console.log(user.name.toUpperCase()); // Runtime error!
```

## const Assertions

Make literals as narrow as possible:

```ts
// Without const assertion
let config = { api: "/users", method: "GET" };
// Type: { api: string; method: string }

// With const assertion
let config = { api: "/users", method: "GET" } as const;
// Type: { readonly api: "/users"; readonly method: "GET" }

// Useful for arrays that shouldn't change
const colors = ["red", "green", "blue"] as const;
// Type: readonly ["red", "green", "blue"]
```

## Practical Examples

### API Response Handling

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

// Fetch returns unknown JSON
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: User = await response.json();
  return data;
}

// Now usage is fully typed
const user = await fetchUser(1);
console.log(user.name);  // Autocomplete works!
```

### Form Data

```ts
type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

function handleSubmit(data: FormData) {
  console.log(data.email);      // ✅
  console.log(data.username);   // ❌ Error: property doesn't exist
}
```

### Configuration Objects

```ts
type Config = {
  apiUrl: string;
  timeout: number;
  retries?: number;           // Optional
  headers?: Record<string, string>;  // Optional object
};

const config: Config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  // retries and headers are optional
};
```

## Common Patterns

### String or Number ID

```ts
type ID = string | number;

function getUser(id: ID) {
  // Works with both "abc" and 123
}
```

### Nullable Values

```ts
type MaybeUser = User | null;
type OptionalString = string | undefined;

function greet(name: string | null) {
  if (name === null) {
    return "Hello, stranger!";
  }
  return `Hello, ${name}!`;
}
```

### Constrained Strings

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Theme = "light" | "dark" | "system";
type Size = "sm" | "md" | "lg" | "xl";
```

## Key Takeaways

- TypeScript infers types automatically when possible
- Add annotations for function parameters and when inference isn't enough
- Use union types (`|`) for values that can be multiple types
- Use literal types for specific allowed values
- Avoid `any`; use `unknown` if you need a flexible type
- Use assertions (`as`) sparingly and carefully
- `const` assertions create narrow, readonly types

## Questions & Answers

### Q: Should I annotate everything?
**A:** No. Let TypeScript infer where it can. Annotate function parameters, and add types when inference isn't specific enough.

### Q: What's the difference between `null` and `undefined`?
**A:** `null` means "intentionally empty." `undefined` means "not yet assigned." In practice, most code uses `null` for "no value" and TypeScript handles both.

### Q: When should I use type assertions?
**A:** When you have more information than TypeScript (like knowing a DOM element's type). Avoid using assertions to silence errors—fix the underlying type issue instead.

## Resources

- [TypeScript: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)

---

**Next:** [Chapter 3: Objects, Interfaces & Type Aliases](./03-objects-interfaces.md)
