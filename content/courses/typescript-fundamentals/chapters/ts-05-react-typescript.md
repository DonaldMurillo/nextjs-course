# Chapter 5: React with TypeScript

## Overview

React and TypeScript work beautifully together. TypeScript ensures your components receive correct props, your state is used properly, and your event handlers are type-safe.

## Component Props

### Basic Props

```tsx
// Define props type
type GreetingProps = {
  name: string;
  age: number;
};

// Use in component
function Greeting({ name, age }: GreetingProps) {
  return <p>Hello, {name}! You are {age} years old.</p>;
}

// Usage - TypeScript checks props
<Greeting name="Alice" age={30} />  // ✅
<Greeting name="Alice" />            // ❌ Error: 'age' is missing
<Greeting name="Alice" age="30" />   // ❌ Error: 'age' must be number
```

### Optional Props

```tsx
type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";  // Optional
  disabled?: boolean;                  // Optional
};

function Button({ children, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button className={variant} disabled={disabled}>
      {children}
    </button>
  );
}

<Button>Click me</Button>                    // ✅ Defaults apply
<Button variant="secondary">Click</Button>  // ✅
```

### Children Prop

```tsx
// React.ReactNode - accepts anything renderable
type CardProps = {
  children: React.ReactNode;
  title: string;
};

function Card({ children, title }: CardProps) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// ReactNode accepts: strings, numbers, elements, arrays, null, undefined
<Card title="Welcome">
  <p>Some content</p>
  <button>Action</button>
</Card>
```

### Function Props (Callbacks)

```tsx
type SearchProps = {
  onSearch: (query: string) => void;
  onClear?: () => void;
};

function Search({ onSearch, onClear }: SearchProps) {
  const [query, setQuery] = useState("");
  
  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)} 
      />
      <button onClick={() => onSearch(query)}>Search</button>
      {onClear && <button onClick={onClear}>Clear</button>}
    </div>
  );
}

// Usage
<Search 
  onSearch={(query) => console.log(query)}  // query is typed as string
  onClear={() => console.log("Cleared")}
/>
```

## Event Handling

### Common Event Types

```tsx
function Form() {
  // Input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  
  // Form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  
  // Button click
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log(e.clientX, e.clientY);
  };
  
  // Keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // ...
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} onKeyDown={handleKeyDown} />
      <button onClick={handleClick}>Submit</button>
    </form>
  );
}
```

### Event Type Cheat Sheet

| Event | Type |
|-------|------|
| `onChange` (input) | `React.ChangeEvent<HTMLInputElement>` |
| `onChange` (select) | `React.ChangeEvent<HTMLSelectElement>` |
| `onChange` (textarea) | `React.ChangeEvent<HTMLTextAreaElement>` |
| `onClick` | `React.MouseEvent<HTMLButtonElement>` |
| `onSubmit` | `React.FormEvent<HTMLFormElement>` |
| `onKeyDown/Up` | `React.KeyboardEvent<HTMLInputElement>` |
| `onFocus/Blur` | `React.FocusEvent<HTMLInputElement>` |

### Inline Event Handlers

TypeScript infers types for inline handlers:

```tsx
// Type is inferred - no annotation needed
<input onChange={(e) => console.log(e.target.value)} />
<button onClick={(e) => console.log(e.clientX)} />
```

## useState

### Basic Usage

```tsx
// Type is inferred from initial value
const [count, setCount] = useState(0);        // number
const [name, setName] = useState("Alice");    // string
const [isOpen, setIsOpen] = useState(false);  // boolean

// Explicit type when needed
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);
```

### Complex State

```tsx
type FormState = {
  email: string;
  password: string;
  errors: Record<string, string>;
};

const [form, setForm] = useState<FormState>({
  email: "",
  password: "",
  errors: {},
});

// Update partial state
setForm(prev => ({ ...prev, email: "new@email.com" }));
```

## useRef

### DOM References

```tsx
function TextInput() {
  // Type the element, initialize with null
  const inputRef = useRef<HTMLInputElement>(null);
  
  const focus = () => {
    inputRef.current?.focus();  // Note the optional chaining
  };
  
  return <input ref={inputRef} />;
}
```

### Mutable Values

```tsx
function Timer() {
  // For mutable values that don't trigger re-renders
  const intervalRef = useRef<number | null>(null);
  
  const start = () => {
    intervalRef.current = window.setInterval(() => {
      console.log("tick");
    }, 1000);
  };
  
  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  
  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
```

## useEffect

```tsx
// No special typing needed - just type the data you use
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data: User = await response.json();
      setUser(data);
    }
    
    fetchUser();
  }, [userId]);  // TypeScript checks dependency array
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

## useReducer

```tsx
type State = {
  count: number;
  error: string | null;
};

type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset"; payload: number }
  | { type: "error"; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + 1 };
    case "decrement":
      return { ...state, count: state.count - 1 };
    case "reset":
      return { ...state, count: action.payload };
    case "error":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
      <button onClick={() => dispatch({ type: "reset", payload: 0 })}>
        Reset
      </button>
    </div>
  );
}
```

## useContext

```tsx
type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

// Create with undefined default, assert type when using
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook with type guard
function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

// Provider component
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  
  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Usage
function Header() {
  const { theme, toggleTheme } = useTheme();  // Fully typed!
  return <button onClick={toggleTheme}>{theme}</button>;
}
```

## Component Patterns

### Forwarding Refs

```tsx
type InputProps = React.ComponentProps<"input"> & {
  label: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        <label>{label}</label>
        <input ref={ref} {...props} />
      </div>
    );
  }
);

// Usage
const inputRef = useRef<HTMLInputElement>(null);
<Input ref={inputRef} label="Email" type="email" />
```

### Extending HTML Elements

```tsx
// Extend button props
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

function Button({ variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button className={variant} {...props}>
      {children}
    </button>
  );
}

// Now accepts all button attributes
<Button type="submit" disabled={loading} variant="primary">
  Submit
</Button>
```

### Polymorphic Components

```tsx
type BoxProps<T extends React.ElementType> = {
  as?: T;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Box<T extends React.ElementType = "div">({
  as,
  children,
  ...props
}: BoxProps<T>) {
  const Component = as || "div";
  return <Component {...props}>{children}</Component>;
}

// Usage
<Box>Default div</Box>
<Box as="section">As section</Box>
<Box as="a" href="/home">As link</Box>
```

## Key Takeaways

- Define prop types with `type` or `interface`
- Use `React.ReactNode` for children that render anything
- Event handlers have specific types like `React.ChangeEvent<HTMLInputElement>`
- `useState` infers types; use generics for complex/nullable state
- `useRef<Element>(null)` for DOM refs, use optional chaining
- Type `useReducer` actions as discriminated unions
- Create custom hooks with type guards for context

## Questions & Answers

### Q: Should I use `React.FC` for components?
**A:** No, it's fallen out of favor. Just type props directly:
```tsx
// ❌ Old way
const Button: React.FC<ButtonProps> = ({ children }) => { };

// ✅ Modern way
function Button({ children }: ButtonProps) { }
```

### Q: How do I type children that must be specific elements?
**A:** Use `React.ReactElement`:
```tsx
type TabsProps = {
  children: React.ReactElement<TabProps>[];
};
```

### Q: How do I get props from an existing component?
**A:** Use `React.ComponentProps`:
```tsx
type ButtonProps = React.ComponentProps<typeof Button>;
type InputProps = React.ComponentProps<"input">;
```

## Resources

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Docs: TypeScript](https://react.dev/learn/typescript)

---

**Next:** [Chapter 6: Next.js with TypeScript](./06-nextjs-typescript.md)
