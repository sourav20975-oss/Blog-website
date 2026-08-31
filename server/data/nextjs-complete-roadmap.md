# The Ultimate Next.js Roadmap — From Zero to Full Stack

Next.js is the go-to framework for building modern web apps. Whether you're just starting out or brushing up on fundamentals, this roadmap covers everything you need — from App Router basics to building a full-stack project with MongoDB, authentication, and image uploads.

---

## Prerequisites

Before diving into Next.js, make sure you're comfortable with:

- **HTML & CSS** — the building blocks of every web page
- **JavaScript** — the language that powers the browser
- **React.js** — components, hooks, state, and props
- **MongoDB** — a NoSQL database (used in the full-stack project)

---

## Level 1 — What is Next.js?

Next.js is a React-based open-source web framework built by Vercel. It takes React and adds superpowers:

- **Server-Side Rendering (SSR)** — pages are rendered on the server, not just the client. Better SEO and faster initial load.
- **Static Site Generation (SSG)** — pre-render pages at build time for blazing fast performance.
- **API Routes** — build your backend inside the same Next.js project. No separate server needed.
- **File-System Routing** — create a file, and it becomes a route. No router config required.
- **Built-in Optimization** — automatic code splitting, image optimization, font optimization.

In short: React + SSR + SSG + routing + full-stack capabilities = Next.js.

---

## Level 2 — App Router (File-System Routing)

Next.js uses file-system routing — your folder structure defines your routes.

### Basic Routes

Create a folder inside `app/`, add a `page.js`, and it becomes a route:

```
app/
  page.js          → /
  about/
    page.js        → /about
  blog/
    page.js        → /blog
```

### Nested Routes

Nest folders to create nested routes. Each folder can have its own `layout.js` and `page.js`.

### Dynamic Routes

Use square brackets to create dynamic route segments:

```
app/blog/[slug]/page.js    → /blog/hello-world, /blog/my-post
```

The `params` prop is a promise — use `async/await` or React's `use()` to access it.

### Catch-All Segments

Match multiple segments with the spread operator:

```
app/shop/[...slug]/page.js
→ /shop/clothes
→ /shop/clothes/tops
→ /shop/clothes/tops/t-shirts
```

### Optional Catch-All Segments

Same as catch-all, but also matches the base route:

```
app/shop/[[...slug]]/page.js
→ /shop (also matched!)
→ /shop/clothes
→ /shop/clothes/tops
```

### Route Groups

Organize routes without affecting the URL path using parentheses:

```
app/(marketing)/about/page.js   → /about
app/(shop)/products/page.js     → /products
```

### Parallel Routes

Render multiple pages in the same layout using the `@` alias:

```
app/
  layout.js
  page.js
  @analytics/page.js
  @team/page.js
```

Both `@analytics` and `@team` render simultaneously in the layout.

### Important Note

In Next.js, every page is a **Server Component** by default. To use hooks like `useState` or `useEffect`, add `'use client'` at the top of the file.

---

## Level 3 — Navigation, Images & Fonts

### Navigation

Two methods to navigate between pages:

1. **`<Link>` component** — declarative navigation (preferred):
   ```jsx
   import Link from 'next/link';
   <Link href="/about">About</Link>
   ```

2. **`useRouter` hook** — programmatic navigation:
   ```jsx
   import { useRouter } from 'next/navigation';
   const router = useRouter();
   router.push('/dashboard');
   ```

### Image Optimization

Next.js provides a built-in `<Image>` component that automatically:

- Resizes images to fit the viewport
- Compresses for smaller file sizes
- Serves modern formats (WebP/AVIF)
- Lazy loads by default

```jsx
import Image from 'next/image';
<Image src="/photo.jpg" width={500} height={300} alt="A photo" />
```

### Font Optimization

Next.js reduces font file sizes by including only the characters you use (subsets) and preloading them for faster rendering with minimal layout shifts.

```jsx
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
```

### Practice Project 1 — Travel Guide Website

Build a simple travel guide using Next.js fundamentals: routing, pages, navigation, and images. A great starter project to solidify your understanding of the App Router.

---

## Level 4 — TypeScript in Next.js

### What is TypeScript?

TypeScript is a strongly typed superset of JavaScript developed by Microsoft. All valid JavaScript is valid TypeScript — the key addition is **static typing**.

### Basic Types

```ts
let name: string = "Sourav";
let age: number = 25;
let isStudent: boolean = true;
let items: string[] = ["a", "b", "c"];
let mixed: (string | number)[] = [1, "two", 3];
```

