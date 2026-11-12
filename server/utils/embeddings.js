import { pipeline } from '@xenova/transformers';

let extractorInstance = null;
let isFirstLoad = true;

/**
 * Returns a singleton feature-extraction pipeline instance.
 * Logs a message on the first download/initialization.
 */
export async function getExtractor() {
  if (!extractorInstance) {
    if (isFirstLoad) {
      console.log('Downloading model, please wait...');
      isFirstLoad = false;
    }
    extractorInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('Embedding model (Xenova/all-MiniLM-L6-v2) ready.');
  }
  return extractorInstance;
}

/**
 * Generates a normalized 384-dimensional vector embedding for the given input text.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text) {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

