# How to Integrate MongoDB into Your Next.js Apps

When you build an app with **Next.js** and **MongoDB**, the single most important thing to get right is **connection management**. A naive approach — creating a new `MongoClient` on every request — will exhaust your database connection limit fast, especially on serverless platforms like Vercel where every API route can spin up its own instance.

This guide breaks down the standard `lib/mongodb.js` pattern that solves this problem.

## The Connection Pattern

Create a file called `lib/mongodb.js`:

```js
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error('Add Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  // In dev, HMR reloads modules constantly — cache the promise globally
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production, one fresh connection per server instance is fine
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise
```

## How It Works

1. **Imports & config** — `MongoClient` comes from the `mongodb` package, and the connection string lives in `MONGODB_URI` so secrets never touch your code.
2. **Fail-fast check** — if the URI is missing, the app throws immediately instead of failing mysteriously later.
3. **Environment-aware caching**:
   - **Development**: Next.js Hot Module Replacement re-runs this file every time you save. Storing the connect promise on `global` survives reloads and prevents dozens of leaked connections.
   - **Production**: each server instance connects once at startup — stable and predictable.
4. **Single export** — the rest of the app just awaits one promise.

## Using It in an API Route

```js
import clientPromise from '../../lib/mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db('myDatabase')
    const data = await db.collection('myCollection').find({}).toArray()
    res.status(200).json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
```

## Why This Pattern Matters

| Problem without it | With the pattern |
|---|---|
| New connection per request → hits Atlas connection cap | One cached promise per process |
| Memory leaks during hot reload | Global promise survives HMR |
| Repeated boilerplate everywhere | Import one promise, await it |

## Best Practices

1. **Never hardcode credentials** — keep `MONGODB_URI` in `.env.local` (gitignored).
2. **Always wrap DB calls in try/catch** — network blips shouldn't crash the route.
3. **Let the driver pool connections** — don't call `client.close()` per request; pooling is handled for you.

## Conclusion

The `lib/mongodb.js` file looks small, but it's the backbone of every Next.js + MongoDB project. Cache the promise in development, connect once per instance in production, and await the same promise everywhere — that's the whole secret.

> Source: adapted from CodeWithHarry's blog — [codewithharry.com/blogpost/how-to-integrate-mongodb-into-your-nextjs-apps](https://www.codewithharry.com/blogpost/how-to-integrate-mongodb-into-your-nextjs-apps)
