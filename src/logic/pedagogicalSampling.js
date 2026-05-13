/**
 * Rule-based next-token scoring for teaching—not a trained model.
 * Surfaces interpretable signals (prompt overlap, local continuation, English priors).
 */

/** Common next-token shapes + default prior strengths */
const BASE_PRIORS = [
  ['the', 2.2], ['a', 2.0], ['to', 1.95], ['of', 1.9], ['and', 1.85], ['in', 1.75],
  ['is', 1.7], ['for', 1.65], ['that', 1.55], ['it', 1.5], ['with', 1.45],
  ['on', 1.4], ['as', 1.35], ['at', 1.3], ['by', 1.25], ['from', 1.2],
  ['be', 1.15], ['are', 1.1], ['was', 1.05], ['have', 1.0], ['has', 0.95],
  ['not', 0.9], ['but', 0.88], ['this', 0.85], ['which', 0.82], ['or', 0.8],
  ['an', 0.78], ['their', 0.75], ['can', 0.72], ['will', 0.7], ['would', 0.68],
  ['about', 0.65], ['into', 0.62], ['more', 0.6], ['than', 0.58],
  ['so', 0.55], ['if', 0.52], ['when', 0.5], ['out', 0.48], ['up', 0.45],
];

/** Rough “what often follows this word” hints — illustrates local continuity only */
const FOLLOW_HINTS = {
  the: ['first', 'same', 'only', 'way', 'world', 'end', 'other', 'new', 'best', 'most', 'whole', 'next', 'fact', 'idea', 'result'],
  a: ['new', 'few', 'little', 'bit', 'lot', 'great', 'good', 'very', 'single', 'small', 'large', 'long'],
  an: ['example', 'array', 'object', 'error', 'input', 'output', 'integer', 'attempt'],
  to: ['the', 'be', 'get', 'make', 'do', 'see', 'say', 'go', 'help', 'ensure', 'avoid', 'find'],
  of: ['the', 'a', 'this', 'course', 'time', 'them', 'these', 'those', 'data', 'work'],
  and: ['the', 'then', 'it', 'this', 'that', 'so', 'also', 'we', 'you', 'its'],
  in: ['the', 'a', 'this', 'that', 'order', 'fact', 'time', 'practice', 'general', 'particular'],
  is: ['the', 'a', 'not', 'that', 'it', 'this', 'because', 'when', 'to', 'being', 'used'],
  for: ['the', 'a', 'this', 'example', 'instance', 'each', 'every', 'all', 'use', 'now'],
  with: ['the', 'a', 'each', 'some', 'no', 'more', 'less', 'great', 'little'],
  model: ['can', 'will', 'is', 'has', 'learns', 'outputs', 'uses', 'takes', 'maps', 'reads'],
  token: ['is', 'in', 'id', 'ids', 'count', 'sequence', 'stream', 'list', 'boundary'],
  prompt: ['is', 'tokens', 'text', 'string', 'length', 'encoding', 'word'],
  data: ['set', 'sets', 'pipeline', 'point', 'points', 'structure', 'from', 'is'],
  train: ['a', 'the', 'on', 'with', 'for', 'from', 'using', 'step', 'loss', 'loop'],
  language: ['model', 'models', 'is', 'understanding', 'processing', 'data'],
};

function stripBpe(t) {
  return (t || '').replace(/^Ġ/, '').trim();
}

/** Collect candidate type strings (lowercase, no Ġ) */
function buildCandidatePool(contextTokens, userPromptText) {
  const pool = new Map();
  const add = (w, s) => {
    const k = (w || '').toLowerCase();
    if (k.length < 1) return;
    pool.set(k, Math.max(pool.get(k) ?? -Infinity, s));
  };
  for (const [w, s] of BASE_PRIORS) add(w, s);

  const raw = `${userPromptText || ''} ${contextTokens.map(stripBpe).join(' ')}`;
  for (const word of raw.split(/[^a-zA-Z0-9_]+/).filter((w) => w.length >= 2)) {
    add(word, 0.3);
  }
  for (const t of contextTokens) {
    const s = stripBpe(t);
    if (s.length >= 2) add(s, 0.4);
  }

  return [...pool.keys()];
}

/**
 * @returns {{ token: string, logit: number, parts: Record<string, number> }}
 */
export function scoreCandidate(token, contextTokens, userPromptText) {
  const parts = { prior: 0, prompt: 0, follow: 0, bridge: 0, repeat: 0 };
  const low = token.toLowerCase();
  const fullPrompt = (userPromptText || '').toLowerCase();
  const ctx = contextTokens.map((t) => stripBpe(t).toLowerCase());
  const last = ctx[ctx.length - 1] || '';

  parts.prior = BASE_PRIORS.find(([w]) => w === low)?.[1] ?? 0.15;

  if (fullPrompt.includes(low) || ctx.some((c) => c === low || (c.length > 2 && low.includes(c)) || (low.length > 2 && c.includes(low)))) {
    parts.prompt += 2.2;
  }

  const hints = FOLLOW_HINTS[last];
  if (hints && hints.includes(low)) {
    parts.follow += 1.7;
  }

  if (last.length >= 2 && low.length >= 2) {
    if (low.startsWith(last.slice(-2)) || last.endsWith(low.slice(0, 2))) {
      parts.bridge += 1.1;
    }
  }

  const tail = ctx.slice(-3);
  if (tail.filter((c) => c === low).length >= 1) {
    parts.repeat += 0.75;
  }

  const logit = Object.values(parts).reduce((a, b) => a + b, 0);
  return { token: low, logit, parts };
}

function softmaxTop(scoredRows, temperature, topK) {
  const T = Math.max(temperature, 1e-5);
  const sorted = [...scoredRows].sort((a, b) => b.logit - a.logit).slice(0, topK);
  const scaled = sorted.map((r) => ({ ...r, logit: r.logit / T }));
  const maxL = scaled[0]?.logit ?? 0;
  let sum = 0;
  const exps = scaled.map((r) => {
    const e = Math.exp(r.logit - maxL);
    sum += e;
    return { ...r, e };
  });
  return exps.map(({ token, parts, e }) => ({ token, prob: e / sum, parts }));
}

/** Human-readable labels for the score breakdown UI */
export const SCORE_PART_LABELS = {
  prior: 'common-next-word guess',
  prompt: 'matches your text',
  follow: 'fits the last word (demo hints)',
  bridge: 'spelling / overlap nudge',
  repeat: 'echoes a recent token',
};

export function pedagogicalDistribution(userPromptText, contextTokens, temperature, topK = 15) {
  const pool = buildCandidatePool(contextTokens, userPromptText);
  const scored = pool.map((tok) => scoreCandidate(tok, contextTokens, userPromptText));
  return softmaxTop(scored, temperature, topK);
}

export function sampleFrom(dist) {
  const r = Math.random();
  let acc = 0;
  for (const { token, prob } of dist) {
    acc += prob;
    if (r <= acc) return token;
  }
  return dist[0].token;
}

/** Format typewriter-style for chips — keep Ġ as · for display */
export function displayTok(s) {
  return (s || '').replace(/^Ġ/, '·');
}
