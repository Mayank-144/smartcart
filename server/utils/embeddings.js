import { pipeline } from '@xenova/transformers';

let extractorPromise = null;

/**
 * Returns a singleton feature-extraction pipeline promise.
 * Caches the in-flight promise so concurrent requests (e.g. Promise.all)
 * never load multiple ONNX model instances into memory at the same time.
 */
export function getExtractor() {
  if (!extractorPromise) {
    console.log('Downloading model, please wait...');
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
      .then((extractor) => {
        console.log('Embedding model (Xenova/all-MiniLM-L6-v2) ready.');
        return extractor;
      })
      .catch((err) => {
        extractorPromise = null;
        throw err;
      });
  }
  return extractorPromise;
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
