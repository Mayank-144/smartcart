import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { generateEmbedding } from '../utils/embeddings.js';

const router = express.Router();

router.get('/trending', async (req, res) => {
  const trendingNames = [
    'Avocados',
    'Matcha Latte',
    'Greek Yogurt',
    'Sourdough Bread',
    'Dark Chocolate',
    'Blueberries',
  ];

  try {
    const products = await Product.find(
      { name: { $in: trendingNames } },
      { embedding: 0 }
    ).lean();
    const order = new Map(trendingNames.map((name, index) => [name, index]));
    products.sort((a, b) => order.get(a.name) - order.get(b.name));

    return res.status(200).json({ results: products });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return res.status(500).json({
      error: 'Failed to load trending products',
      results: [],
    });
  }
});

/**
 * GET /api/search?q=<query>
 * Vector search products based on natural language query embedding.
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(200).json({
        results: [],
        message: 'No query provided',
      });
    }

    // Generate 384-d normalized vector embedding for user query
    const queryVector = await generateEmbedding(query);

    // MongoDB Atlas Vector Search Aggregation Pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 100,
          limit: 6,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          description: 1,
          image: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const results = await Product.aggregate(pipeline);

    if (!results || results.length === 0) {
      return res.status(200).json({
        results: [],
        message: 'No similar products found',
      });
    }

    return res.status(200).json({
      results,
    });
  } catch (error) {
    console.error('Error during vector search:', error);

    // Provide friendly guidance if Atlas Vector Search index is not yet built
    if (error.message && error.message.includes('$vectorSearch')) {
      return res.status(500).json({
        error: 'Atlas Vector Search error',
        details:
          'Please ensure the "vector_index" Vector Search index has been created and is Active in MongoDB Atlas.',
        results: [],
        message: 'No similar products found',
      });
    }

    return res.status(500).json({
      error: 'Internal server error while searching products',
      results: [],
      message: 'No similar products found',
    });
  }
});

/**
 * GET /api/product/:id/related
 * Fetches product by ID, uses its stored embedding, and finds top 5 related items.
 */
router.get('/product/:id/related', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid product ID format',
        results: [],
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        results: [],
      });
    }

    if (!product.embedding || !Array.isArray(product.embedding) || product.embedding.length === 0) {
      return res.status(400).json({
        error: 'Product embedding not found',
        results: [],
      });
    }

    // Complementary categories for cross-selling (e.g., bread -> butter, cheese, coffee)
    const complementaryMap = {
      bakery: ['dairy', 'beverages', 'fruits'],
      dairy: ['bakery', 'fruits', 'beverages'],
      snacks: ['beverages', 'dairy'],
      beverages: ['snacks', 'bakery'],
      fruits: ['dairy', 'bakery', 'snacks'],
      vegetables: ['dairy', 'bakery'],
    };
    const targetCrossCategories = complementaryMap[product.category] || [];

    // Run vector search with stored embedding, excluding the current product
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: product.embedding,
          numCandidates: 100,
          limit: 25,
        },
      },
      {
        $match: {
          _id: { $ne: product._id },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          description: 1,
          image: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const candidates = await Product.aggregate(pipeline);

    // Separate complementary cross-sell items from same-category similar items
    const crossSellItems = candidates
      .filter((item) => targetCrossCategories.includes(item.category))
      .slice(0, 3)
      .map((item) => ({ ...item, relationType: 'cross-sell' }));

    const similarItems = candidates
      .filter((item) => item.category === product.category)
      .slice(0, 2)
      .map((item) => ({ ...item, relationType: 'similar' }));

    // Combine cross-sell first so complementary items (e.g. Butter/Cheese for Bread) lead
    const combined = [...crossSellItems, ...similarItems];
    // Fill up to 5 if needed
    for (const item of candidates) {
      if (combined.length >= 5) break;
      if (!combined.some((c) => c._id.toString() === item._id.toString())) {
        combined.push({ ...item, relationType: 'cross-sell' });
      }
    }

    return res.status(200).json({
      product: {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image,
      },
      results: combined.slice(0, 5),
      crossSell: crossSellItems,
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return res.status(500).json({
      error: 'Internal server error while fetching related products',
      results: [],
      message: 'No similar products found',
    });
  }
});

/**
 * Helper: runs vector search for a text query and returns top N items.
 */
async function vectorSearchText(text, limit = 3) {
  const queryVector = await generateEmbedding(text);
  return Product.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector,
        numCandidates: 100,
        limit,
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        category: 1,
        price: 1,
        description: 1,
        image: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);
}

