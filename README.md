# SmartCart 🛒✨
> **AI-Powered Semantic Product Discovery & Recommendation Engine using Vector Embeddings**

SmartCart is a modern full-stack e-commerce application that leverages local neural transformers (`@xenova/transformers` running `Xenova/all-MiniLM-L6-v2`) and **MongoDB Atlas Vector Search** (`$vectorSearch`) to deliver real-time semantic search, intelligent cross-selling, mood-based shopping bundles, and smart out-of-stock substitutions.

---

## 🌟 Key Features

### 🔍 1. AI Semantic Natural Language Search
- Search products using natural intent rather than exact keyword matches (e.g., *"salty evening snacks"*, *"cold creamy dairy"*, *"citrus fizzy drinks"*, *"fresh breakfast"*).
- Converts user queries into **384-dimensional dense vector embeddings** on-the-fly and executes cosine-similarity vector queries via MongoDB Atlas `$vectorSearch`.
- Displays real-time vector match scores (% match badge) on each product card.
- Debounced search (300ms) with clear triggers and fallback states.

### 🔄 2. Smart AI Substitutions ("Out of Stock? Find Alternatives")
- Encounter an out-of-stock item? The AI finds the closest in-stock semantic substitute using vector proximity.
- Compares categories and cosine distance to recommend the highest-probability alternative with similarity percentage.
- One-click replacement directly updates your view and shopping flow.

### 🎯 3. Intelligent Related & Cross-Sell Recommendations
- Clicking any product reveals related recommendations powered by its pre-computed 384-d vector embedding.
- Employs **cross-selling category mapping** (e.g., Bakery items suggest complementary Dairy, Beverages, or Fruits like Butter, Cheese, or Coffee) alongside similar items from the same category.

### 🎭 4. Curated Mood-Based Shopping Bundles
- Instant lifestyle and mood bundles powered by multi-vector searches:
  - 🎬 **Movie Night:** Crunchy popcorn, potato chips, craft cola, and sweet treats.
  - 🥗 **Healthy Week:** Nutrient-dense baby spinach, avocados, Greek yogurt, and berries.
  - 🎉 **Birthday Party:** Donuts, cookies, tortilla chips, lemonade, and party fruits.
  - ☕ **Lazy Sunday:** Warm croissants, cold brew coffee, fresh juice, and butter.

### 🛒 5. Slide-Out Interactive Cart Drawer
- Smooth slide-over cart drawer with quantity increments/decrements and removal.
- Real-time order breakdown (Subtotal, Standard Delivery, Taxes, Savings, and Final Total).
- Local storage persistence and currency formatted in **₹ INR** with clean fallbacks.

### 📈 6. Trending & Recently Viewed Products
- **Trending Now:** Instant curated showcase of popular products fetched on launch.
- **Recently Viewed:** Automatically tracks your browsing history across sessions via `localStorage`.

