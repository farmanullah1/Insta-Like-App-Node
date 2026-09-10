# 📸 InstaLike App

A full-stack Instagram-like social media application built with **React**, **Node.js / Express**, **Microsoft SQL Server (MSSQL)**, and **ImageKit CDN**.

---

## 🚀 Features

- **Photo Uploads**: Multi-part image uploads handled via `multer` (memory storage) and uploaded directly to **ImageKit CDN**.
- **MSSQL Database Storage**: Robust persistence storing captions, timestamps, and ImageKit CDN URLs directly in Microsoft SQL Server, with automatic table initialization and schema migration.
- **Dynamic Community Feed**: Real-time post feed with creator avatars, timestamps, high-resolution original image previews, and interactive like buttons.
- **Live Preview Dropzone**: Previews selected photos instantly in the browser before publishing.
- **Responsive Modern UI**: Glassmorphism sticky navbar, smooth card animations, and full **Dark Mode & Light Mode** support based on system preferences.
- **RESTful API**: Full CRUD endpoints for creating, reading, updating, and deleting posts.

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
- **CORS**: Cross-Origin Resource Sharing enabled for Vite dev server

---

## 📁 Project Architecture

```text
insta-like-app/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express app routes & middleware
│   │   ├── db/
│   │   │   └── db.js            # MSSQL connection & schema setup
│   │   ├── models/
│   │   │   └── post.model.js    # Database query operations
│   │   └── servicers/
│   │       └── storage.service.js # ImageKit upload integration
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   └── server.js                # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx       # Header with navigation & branding
│   │   ├── pages/
│   │   │   ├── CreatePost.jsx   # Post creation with live preview
│   │   │   └── Feed.jsx         # Feed view with post cards
│   │   ├── App.css              # Custom responsive stylesheet
│   │   ├── App.jsx              # App layout and route definitions
│   │   ├── index.css            # CSS variables & typography tokens
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
- An [ImageKit](https://imagekit.io/) account for media CDN storage

---

### 1. Backend Setup

1. Navigate to the `backend` folder:
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
   *The server will start at `http://localhost:3000` and automatically verify/create the `Posts` table in MSSQL.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
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
   *Open your browser and navigate to `http://localhost:5173`.*

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/posts` | Retrieve all posts ordered by newest first |
| `POST` | `/posts` | Create a new post (`multipart/form-data` with `image` and `caption`) |
| `GET` | `/posts/:id` | Get single post details by ID |
| `GET` | `/posts/:id/image` | Stream raw binary image directly from SQL Server |
| `PUT` | `/posts/:id` | Update post caption or replace image |
| `DELETE` | `/posts/:id` | Remove a post by ID |

---

## 📄 License

This project is licensed under the ISC License.
