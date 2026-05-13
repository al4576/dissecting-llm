// GPT-3 dataset composition: Brown et al. 2020, "Language Models are Few-Shot Learners" (Table 2)
export const GPT3_DATASETS = [
  { name: "Common Crawl (filtered)", tokens: 410e9, weight: 0.60, description: "Mostly open web pages: scraped text from the public internet, then filtered so low-quality junk is down-weighted." },
  { name: "WebText2", tokens: 19e9, weight: 0.22, description: "Pages that Reddit users linked and upvoted a lot — a proxy for 'humans liked this link'." },
  { name: "Books1", tokens: 12e9, weight: 0.08, description: "Internet Books corpus — digitized books shared online." },
  { name: "Books2", tokens: 55e9, weight: 0.08, description: "Extra published fiction and nonfiction the researchers licensed or collected outside the open web." },
  { name: "Wikipedia (EN)", tokens: 3e9, weight: 0.03, description: "A snapshot of English Wikipedia (June 2020) — edited encyclopedia prose." },
];

// LLaMA 2 dataset: Touvron et al. 2023, LLaMA 2 model card
export const LLAMA2_DATASETS = [
  { name: "Common Crawl", tokens: 1080e9, weight: 0.67 },
  { name: "C4", tokens: 228e9, weight: 0.14 },
  { name: "GitHub", tokens: 52e9, weight: 0.032 },
  { name: "Wikipedia", tokens: 22e9, weight: 0.014 },
  { name: "Books", tokens: 21e9, weight: 0.013 },
  { name: "ArXiv", tokens: 17e9, weight: 0.011 },
  { name: "StackExchange", tokens: 21e9, weight: 0.013 },
];

// Scale reference points — mix of published pretrain totals vs order-of-magnitude estimates.
// GPT-4-scale numbers are not officially published; ~13T is a commonly cited industry band (e.g. Semianalysis-style reporting).
export const SCALE_FACTS = [
  { label: 'Average novel', tokens: 100_000, role: 'ref' },
  { label: 'English Wikipedia (snapshot)', tokens: 5e9, role: 'ref' },
  { label: 'GPT-3 pretrain (Brown et al. 2020)', tokens: 300e9, role: 'gpt3' },
  { label: 'LLaMA 2 pretrain (Meta 2023)', tokens: 2e12, role: 'ref' },
  { label: 'GPT-4-class pretrain (est.)', tokens: 13e12, role: 'estimate' },
  { label: 'Llama 3 pretrain (Meta 2024)', tokens: 15e12, role: 'published' },
];

export const SCALE_CHART_FOOTNOTE =
  'Two linear zoom levels (no log axis): top = raw tokens vs one English Wikipedia snapshot (~5B tokens); bottom = same pretrain totals as panel A, axis in raw tokens, with “× Wikipedia” computed from those published/estimated totals. A token ≈ one word piece. GPT-3: Brown et al. 2020. Llama 2/3: Meta model cards. GPT-4-class: industry estimate (not officially published).';