/**
 * GET /api/mood/:moodId
 * Mood-based Shopping Bundles
 */
router.get('/mood/:moodId', async (req, res) => {
  const moods = {
    'movie-night': {
      title: 'Movie Night',
      emoji: '🎬',
      description: 'Crunchy popcorn, chips, sweet treats & fizzy drinks for binge-watching.',
      queries: ['butter popcorn', 'potato chips', 'craft cola', 'dark chocolate', 'gummy bears'],
    },
    'healthy-week': {
      title: 'Healthy Week',
      emoji: '🥗',
      description: 'Nutrient-packed greens, protein dairy, avocados & antioxidant berries.',
      queries: ['baby spinach', 'avocados', 'greek yogurt', 'blueberries', 'green tea'],
    },
    'birthday-party': {
      title: 'Birthday Party',
      emoji: '🎉',
      description: 'Crowd-pleasing donuts, cookies, party chips, lemonade & fresh fruit.',
      queries: ['glazed donuts', 'chocolate cookies', 'tortilla chips', 'lemonade', 'strawberries'],
    },
    'sunday-breakfast': {
      title: 'Lazy Sunday',
      emoji: '☕',
      description: 'Warm bakery pastries, creamy butter, coffee & fresh orange juice.',
      queries: ['butter croissant', 'cold brew coffee', 'orange juice', 'butter', 'cinnamon bagels'],
    },
  };

  try {
    const mood = moods[req.params.moodId];
    if (!mood) {
      return res.status(404).json({ error: 'Mood bundle not found', results: [] });
    }

    const batches = await Promise.all(mood.queries.map((q) => vectorSearchText(q, 2)));
    const seen = new Set();
    const results = [];

    for (const batch of batches) {
      for (const item of batch) {
        const id = item._id.toString();
        if (!seen.has(id)) {
          seen.add(id);
          results.push(item);
          break;
        }
      }
    }

    return res.status(200).json({
      moodId: req.params.moodId,
      title: mood.title,
      emoji: mood.emoji,
      description: mood.description,
      results: results.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching mood bundle:', error);
    return res.status(500).json({ error: 'Failed to load mood bundle', results: [] });
  }
});

/**
 * GET /api/product/:id/substitute
 * Smart AI Substitutions: finds the closest in-stock alternative when an item is unavailable.
 */
router.get('/product/:id/substitute', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product || !product.embedding?.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const candidates = await Product.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: product.embedding,
          numCandidates: 100,
          limit: 6,
        },
      },
      { $match: { _id: { $ne: product._id } } },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          description: 1,
          image: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    // Prefer same category substitute first if available
    const sameCategory = candidates.filter((c) => c.category === product.category);
    const ordered = [...sameCategory, ...candidates.filter((c) => c.category !== product.category)];
    const topSubstitute = ordered[0] || null;
    const matchPct = topSubstitute ? Math.round((topSubstitute.score || 0) * 100) : 0;

    return res.status(200).json({
      original: { _id: product._id, name: product.name, category: product.category },
      substitute: topSubstitute,
      alternatives: ordered.slice(0, 3),
      message: topSubstitute
        ? `Out of ${product.name}? Try ${topSubstitute.name} instead (${matchPct}% similar)`
        : `No substitute found for ${product.name}`,
    });
  } catch (error) {
    console.error('Error finding substitute:', error);
    return res.status(500).json({ error: 'Failed to find substitute' });
  }
});

export default router;

