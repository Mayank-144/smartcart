# SmartCart 🛒✨
### AI-Powered Product Recommendation System using Vector Embeddings

SmartCart is a full-stack MERN application that provides semantic search and AI product recommendations using local transformer embeddings (`@xenova/transformers` with `Xenova/all-MiniLM-L6-v2`) and MongoDB Atlas Vector Search (`$vectorSearch`).

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS (lucide-react icons, debounced search, responsive grid)
- **Backend:** Node.js (ES Modules) + Express + Mongoose + CORS
- **Embeddings:** `@xenova/transformers` running the `Xenova/all-MiniLM-L6-v2` 384-dimensional model locally
- **Database:** MongoDB Atlas with Vector Search index (`similarity: cosine`, `dimensions: 384`)

---

## 📁 Project Structure

```
smartcart/
├── package.json               # Root scripts (optional concurrently support)
├── client/                    # Vite React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx            # State, 300ms debounce, search grid & related panel
│       └── components/
│           ├── SearchBar.jsx  # Centered search bar with clear button & spinner
│           └── ProductCard.jsx# Category badges, score indicator, hover scaling
└── server/                    # Express Backend
    ├── .env.example
    ├── .env.example           # Copy to .env and configure MONGODB_URI
    ├── package.json
    ├── index.js               # Express app, CORS, MongoDB connection
    ├── models/
    │   └── Product.js         # Mongoose schema with embedding array
    ├── routes/
    │   └── search.js          # /api/search and /api/product/:id/related
    ├── utils/
    │   └── embeddings.js      # Feature extraction pipeline (384-dim)
    └── scripts/
        └── seedDB.js          # 90 items across 6 categories with embeddings
```

Before starting the server, copy `server/.env.example` to `server/.env` and set
your MongoDB connection string in `MONGODB_URI`. The `.env` file is ignored by
Git and should not be committed.

---

## ⚙️ MongoDB Atlas Vector Search Setup

After running the seed script, define your Vector Search Index in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and navigate to your database cluster.
2. Click on the **Atlas Search** (or **Search**) tab.
3. Click **Create Search Index** and choose **Atlas Vector Search (JSON Editor)**.
4. Select your Database and the **`products`** collection.
5. Set the **Index Name** to: `vector_index`
6. Paste the following JSON configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

7. Click **Next** and **Create Vector Search Index**. Wait 1–2 minutes for the status to become **Active**.
