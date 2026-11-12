import express from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { generateEmbedding } from '../utils/embeddings.js';

const router = express.Router();

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

    // Run vector search with stored embedding, excluding the current product
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: product.embedding,
          numCandidates: 100,
          limit: 6,
        },
      },
      {
        $match: {
          _id: { $ne: product._id },
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          description: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const related = await Product.aggregate(pipeline);

    return res.status(200).json({
      product: {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
      },
      results: related,
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

export default router;

