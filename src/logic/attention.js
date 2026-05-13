// Real softmax self-attention computation (toy embedding, real math)
// d=16 dimensional embeddings, deterministic via string hashing

const D = 16;

// Seeded pseudo-random number generator (mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Generate a deterministic d-dimensional embedding for a token string
function embedToken(token) {
  const rand = mulberry32(hashString('embed:' + token));
  return Array.from({ length: D }, () => rand() * 2 - 1);
}

// Generate a deterministic d×d weight matrix with a given seed label
function weightMatrix(label) {
  const rand = mulberry32(hashString('wmat:' + label));
  return Array.from({ length: D }, () =>
    Array.from({ length: D }, () => (rand() * 2 - 1) * 0.1)
  );
}

// Matrix-vector product: (d×d) @ (d) → (d)
function matVec(M, v) {
  return M.map(row => row.reduce((acc, w, j) => acc + w * v[j], 0));
}

// Dot product of two vectors
function dot(a, b) {
  return a.reduce((acc, x, i) => acc + x * b[i], 0);
}

// Softmax over a 1D array
function softmax(arr) {
  const maxVal = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - maxVal));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

// Pre-compute fixed weight matrices (deterministic)
const Wq = weightMatrix('Wq');
const Wk = weightMatrix('Wk');
const Wv = weightMatrix('Wv');

export function computeAttention(tokens) {
  if (!tokens || tokens.length === 0) {
    tokens = ['<empty>'];
  }

  const n = tokens.length;

  // Embed each token
  const embeddings = tokens.map(t => embedToken(t));

  // Project to Q, K, V
  const Q = embeddings.map(e => matVec(Wq, e));
  const K = embeddings.map(e => matVec(Wk, e));
  const V = embeddings.map(e => matVec(Wv, e));

  // Compute raw scores: scores[i][j] = dot(Q[i], K[j]) / sqrt(d)
  const scale = Math.sqrt(D);
  const scores = Q.map(qi =>
    K.map(kj => dot(qi, kj) / scale)
  );

  // Apply softmax per row to get attention weights
  const weights = scores.map(row => softmax(row));

  // Compute attended output (for completeness)
  const output = weights.map(wRow =>
    Array.from({ length: D }, (_, d) =>
      wRow.reduce((acc, w, j) => acc + w * V[j][d], 0)
    )
  );

  return { Q, K, V, scores, weights, output };
}
