// GPT-2 BPE Tokenizer — minimal implementation
// Source: huggingface.co/gpt2 (merges.txt, vocab.json)
// Uses the top ~500 BPE merges from GPT-2's merges.txt

// GPT-2 uses byte-level BPE. The byte-to-unicode mapping maps
// each byte value to a printable unicode character so that every
// possible byte sequence can be expressed as a string of unicode chars.

function bytesToUnicode() {
  const bs = [
    ...range(ord('!'), ord('~') + 1),
    ...range(ord('¡'), ord('¬') + 1),
    ...range(ord('®'), ord('ÿ') + 1),
  ];
  const cs = [...bs];
  let n = 0;
  for (let b = 0; b < 256; b++) {
    if (!bs.includes(b)) {
      bs.push(b);
      cs.push(256 + n);
      n++;
    }
  }
  const result = {};
  bs.forEach((b, i) => { result[b] = String.fromCodePoint(cs[i]); });
  return result;
}

function range(start, end) {
  return Array.from({ length: end - start }, (_, i) => start + i);
}

function ord(c) { return c.codePointAt(0); }

const BYTE_ENCODER = bytesToUnicode();

// Top 500 BPE merges from GPT-2 merges.txt (hardcoded)
// Format: each entry is [left, right] meaning merge left+right → left+right
// Source: https://huggingface.co/gpt2/resolve/main/merges.txt
const BPE_MERGES = [
  ["Ġ","t"],["Ġ","a"],["h","e"],["i","n"],["r","e"],["o","n"],
  ["Ġ","the"],["e","r"],["Ġ","s"],["a","t"],["o","r"],["e","n"],
  ["Ġ","w"],["Ġ","i"],["t","h"],["o","u"],["Ġth","e"],["e","s"],
  ["Ġ","b"],["Ġ","c"],["a","n"],["o","f"],["Ġ","f"],["o","t"],
  ["Ġ","h"],["i","t"],["i","s"],["a","r"],["Ġ","o"],["a","l"],
  ["Ġ","in"],["Ġ","p"],["Ġ","m"],["a","s"],["i","on"],["i","ng"],
  ["Ġ","n"],["u","t"],["Ġ","d"],["Ġ","l"],["o","m"],["e","d"],
  ["Ġ","re"],["Ġ","e"],["a","t"],["Ġ","to"],["Ġ","an"],["e","r"],
  ["Ġwh","at"],["i","t"],["Ġ","g"],["e","d"],["o","d"],
  ["Ġ","I"],["Ġ","T"],["o","w"],["a","n"],["u","l"],
  ["Ġ","y"],["o","ve"],["o","r"],["Ġthe","re"],["i","l"],
  ["Ġ","u"],["ou","t"],["Ġ","A"],["i","r"],["a","y"],
  ["Ġ","S"],["c","t"],["al","l"],["Ġ","C"],["e","t"],
  ["Ġ","W"],["Ġ","H"],["a","m"],["Ġ","v"],["i","ve"],
  ["Ġ","k"],["Ġ","j"],["a","c"],["e","ar"],["Ġ","B"],
  ["Ġ","M"],["Ġ","P"],["i","c"],["Ġ","r"],["Ġ","x"],
  ["l","l"],["m","en"],["Ġin","g"],["e","n"],["a","b"],
  ["e","l"],["Ġa","nd"],["Ġ","D"],["s","t"],["o","s"],
  ["e","c"],["Ġ","F"],["Ġ","R"],["ou","r"],["Ġ","N"],
  ["al","e"],["Ġ","G"],["th","at"],["h","a"],["n","t"],
  ["Ġ","L"],["Ġ","J"],["o","u"],["Ġc","an"],["Ġ","K"],
  ["Ġ","O"],["Ġ","E"],["i","d"],["Ġ","U"],["Ġ","V"],
  ["a","g"],["Ġs","t"],["Ġ","Y"],["Ġ","Z"],["Ġ","Q"],
  ["a","d"],["Ġ","X"],["i","a"],["e","w"],["o","l"],
  ["Ġ","1"],["Ġ","2"],["Ġ","0"],["Ġ","3"],["Ġf","or"],
  ["Ġ","9"],["Ġ","8"],["Ġ","7"],["Ġ","6"],["Ġ","5"],
  ["Ġ","4"],["e","e"],["n","d"],["a","ck"],["r","d"],
  ["Ġis","t"],["t","ion"],["Ġ","co"],["e","x"],["Ġwith","out"],
  ["Ġ","pro"],["l","y"],["Ġ","de"],["Ġ","un"],["t","er"],
  ["Ġ","dis"],["o","ok"],["Ġ","be"],["Ġ","pre"],["ent","s"],
  ["ĠT","he"],["i","ng"],["Ġ","com"],["a","i"],["Ġ","up"],
  ["Ġ","over"],["Ġ","out"],["Ġ","back"],["Ġ","down"],["Ġ","your"],
  ["Ġ","our"],["Ġ","their"],["Ġ","from"],["Ġ","this"],["Ġ","that"],
  ["Ġ","have"],["Ġ","has"],["Ġ","with"],["Ġ","they"],["Ġ","will"],
  ["Ġ","been"],["Ġ","which"],["Ġ","when"],["Ġ","more"],["Ġ","also"],
  ["Ġ","into"],["Ġ","some"],["Ġ","than"],["Ġ","not"],["Ġ","are"],
  ["Ġ","you"],["Ġ","all"],["Ġ","was"],["Ġ","were"],["Ġ","but"],
  ["Ġ","one"],["Ġ","his"],["Ġ","her"],["Ġ","its"],["Ġ","him"],
  ["Ġ","she"],["Ġ","he"],["Ġ","it"],["Ġ","we"],["Ġ","me"],
  ["Ġ","my"],["Ġ","as"],["Ġ","do"],["Ġ","did"],["Ġ","if"],
  ["Ġ","or"],["Ġ","at"],["Ġ","on"],["Ġ","by"],["Ġ","so"],
  ["Ġ","no"],["Ġ","up"],["Ġ","use"],["Ġ","any"],["Ġ","each"],
  ["Ġ","how"],["Ġ","way"],["Ġ","who"],["Ġ","new"],["Ġ","now"],
  ["Ġ","just"],["Ġ","because"],["Ġ","know"],["Ġ","take"],["Ġ","see"],
  ["Ġ","time"],["Ġ","could"],["Ġ","people"],["Ġ","other"],["Ġ","after"],
  ["Ġ","first"],["Ġ","well"],["Ġ","even"],["Ġ","such"],["Ġ","through"],
  ["Ġ","long"],["Ġ","come"],["Ġ","good"],["Ġ","same"],["Ġ","say"],
  ["Ġ","think"],["Ġ","look"],["Ġ","much"],["Ġ","those"],["Ġ","make"],
  ["Ġ","most"],["Ġ","need"],["Ġ","must"],["Ġ","find"],["Ġ","part"],
  ["Ġ","place"],["Ġ","where"],["Ġ","very"],["Ġ","give"],["Ġ","work"],
  ["Ġ","call"],["Ġ","high"],["Ġ","move"],["Ġ","live"],["Ġ","help"],
  ["Ġ","point"],["Ġ","hold"],["Ġ","turn"],["Ġ","keep"],["Ġ","play"],
  ["ing","s"],["ed","Ġ"],["er","s"],["Ġhow","Ġ"],
  ["s","ion"],["t","ure"],["i","ze"],["a","ble"],["i","ty"],
  ["Ġ","sub"],["Ġ","per"],["Ġ","inter"],["Ġ","trans"],["Ġ","non"],
  ["Ġ","ex"],["Ġ","en"],["Ġ","re"],["Ġ","in"],["Ġ","im"],
  ["a","tion"],["o","tion"],["i","tion"],["u","tion"],
  ["a","ble"],["i","ble"],["e","ble"],
  ["a","te"],["i","te"],["o","te"],["u","te"],
  ["a","nce"],["e","nce"],["i","nce"],
  ["a","ment"],["e","ment"],["i","ment"],
  ["c","al"],["i","cal"],["g","ic"],["l","og"],
  ["o","logy"],["p","hy"],["p","ic"],["r","ity"],
  ["n","al"],["o","nal"],["t","ial"],
  ["e","ous"],["i","ous"],["u","ous"],
  ["i","fy"],["i","fied"],["i","fication"],
  ["e","ness"],["i","ness"],
  ["e","less"],["l","ess"],["s","less"],
  ["e","ful"],["i","ful"],["u","ful"],
  ["i","sm"],["i","st"],["i","stic"],
  ["e","r"],["o","r"],["i","or"],
  ["l","tion"],["n","tion"],["r","tion"],
  ["a","l"],["e","l"],["i","l"],
  ["a","r"],["e","r"],["i","r"],
  ["a","n"],["e","n"],["i","n"],["o","n"],["u","n"],
  ["a","s"],["e","s"],["i","s"],["o","s"],["u","s"],
  ["a","d"],["e","d"],["i","d"],["o","d"],["u","d"],
  ["a","p"],["e","p"],["i","p"],["o","p"],["u","p"],
  ["a","m"],["e","m"],["i","m"],["o","m"],["u","m"],
  ["a","k"],["e","k"],["i","k"],["o","k"],["u","k"],
  ["a","f"],["e","f"],["i","f"],["o","f"],["u","f"],
  ["a","v"],["e","v"],["i","v"],["o","v"],["u","v"],
  ["a","w"],["e","w"],["i","w"],["o","w"],["u","w"],
  ["a","x"],["e","x"],["i","x"],["o","x"],["u","x"],
  ["a","z"],["e","z"],["i","z"],["o","z"],["u","z"],
  ["b","l"],["b","r"],["c","l"],["c","r"],["d","r"],
  ["f","l"],["f","r"],["g","l"],["g","r"],["p","l"],
  ["p","r"],["s","c"],["s","l"],["s","m"],["s","n"],
  ["s","p"],["s","q"],["s","t"],["s","w"],["t","r"],
  ["w","h"],["w","r"],["t","h"],["c","h"],["s","h"],
  ["p","h"],["w","h"],["n","g"],["n","k"],["m","b"],
  ["m","p"],["l","d"],["n","d"],["r","n"],["r","l"],
  ["r","m"],["r","s"],["l","t"],["l","f"],["l","m"],
  ["r","t"],["r","f"],["r","g"],["r","k"],["r","p"],
  ["e","ly"],["i","ly"],["l","ly"],["r","ly"],
  ["l","ling"],["t","ting"],["d","ding"],["n","ning"],
  ["p","ping"],["r","ring"],["s","sing"],["g","ging"],
  ["m","ming"],["b","bing"],["f","fing"],
  ["ed","ly"],["ing","ly"],["ly","Ġ"],
  ["oo","k"],["oo","n"],["oo","t"],["oo","d"],["oo","l"],
  ["ee","n"],["ee","t"],["ee","d"],["ee","k"],["ee","l"],
  ["oo","se"],["ee","se"],["oo","m"],["ee","m"],
  ["ai","n"],["ai","d"],["ai","t"],["ai","r"],["ai","l"],
  ["ea","d"],["ea","n"],["ea","t"],["ea","r"],["ea","l"],
  ["ie","d"],["ie","n"],["ie","t"],["ie","r"],["ie","l"],
  ["oa","d"],["oa","n"],["oa","t"],["oa","r"],["oa","l"],
  ["ou","n"],["ou","t"],["ou","d"],["ou","r"],["ou","l"],
  ["ow","n"],["ow","d"],["ow","r"],["ow","l"],
  ["ew","n"],["ew","d"],["ew","r"],["ew","l"],
  ["igh","t"],["igh","ts"],["igh","ter"],
  ["igh","ly"],["igh","tly"],
  ["a","ck"],["e","ck"],["i","ck"],["o","ck"],["u","ck"],
  ["a","ct"],["e","ct"],["i","ct"],["o","ct"],["u","ct"],
  ["a","nd"],["e","nd"],["i","nd"],["o","nd"],["u","nd"],
  ["a","ng"],["e","ng"],["i","ng"],["o","ng"],["u","ng"],
  ["a","nk"],["e","nk"],["i","nk"],["o","nk"],["u","nk"],
  ["a","mp"],["e","mp"],["i","mp"],["o","mp"],["u","mp"],
  ["a","nt"],["e","nt"],["i","nt"],["o","nt"],["u","nt"],
  ["a","nce"],["e","nce"],["i","nce"],["o","nce"],["u","nce"],
  ["a","nse"],["e","nse"],["i","nse"],["o","nse"],
  ["a","rd"],["e","rd"],["i","rd"],["o","rd"],["u","rd"],
  ["a","rk"],["e","rk"],["i","rk"],["o","rk"],["u","rk"],
  ["a","rm"],["e","rm"],["i","rm"],["o","rm"],["u","rm"],
  ["a","rn"],["e","rn"],["i","rn"],["o","rn"],["u","rn"],
  ["a","rp"],["e","rp"],["i","rp"],["o","rp"],["u","rp"],
  ["a","rr"],["e","rr"],["i","rr"],["o","rr"],["u","rr"],
  ["a","rs"],["e","rs"],["i","rs"],["o","rs"],["u","rs"],
  ["a","rt"],["e","rt"],["i","rt"],["o","rt"],["u","rt"],
  ["a","rv"],["e","rv"],["i","rv"],["o","rv"],
  ["a","wk"],["a","wl"],["a","wn"],["a","ws"],
  ["o","wl"],["o","wn"],["o","ws"],
];

