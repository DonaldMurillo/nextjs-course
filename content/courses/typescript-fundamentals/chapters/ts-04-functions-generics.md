# Chapter 4: Functions & Generics

## Overview

Functions are the building blocks of any application. This chapter covers typing functions and introduces generics—TypeScript's way of creating reusable, type-safe code.

## Function Type Annotations

### Basic Functions

```ts
// Parameter and return types
function add(a: number, b: number): number {
  return a + b;
}

// Return type often inferred
function greet(name: string) {
  return `Hello, ${name}!`;  // Return type inferred as string
}

// Explicit return type (recommended for public APIs)
function getUser(id: number): User {
  return { id, name: "Alice", email: "alice@example.com" };
}
```

### Arrow Functions

```ts
// Full annotation
const add = (a: number, b: number): number => a + b;

// Inferred return type
const greet = (name: string) => `Hello, ${name}!`;

// With object return (wrap in parentheses)
const createUser = (name: string): User => ({
  id: Date.now(),
  name,
  email: "",
});
```

### Optional Parameters

```ts
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}!`;
}

greet("Alice");           // "Hello, Alice!"
greet("Alice", "Hi");     // "Hi, Alice!"
```

### Default Parameters

```ts
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

// Type is inferred from default value
function createUser(name: string, role = "user") {
  return { name, role };  // role is inferred as string
}
```

### Rest Parameters

```ts
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4);  // 10

// Mixed with regular parameters
function log(level: string, ...messages: string[]): void {
  console.log(`[${level}]`, ...messages);
}
```

## Function Types

### Type Alias for Functions

```ts
// Define function type
type MathOperation = (a: number, b: number) => number;

const add: MathOperation = (a, b) => a + b;
const subtract: MathOperation = (a, b) => a - b;

// Callback types
type OnSuccess = (data: User) => void;
type OnError = (error: Error) => void;

function fetchUser(onSuccess: OnSuccess, onError: OnError) {
  // ...
}
```

### Void vs Never

```ts
// void - Function doesn't return anything meaningful
function log(message: string): void {
  console.log(message);
}

// never - Function never returns (throws or infinite loop)
function fail(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

## Function Overloading

Define multiple signatures for one function:

```ts
// Overload signatures
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// Implementation signature
function format(value: string | number | Date): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toISOString();
}

format("hello");     // string input → string output
format(42);          // number input → string output
format(new Date());  // Date input → string output
```

## Generics

Generics let you write code that works with any type while keeping type safety.

### The Problem

```ts
// Without generics - loses type information
function first(arr: any[]): any {
  return arr[0];
}

const num = first([1, 2, 3]);     // Type is 'any', not 'number'
const str = first(["a", "b"]);   // Type is 'any', not 'string'
```

### The Solution

```ts
// With generics - preserves type information
function first<T>(arr: T[]): T {
  return arr[0];
}

const num = first([1, 2, 3]);     // Type is 'number'
const str = first(["a", "b"]);   // Type is 'string'

// T is a type parameter - like a variable for types
// TypeScript infers T from the argument
```

### Generic Syntax

```ts
// Function with generic
function identity<T>(value: T): T {
  return value;
}

// Arrow function with generic
const identity = <T>(value: T): T => value;

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

const result = pair("hello", 42);  // Type: [string, number]
```

### Generic Constraints

Limit what types can be used:

```ts
// Must have a 'length' property
function logLength<T extends { length: number }>(value: T): void {
  console.log(value.length);
}

logLength("hello");     // ✅ strings have length
logLength([1, 2, 3]);   // ✅ arrays have length
logLength(42);          // ❌ Error: number doesn't have length

// Must be an object with certain properties
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
getProperty(user, "name");  // ✅ Returns string
getProperty(user, "foo");   // ❌ Error: "foo" is not a key of user
```

### Common Generic Patterns

```ts
// Array operations
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
  return arr.map(fn);
}

// Nullable wrapper
function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

// Promise wrapper
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json();
}

// Usage with explicit type
const user = await fetchData<User>("/api/user");
```

### Generic Types

```ts
// Generic type alias
type Container<T> = {
  value: T;
};

type StringContainer = Container<string>;  // { value: string }
type NumberContainer = Container<number>;  // { value: number }

// Generic interface
interface Response<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = Response<User>;
type PostsResponse = Response<Post[]>;

// With default type
type Container<T = string> = {
  value: T;
};

type Default = Container;        // { value: string }
type NumBox = Container<number>; // { value: number }
```

## Practical Examples

### API Fetch Function

```ts
type ApiResponse<T> = {
  data: T;
  error?: string;
};

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`);
    const data: T = await response.json();
    return { data };
  } catch (error) {
    return { data: null as T, error: "Failed to fetch" };
  }
}

// Usage - type is inferred
const { data: user } = await fetchApi<User>("/users/1");
const { data: posts } = await fetchApi<Post[]>("/posts");
```

### Event Handler Types

```ts
type EventHandler<T> = (event: T) => void;

type ClickHandler = EventHandler<MouseEvent>;
type ChangeHandler = EventHandler<Event>;
type KeyHandler = EventHandler<KeyboardEvent>;

const handleClick: ClickHandler = (e) => {
  console.log(e.clientX, e.clientY);
};
```

### Form Handler

```ts
type FormValues = Record<string, string | number | boolean>;

function createFormHandler<T extends FormValues>(
  initialValues: T,
  onSubmit: (values: T) => void
) {
  let values = { ...initialValues };
  
  return {
    setValue<K extends keyof T>(key: K, value: T[K]) {
      values[key] = value;
    },
    submit() {
      onSubmit(values);
    },
  };
}

// Usage
const form = createFormHandler(
  { email: "", password: "", remember: false },
  (values) => console.log(values)
);

form.setValue("email", "test@example.com");  // ✅
form.setValue("email", 123);                 // ❌ Error: must be string
form.setValue("invalid", "test");            // ❌ Error: key doesn't exist
```

### useState-like Hook Pattern

```ts
function createState<T>(initial: T): [() => T, (value: T) => void] {
  let state = initial;
  
  const getState = () => state;
  const setState = (value: T) => { state = value; };
  
  return [getState, setState];
}

const [getCount, setCount] = createState(0);
setCount(10);        // ✅
setCount("hello");   // ❌ Error: must be number

const [getName, setName] = createState("Alice");
setName("Bob");      // ✅
setName(42);         // ❌ Error: must be string
```

## Key Takeaways

- Always type function parameters; return types can often be inferred
- Use `?` for optional parameters, default values provide implicit types
- Use type aliases to name function types for reusability
- Generics preserve type information through transformations
- Use `extends` to constrain generic types
- `keyof T` gets the union of all keys of type T
- `T[K]` gets the type of property K on type T

## Questions & Answers

### Q: When should I use generics?
**A:** When you want the same logic to work with different types while maintaining type safety. Common cases: array utilities, API wrappers, data structures, React hooks.

### Q: Can I have multiple generic constraints?
**A:** Yes, use `&`:
```ts
function process<T extends HasId & HasTimestamp>(item: T) { }
```

### Q: What's the difference between `<T>` and `<T = DefaultType>`?
**A:** Without default, T must be inferred or specified. With default, it's optional:
```ts
function fn<T = string>(value: T) { }
fn("hello");  // T is string (inferred)
fn(42);       // T is number (inferred)
fn();         // T is string (default) - but needs value!
```

## Resources

- [TypeScript: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

**Next:** [Chapter 5: React with TypeScript](./05-react-typescript.md)
