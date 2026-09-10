# 📸 InstaLike App

A production-grade, full-stack Instagram-like social media application built with **React**, **Node.js & Express**, **Microsoft SQL Server (MSSQL)**, and **ImageKit CDN**.

---

## 🚀 Key Features

- **Create Posts (Create)**:
  - Supports live image preview before submission.
  - Multi-part upload via `multer` memory buffer directly to **ImageKit CDN**.
  - Persists CDN URLs, post captions, timestamps, and like counts to **MSSQL**.
- **Community Feed (Read)**:
  - Real-time feed stream with author avatars, relative timestamps, and high-res image rendering.
  - Automatic fallback mechanism ensuring images render seamlessly from either ImageKit CDN or SQL Server binary streams.
- **Search Filter**: Instant client-side search bar allowing users to filter posts by caption in real-time.
- **Edit Posts (Update)**:
  - Dedicated `/edit-post/:id` route allowing users to modify their captions or replace existing photos.
  - Previews new image selections while retaining the current photo until saved.
- **Delete Posts (Delete)**:
  - Confirmation-guarded deletion removing posts directly from the database and updating the feed without reloading.
- **Interactive Likes**:
  - Heart button with optimistic UI updates and persistent counter increments stored in SQL Server via `PATCH /posts/:id/like`.
- **Responsive Aesthetics**:
  - Sticky glassmorphism header, card hover elevations, loading skeletons, and automatic **Dark/Light Mode** support.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS with modern custom properties (CSS design tokens)

### Backend
- **Runtime**: Node.js & Express
- **Database**: Microsoft SQL Server (`mssql` + `msnodesqlv8` Windows authentication)
- **File Uploads**: Multer
- **Media CDN**: ImageKit Node.js SDK (`@imagekit/nodejs`)
- **CORS**: Cross-Origin Resource Sharing enabled for frontend client on port 5173

---

## 📁 Project Architecture

```text
insta-like-app/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express routes, CORS & Multer middleware
│   │   ├── db/
│   │   │   └── db.js              # MSSQL connection & schema migrations
│   │   ├── models/
│   │   │   └── post.model.js      # Full CRUD queries (Create, Read, Update, Delete, Like)
│   │   └── servicers/
│   │       └── storage.service.js # ImageKit SDK integration
│   ├── .env.example               # Environment variables template
│   ├── package.json
│   └── server.js                  # Backend server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx         # Sticky header with navigation links
│   │   ├── pages/
│   │   │   ├── CreatePost.jsx     # Post creation with live preview
│   │   │   ├── EditPost.jsx       # Post editing with image replacement
│   │   │   └── Feed.jsx           # Feed stream with search, like, edit, and delete
│   │   ├── App.css                # Component stylesheets & animations
│   │   ├── App.jsx                # Application routing layout
│   │   ├── index.css              # Typography & color design tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) installed with Windows Authentication
- An [ImageKit](https://imagekit.io/) account

---

### 1. Backend Setup

1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your SQL Server and ImageKit credentials:
   ```env
   SERVER=localhost
   DATABASE=InstaLikeApp
   PORT=3000

   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will boot on `http://localhost:3000` and automatically verify/migrate the `Posts` table.*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173`.*

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/posts` | Retrieve all posts ordered by newest first |
| `POST` | `/posts` | Create a new post (`multipart/form-data` with `image` and `caption`) |
| `GET` | `/posts/:id` | Get single post details by ID |
| `PUT` | `/posts/:id` | Update post caption or replace image |
| `DELETE` | `/posts/:id` | Delete a post by ID |
| `PATCH` | `/posts/:id/like` | Increment post like count |
| `GET` | `/posts/:id/image` | Stream raw binary image fallback directly from MSSQL |

---

## 📄 License

This project is licensed under the ISC License.
