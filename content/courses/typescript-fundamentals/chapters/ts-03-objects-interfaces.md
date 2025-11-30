# Chapter 3: Objects, Interfaces & Type Aliases

## Overview

Objects are everywhere in JavaScript and TypeScript. This chapter covers how to define object shapes using type aliases and interfaces—the two main ways to create reusable types.

## Type Aliases

Create a named type with the `type` keyword:

```ts
// Define a type
type User = {
  id: number;
  name: string;
  email: string;
};

// Use it
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};

// Use it in functions
function createUser(data: User): User {
  return data;
}
```

## Interfaces

Create a named object type with `interface`:

```ts
// Define an interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Usage is identical to type alias
const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
};
```

## Type Alias vs Interface

Both work for objects. Key differences:

```ts
// Type alias - can represent ANY type
type ID = string | number;           // Union
type Status = "active" | "inactive"; // Literal union
type Point = [number, number];       // Tuple
type Callback = () => void;          // Function

// Interface - only for object shapes
interface User {
  name: string;
}

// Interfaces can be extended/merged
interface User {
  age: number;  // Adds to existing User interface
}

// Types cannot be merged
type User = { name: string };
type User = { age: number };  // ❌ Error: Duplicate identifier
```

**Recommendation:** 
- Use `type` for unions, primitives, tuples
- Use `interface` for objects (especially in libraries)
- Be consistent within a project—either is fine

## Optional Properties

```ts
type User = {
  id: number;
  name: string;
  email?: string;      // Optional - might be undefined
  nickname?: string;   // Optional
};

const user: User = {
  id: 1,
  name: "Alice",
  // email and nickname can be omitted
};

// Access optional properties safely
console.log(user.email?.toUpperCase());  // Optional chaining
console.log(user.nickname ?? "No nickname");  // Nullish coalescing
```

## Readonly Properties

```ts
type Config = {
  readonly apiKey: string;
  readonly baseUrl: string;
  timeout: number;  // Can be changed
};

const config: Config = {
  apiKey: "secret",
  baseUrl: "https://api.example.com",
  timeout: 5000,
};

config.timeout = 10000;  // ✅ Allowed
config.apiKey = "new";   // ❌ Error: Cannot assign to 'apiKey'
```

## Extending Types

### Interface Extends

```ts
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
  bark(): void;
}

const dog: Dog = {
  name: "Rex",
  breed: "German Shepherd",
  bark() { console.log("Woof!"); },
};
```

### Type Intersection (&)

```ts
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
  bark(): void;
};

// Same result as interface extends
const dog: Dog = {
  name: "Rex",
  breed: "German Shepherd",
  bark() { console.log("Woof!"); },
};
```

### Combining Multiple Types

```ts
type HasId = { id: number };
type HasTimestamps = { createdAt: Date; updatedAt: Date };
type HasName = { name: string };

// Combine all three
type User = HasId & HasTimestamps & HasName & {
  email: string;
};

// Equivalent to:
type User = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  email: string;
};
```

## Index Signatures

When you don't know property names ahead of time:

```ts
// String keys, string values
type Dictionary = {
  [key: string]: string;
};

const colors: Dictionary = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
};

// Mixed: known + dynamic properties
type User = {
  id: number;
  name: string;
  [key: string]: string | number;  // Additional dynamic properties
};
```

## Record Type

A cleaner way to define dictionaries:

```ts
// Record<KeyType, ValueType>
type Dictionary = Record<string, string>;

// More specific keys
type Sizes = Record<"sm" | "md" | "lg", number>;

const sizes: Sizes = {
  sm: 12,
  md: 16,
  lg: 20,
};

// Practical example: form errors
type FormErrors = Record<string, string>;

const errors: FormErrors = {
  email: "Invalid email",
  password: "Too short",
};
```

## Nested Objects

```ts
type Address = {
  street: string;
  city: string;
  country: string;
  zipCode?: string;
};

type User = {
  id: number;
  name: string;
  address: Address;
  billingAddress?: Address;  // Optional nested object
};

const user: User = {
  id: 1,
  name: "Alice",
  address: {
    street: "123 Main St",
    city: "New York",
    country: "USA",
  },
};
```

## Practical Patterns

### API Response Types

```ts
// Generic API response wrapper
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// Specific responses
type User = { id: number; name: string };
type UserResponse = ApiResponse<User>;
type UsersResponse = ApiResponse<User[]>;

// Paginated response
type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

type UsersPage = PaginatedResponse<User>;
```

### Form State

```ts
type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
};

type LoginForm = {
  email: FormField<string>;
  password: FormField<string>;
  rememberMe: FormField<boolean>;
};
```

### Component Props

```ts
type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
};
```

### Database Models

```ts
// Base model with common fields
type BaseModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

type User = BaseModel & {
  email: string;
  name: string;
  role: "user" | "admin";
};

type Post = BaseModel & {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
};
```

## Utility Types (Preview)

TypeScript provides built-in utilities:

```ts
type User = {
  id: number;
  name: string;
  email: string;
};

// All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string }

// All properties required
type RequiredUser = Required<User>;

// All properties readonly
type ReadonlyUser = Readonly<User>;

// Pick specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit specific properties
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string }
```

## Key Takeaways

- Use `type` for unions, primitives, tuples, and functions
- Use `interface` for object shapes (especially in shared code)
- Mark optional properties with `?`
- Mark immutable properties with `readonly`
- Extend interfaces with `extends`, combine types with `&`
- Use `Record<K, V>` for dictionaries
- Compose types from smaller, reusable pieces

## Questions & Answers

### Q: When should I use `interface` vs `type`?
**A:** Both work for objects. Use `interface` for public APIs and when you might extend later. Use `type` when you need unions or tuples. Most importantly, be consistent.

### Q: Can I have optional properties that can't be `null`?
**A:** Optional means `T | undefined`. If you want `T | null`, be explicit:
```ts
type User = {
  nickname: string | null;  // Can be null, but must be present
  bio?: string;             // Can be missing or undefined
};
```

### Q: How do I make all nested properties readonly?
**A:** `Readonly<T>` is shallow. For deep readonly, use a library like `ts-essentials` or create a recursive type.

## Resources

- [TypeScript: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

---

**Next:** [Chapter 4: Functions & Generics](./04-functions-generics.md)
