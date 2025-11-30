# Chapter 1: What is Node.js?

## Overview

Node.js is a JavaScript runtime that lets you run JavaScript outside the browser. Before Node.js, JavaScript could only run in web browsers. Now you can use JavaScript to build servers, command-line tools, desktop apps, and more.

## The Simple Explanation

**JavaScript in the browser:** Makes websites interactive (buttons, forms, animations)

**JavaScript with Node.js:** Does everything else (servers, file operations, databases, APIs)

```
┌─────────────────────────────────────────────────────┐
│                    JavaScript                        │
├─────────────────────┬───────────────────────────────┤
│      Browser        │           Node.js             │
├─────────────────────┼───────────────────────────────┤
│ • DOM manipulation  │ • File system access          │
│ • User events       │ • Network operations          │
│ • Fetch API         │ • HTTP servers                │
│ • Local storage     │ • Database connections        │
│ • Animations        │ • Command-line tools          │
└─────────────────────┴───────────────────────────────┘
```

## A Brief History

- **2009**: Ryan Dahl creates Node.js
- **Why?**: He wanted a better way to handle many simultaneous connections
- **The insight**: JavaScript's event-driven nature is perfect for I/O operations
- **The engine**: Node.js uses Chrome's V8 JavaScript engine

## Why Use Node.js?

### 1. One Language Everywhere

```js
// Frontend (React, browser)
function Button() {
  return <button onClick={handleClick}>Click me</button>;
}

// Backend (Node.js server)
app.get('/api/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob'] });
});

// Same language, same skills, same developers
```

### 2. Non-Blocking I/O

Node.js handles operations asynchronously. While waiting for a file to read or a database query to finish, it can handle other requests.

```js
// Node.js doesn't wait - it keeps working
console.log('1. Starting');

fs.readFile('big-file.txt', (err, data) => {
  console.log('3. File loaded');  // This happens later
});

console.log('2. Still running');  // This runs immediately

// Output:
// 1. Starting
// 2. Still running
// 3. File loaded
```

### 3. Massive Ecosystem

npm (Node Package Manager) has over 2 million packages. Need to send emails? There's a package. Parse CSV files? There's a package. Build a web server? Multiple packages to choose from.

### 4. Great for Real-Time Applications

Node.js excels at:
- Chat applications
- Live updates (stock prices, sports scores)
- Collaborative tools (Google Docs-style)
- Gaming servers
- Streaming services

## What Can You Build?

| Type | Examples | Popular Tools |
|------|----------|---------------|
| **Web Servers** | REST APIs, GraphQL | Express, Fastify, Hono |
| **Full-Stack Apps** | Websites, dashboards | Next.js, Remix, Nuxt |
| **CLI Tools** | Build tools, utilities | Commander, Inquirer |
| **Desktop Apps** | Editors, chat apps | Electron (VS Code, Slack) |
| **Mobile Apps** | Cross-platform apps | React Native |
| **Microservices** | Scalable backends | Docker, Kubernetes |

## When NOT to Use Node.js

Node.js isn't ideal for:

- **CPU-intensive tasks**: Heavy computation blocks the event loop (image processing, video encoding, complex calculations)
- **When you need multi-threading**: Node is single-threaded by default (though worker threads exist)

Better alternatives for heavy computation:
- Python (data science, ML)
- Go or Rust (system programming)
- Java/C# (enterprise applications with complex business logic)

## Node.js vs Others

| Feature | Node.js | Python | Go |
|---------|---------|--------|-----|
| **Speed** | Fast | Slower | Fastest |
| **Learning Curve** | Easy (if you know JS) | Easy | Medium |
| **Concurrency** | Event loop | Threads/async | Goroutines |
| **Package Ecosystem** | Massive (npm) | Large (pip) | Growing |
| **Best For** | APIs, real-time | Data science, scripting | Microservices, CLI |

## Your First Node.js Program

Create a file called `hello.js`:

```js
// hello.js
console.log('Hello from Node.js!');

// Access command line arguments
console.log('Arguments:', process.argv.slice(2));

// Access environment variables
console.log('Home directory:', process.env.HOME || process.env.USERPROFILE);
```

Run it:

```bash
node hello.js world
# Output:
# Hello from Node.js!
# Arguments: [ 'world' ]
# Home directory: /Users/yourname
```

## Built-in Modules

Node.js comes with useful modules out of the box:

```js
// File system
const fs = require('fs');
const content = fs.readFileSync('file.txt', 'utf8');

// Path utilities
const path = require('path');
const fullPath = path.join(__dirname, 'data', 'file.txt');

// HTTP server
const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Hello World!');
});
server.listen(3000);

// Operating system info
const os = require('os');
console.log('CPU cores:', os.cpus().length);
console.log('Free memory:', os.freemem());
```

## Key Takeaways

- Node.js runs JavaScript outside the browser
- It's built on Chrome's V8 engine
- Non-blocking I/O makes it great for handling many connections
- One language (JavaScript) for frontend and backend
- Massive ecosystem via npm
- Best for I/O-heavy applications, not CPU-intensive tasks

## Questions & Answers

### Q: Do I need to learn Node.js if I only do frontend?
**A:** Not necessarily, but it helps. Build tools (Vite, Webpack), package managers (npm), and frameworks (Next.js) all run on Node.js. Understanding it makes you a more complete developer.

### Q: Is Node.js a framework?
**A:** No. Node.js is a runtime environment. Express, Fastify, and Hono are frameworks that run on Node.js.

### Q: Can Node.js handle production traffic?
**A:** Absolutely. Netflix, LinkedIn, PayPal, Uber, and many others use Node.js in production.

### Q: What version should I use?
**A:** Use the LTS (Long Term Support) version. Check [nodejs.org](https://nodejs.org) for the current LTS.

## Resources

- [Node.js Official Website](https://nodejs.org)
- [Node.js Documentation](https://nodejs.org/docs)
- [Node.js Built-in Modules](https://nodejs.org/api)

---

**Next:** [Chapter 2: npm - Node Package Manager](./02-npm.md)
