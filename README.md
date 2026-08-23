# BlogVerse - MERN Blog Website

CodeWithHarry jaisi blog website — exact SQL tutorial content ke saath, full CRUD aur fully responsive UI.

## Structure

```
Blog-website/
├── server/          # Express + MongoDB backend
│   ├── .env         # MONGO_URI yahan hai (Atlas connection string)
│   ├── data/        # Exact scraped blog content (markdown)
│   └── src/
│       ├── index.js     # entry point
│       ├── app.js       # express app + routes
│       ├── db.js        # mongoose connection
│       ├── models/Post.js
│       ├── routes/posts.js   # CRUD API
│       ├── seedData.js  # seed post meta
│       └── seed.js      # seed CLI
└── client/          # React + Vite + Tailwind frontend
    └── src/
        ├── api.js           # fetch helpers
        ├── components/      # Navbar, Footer, PostCard, PostForm, Markdown (+copy button)
        └── pages/           # Home, BlogPost, CreatePost, EditPost
```

## Run

**1. Backend** (terminal 1):
```bash
cd server
npm install
npm run dev        # ya: npm start
```

**2. Frontend** (terminal 2):
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

## MongoDB Atlas

`server/.env` me connection string hai:
```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/blogwebsite
```
- Password change karo toh `.env` update kar dena.
- Naya device/IP se chalao toh Atlas → Network Access → apna IP add karna padega.

## Useful commands

| Command | Kya karta hai |
|---|---|
| `npm run seed` (server me) | SQL tutorial post DB me insert/update karta hai |
| `npm run dev:mem` (server me) | Bina Atlas ke temporary memory-DB pe chalata hai (data reset hota hai restart pe) |

## API

| Method | Route | Kaam |
|---|---|---|
| GET | `/api/posts` | Saare posts (list view) |
| GET | `/api/posts/:slug` | Ek post ka full content |
| POST | `/api/posts` | Naya post create |
| PUT | `/api/posts/:slug` | Post update |
| DELETE | `/api/posts/:slug` | Post delete |

## Features

- Exact CodeWithHarry SQL tutorial content (160+ code blocks, 23 tables) — markdown me stored
- Code blocks me Copy button (syntax highlighted)
- Full CRUD: create, read, update, delete blogs with markdown editor + live preview
- Fully responsive: mobile hamburger menu, grid 1/2/3 columns, scrollable tables/code
- Search by title/author on home page