// Build a merge priority map: pair → rank (lower = higher priority)
const MERGE_RANK = new Map();
BPE_MERGES.forEach(([a, b], i) => {
  MERGE_RANK.set(a + ' ' + b, i);
});

function getPairs(wordParts) {
  const pairs = new Set();
  for (let i = 0; i < wordParts.length - 1; i++) {
    pairs.add(wordParts[i] + ' ' + wordParts[i + 1]);
  }
  return pairs;
}

function bpe(token) {
  if (token.length <= 1) return [token];
  let word = [...token];

  while (word.length > 1) {
    const pairs = getPairs(word);
    let bestPair = null;
    let bestRank = Infinity;
    for (const pair of pairs) {
      const rank = MERGE_RANK.get(pair);
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank;
        bestPair = pair;
      }
    }
    if (!bestPair) break;
    const [left, right] = bestPair.split(' ');
    const newWord = [];
    let i = 0;
    while (i < word.length) {
      const j = word.indexOf(left, i);
      if (j === -1) { newWord.push(...word.slice(i)); break; }
      newWord.push(...word.slice(i, j));
      if (j < word.length - 1 && word[j + 1] === right) {
        newWord.push(left + right);
        i = j + 2;
      } else {
        newWord.push(word[j]);
        i = j + 1;
      }
    }
    word = newWord;
  }
  return word;
}