### ⚡ 7. Production-Grade Transformer Pipeline Optimization
- **Singleton Extractor:** Reuses pipeline instances to avoid memory leaks.
- **Pre-warmed Model:** Model initializes on server launch for zero cold-start delay during user requests.
- **Process Crash Guards:** Graceful unhandled error containment for reliable uptimes.

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────┐
│                   Vite + React 18                      │
│      Tailwind CSS • Lucide Icons • Responsive UI       │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Backend                   │
│         Node.js (ESM) • CORS • MongoDB Mongoose         │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│   @xenova/transformers    │ │   MongoDB Atlas Database │
│  all-MiniLM-L6-v2 (384-d) │ │    Vector Search Index   │
│  (Local Neural Embeddings)│ │   ($vectorSearch Cosine) │
└───────────────────────────┘ └──────────────────────────┘
```

| Component | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Reactive UI, dynamic modal drawers, debounced search, badges |
| **Icons** | Lucide React | Modern, clean feather-style iconography |
| **Backend** | Node.js (ES Modules), Express | High-performance asynchronous REST API |
| **AI / Embeddings** | `@xenova/transformers` | Local ONNX execution of `Xenova/all-MiniLM-L6-v2` (384 dimensions) |
| **Database** | MongoDB Atlas | Cloud database with native Atlas Vector Search (`$vectorSearch`) |
| **ODM** | Mongoose | Product schema definition with embedding vectors |
| **Images** | Pexels High-Res CDN | High-resolution direct product photography with emoji fallback |

---

## 📁 Project Structure

```
smartcart/
├── client/                      # Vite + React Frontend
│   ├── public/                  # Public static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── CartDrawer.jsx   # Slide-out cart with order calculation
│   │   │   ├── ProductCard.jsx  # Interactive card with match scores & badges
│   │   │   └── SearchBar.jsx   # Search input, clear button & quick queries
│   │   ├── App.jsx              # Main view, state, modals & mood selectors
│   │   ├── index.css            # Tailwind directives & custom utilities
│   │   └── main.jsx             # React entrypoint
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                      # Node.js + Express Backend
│   ├── models/
│   │   └── Product.js           # Mongoose schema with 384-d embedding array
│   ├── routes/
│   │   └── search.js            # Vector search, related, moods & substitute APIs
│   ├── scripts/
│   │   └── seedDB.js            # Database seeder with 90 pre-embedded items
│   ├── utils/
│   │   └── embeddings.js        # Cached singleton transformer pipeline
│   ├── .env.example             # Template for required environment variables
│   ├── index.js                 # Server entry, CORS configuration & pre-warming
│   └── package.json
│
├── .gitignore
├── package.json                 # Root script runner (concurrently)
└── README.md
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/search?q=<query>` | Performs vector search against query embedding. Returns top matches with vector score. |
| `GET` | `/api/trending` | Retrieves list of curated trending grocery products. |
| `GET` | `/api/product/:id/related` | Returns complementary cross-sell products and same-category items using product embedding. |
| `GET` | `/api/product/:id/substitute` | Finds closest in-stock semantic substitute for out-of-stock items. |
| `GET` | `/api/mood/:moodId` | Generates a 5-item curated bundle for moods (`movie-night`, `healthy-week`, etc.). |

---

## ⚙️ MongoDB Atlas Vector Search Configuration

To enable vector search queries, create an Atlas Vector Search index on your MongoDB collection:

1. Log into your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Select your cluster and navigate to the **Atlas Search** (or **Search**) tab.
3. Click **Create Search Index** ➔ Select **Atlas Vector Search** ➔ Click **JSON Editor**.
4. Select your database (e.g., `smartcart`) and collection (`products`).
5. Set the **Index Name** to exactly:
   ```text
   vector_index
   ```
6. Paste the following configuration JSON:

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

7. Click **Next**, then **Create Vector Search Index**. Wait 1–2 minutes until the index status becomes **Active**.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account with a free M0 cluster

### 2. Clone the Repository
```bash
git clone https://github.com/Mayank-144/smartcart.git
cd smartcart
```

### 3. Install Dependencies
Install dependencies across the root, client, and server:
```bash
# Root dependencies
npm install

# Backend dependencies
cd server && npm install

# Frontend dependencies
cd ../client && npm install

cd ..
```

### 4. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB connection string:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/smartcart?retryWrites=true&w=majority
```
*(Ensure any special characters in the password are URL-encoded, and `0.0.0.0/0` is added to Atlas IP Access list).*

### 5. Seed the Database
Run the seed script to populate 90 products across 6 categories (Dairy, Bakery, Snacks, Beverages, Fruits, Vegetables) and calculate their 384-dimensional vector embeddings:
```bash
npm run seed
```
*(Note: On the first run, the transformer model will be downloaded automatically. This takes 1–2 minutes depending on your internet connection).*

### 6. Run the Application
Start both the backend server and frontend development client concurrently:
```bash
npm run dev
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🚢 Deployment Guide

### Deploying Full-Stack to Render (Unified Service)
The Express backend is pre-configured to serve static frontend assets from `client/dist` in production.

1. Push your repository to GitHub.
2. In Render, create a **New Web Service** connected to your repository.
3. Configure the service:
   - **Root Directory:** *(leave blank for root)*
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Add Environment Variable:
   - `MONGODB_URI`: your MongoDB Atlas connection string.
5. Deploy service. Render automatically assigns a `PORT` and serves both the API and client.

### Deploying Frontend to Vercel & Backend to Render
If hosting the Vite client on Vercel:
- **Backend CORS:** Already supports `*.vercel.app`, `*.onrender.com`, and localhost origins.
- Set `VITE_API_BASE_URL` on Vercel to your deployed Render backend URL.

---

## 🛡️ License
This project is open source and available under the [MIT License](LICENSE).