### Tuples

Fixed-length arrays with specific types at each position:

```ts
let person: [string, number] = ["Sourav", 25];
```

### Functions

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

### Type Declaration vs Type Inference

- **Type Inference** — TypeScript figures out the type automatically:
  ```ts
  let x = 5; // inferred as number
  ```
- **Type Declaration** — you explicitly state the type:
  ```ts
  let x: number = 5;
  ```

### Type Aliases

Create reusable type names:

```ts
type User = {
  name: string;
  age: number;
  email: string;
};
```

### Interfaces

Similar to type aliases but extendable:

```ts
interface User {
  name: string;
  age: number;
}
interface Admin extends User {
  role: string;
}
```

### Type vs Interface

| Feature | Type | Interface |
|---------|------|-----------|
| Extendable | `&` (intersection) | `extends` |
| Declaration Merging | No | Yes |
| Performance | Slightly faster | Slightly slower |
| Use Case | Unions, primitives | Objects, classes |

### Union & Intersection

```ts
type StringOrNumber = string | number;        // Union
type Admin = User & { role: string };          // Intersection
```

### Generics

Write reusable, type-safe code:

```ts
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
getFirst<string>(["a", "b"]); // "a"
getFirst<number>([1, 2]);     // 1
```

### Global Declaration

Declare types available everywhere:

```ts
// types/global.d.ts
declare global {
  interface Window {
    myApp: string;
  }
}
```

### React with TypeScript

```tsx
interface Props {
  title: string;
  count: number;
}

function Card({ title, count }: Props) {
  return <div>{title}: {count}</div>;
}
```

---

## Level 5 — API Routes

API Routes let you build a backend inside Next.js. Create files in the `app/api/` folder:

```
app/api/
  users/
    route.js      → /api/users
  posts/
    route.js      → /api/posts
```

### Handler Function

```js
// app/api/users/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await fetchUsers();
  return NextResponse.json(users);
}

export async function POST(request) {
  const body = await request.json();
  const newUser = await createUser(body);
  return NextResponse.json(newUser, { status: 201 });
}
```

You can export `GET`, `POST`, `PUT`, `PATCH`, `DELETE` handlers.

### Dynamic API Routes

Same as pages — use `[param]` for dynamic segments:

```
app/api/users/[id]/route.js    → /api/users/123
```

### Request Object

```js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
}
```

---

## Level 6 — Data Fetching

### Server-Side Fetching (Default)

In Server Components, fetch data directly:

```jsx
async function PostsPage() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

### Client-Side Fetching

Use `useEffect` + `useState` in a Client Component:

```jsx
'use client';
import { useState, useEffect } from 'react';

function Posts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => setPosts(data));
  }, []);

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

### Static Generation (SSG)

Pre-render at build time with `generateStaticParams`:

```jsx
export async function generateStaticParams() {
  const posts = await fetchPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### Practice Project 2 — Full-Stack Next.js App

Build a complete app with:

- **MongoDB Atlas** — connect using `mongoose`, define models, perform CRUD
- **NextAuth.js** — authentication with providers (Google, GitHub, etc.)
- **Cloudinary** — image upload and optimization
- **JWT & Session Callbacks** — customize how tokens and sessions are handled

Key concepts in this project:

1. **MongoDB Connection** — create a cached connection utility to avoid multiple connections in development
2. **Mongoose Models** — define schemas with `mongoose.Schema()` and export models
3. **NextAuth Configuration** — set up `authOptions` with providers, JWT callback, and session callback
4. **JWT Callback** — customize what goes into the token (e.g., user ID, role)
5. **Session Callback** — expose token data to the client-side session

---

## Summary

| Level | Topic | What You Learn |
|-------|-------|----------------|
| 1 | Introduction | What Next.js is and why use it |
| 2 | App Router | File-system routing, dynamic routes, catch-all, parallel routes |
| 3 | Navigation, Images, Fonts | `<Link>`, `useRouter`, `<Image>`, font optimization |
| 4 | TypeScript | Types, interfaces, generics, React + TS |
| 5 | API Routes | Building backend endpoints inside Next.js |
| 6 | Data Fetching | SSR, SSG, client-side fetching, full-stack project |

Next.js makes it possible to build production-grade full-stack applications with a single framework. Master these levels, and you'll be ready to build anything — from simple blogs to complex SaaS platforms.

---

*Happy coding! 🚀*