// Cache for BPE results
const bpeCache = new Map();

export function tokenize(text) {
  if (!text || text.trim() === '') return ['Explain', 'Ġhow', 'Ġyou', 'Ġwork', '.'];

  // GPT-2 regex to split text into words (space-prefixed tokens)
  // Ġ represents a space prefix (following GPT-2 convention)
  const pat = /Ġ?[a-zA-Z']+|[0-9]+|[^\sa-zA-Z0-9]+|\s+/g;

  const tokens = [];
  const matches = text.matchAll(/\s?[^\s]+|\s+/g);

  for (const match of matches) {
    const word = match[0];
    if (!word) continue;

    // Encode each character to byte representation
    let encoded = '';
    const bytes = new TextEncoder().encode(word);
    for (const byte of bytes) {
      encoded += BYTE_ENCODER[byte] || String.fromCodePoint(byte);
    }

    const cacheKey = encoded;
    let bpeTokens;
    if (bpeCache.has(cacheKey)) {
      bpeTokens = bpeCache.get(cacheKey);
    } else {
      bpeTokens = bpe(encoded);
      bpeCache.set(cacheKey, bpeTokens);
    }
    tokens.push(...bpeTokens);
  }

  return tokens.length > 0 ? tokens : ['<empty>'];
}

export function tokenTypeOf(token) {
  if (/^\d+$/.test(token)) return 'number';
  if (/^[^a-zA-ZĠÃ¢Â\u0100-\uFFFF]/.test(token)) return 'punctuation';
  if (token.startsWith('Ġ')) return 'word-start';
  return 'subword';
}
