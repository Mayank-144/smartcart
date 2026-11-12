# SmartCart 🛒✨
### AI-Powered Product Recommendation System using Vector Embeddings

SmartCart is a full-stack MERN application that provides semantic search and AI product recommendations using local transformer embeddings (`@xenova/transformers` with `Xenova/all-MiniLM-L6-v2`) and MongoDB Atlas Vector Search (`$vectorSearch`).

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS (semantic search, search history, recently viewed and trending products, cart suggestions)
- **Backend:** Node.js (ES Modules) + Express + Mongoose + CORS
- **Embeddings:** `@xenova/transformers` running the `Xenova/all-MiniLM-L6-v2` 384-dimensional model locally
- **Database:** MongoDB Atlas with Vector Search index (`similarity: cosine`, `dimensions: 384`)
- **Product images:** Each seeded product has its own direct Pexels photo URL; emoji fallbacks appear if a photo is unavailable
- **Display currency:** Prices are shown in INR using a fixed USD-to-INR multiplier of 83 (not a live exchange rate)

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

Product photos are static Pexels CDN links stored with each product; no image
API key or image-search service is needed. The footer links to Pexels as the
photo source.

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

---

## 🚀 Local Setup and Render Deployment

### Configure Atlas and seed products

1. Create a free Atlas **M0** cluster, a database user with `readWrite` access to
   the `smartcart` database, and a Network Access entry for `0.0.0.0/0` so Render
   can connect. Use a strong, unique database-user password.
2. In Atlas, open **Connect → Drivers**, copy the Node.js connection string, and
   replace its database name with `smartcart`. In `server/.env`, set:

   ```env
   MONGODB_URI=mongodb+srv://<username>:<url-encoded-password>@<cluster-host>/smartcart?retryWrites=true&w=majority
   ```

   URL-encode reserved characters in the password. Keep this secret out of Git;
   `server/.env` is ignored.
3. From the repository root, run `npm run seed` (or `cd server` then
   `npm run seed`). This deletes existing documents in `products`, generates
   embeddings for all 90 seed products, and inserts them into Atlas. The first
   run downloads the embedding model; allow several minutes.
4. Create the `vector_index` Atlas Vector Search index using the JSON above and
   wait until it is **Active**.

### Run locally

Run `npm run dev` from the repository root, then open
`http://localhost:5173`. Search for `milk` and select a product to check search
and related-product results.

### Deploy one service to Render

The Express server serves `client/dist` when that build exists, so the frontend
can use its existing relative `/api` URLs without a production Vite proxy.

1. Push the project to GitHub and create a Render **Web Service** connected to
   the repository. Leave **Root Directory** blank (repository root).
2. Set **Build Command** to `npm run build` and **Start Command** to `npm start`.
3. Add `MONGODB_URI` in Render's environment settings using the same Atlas URI.
   Render sets `PORT` automatically; do not hardcode it.
4. Deploy and open the Render service URL. The first request that needs an
   embedding may take longer while the model assets are downloaded. Render's
   free service may also sleep when idle and cold-start on the next visit.
