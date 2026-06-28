const MORSE = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '/': '-..-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  '(': '-.--.',
  ')': '-.--.-',
  ' ': '/' // not used directly in encode
};

const REVERSE = Object.entries(MORSE).reduce((acc, [k, v]) => {
  if (k === ' ') return acc;
  acc[v] = k;
  return acc;
}, {});

function normalizeSpacesForDecode(str) {
  // We accept: '/' as word separator; symbols separated by spaces
  return String(str)
    .trim()
    .replace(/\s+/g, ' ');
}

async function textService({ action, text } = {}) {
  const act = (action || '').toLowerCase();
  if (!text || String(text).trim() === '') {
    throw Object.assign(new Error('text is required'), { statusCode: 400 });
  }

  if (act === 'morseencode') {
    const raw = String(text).toUpperCase();
    const words = raw.split(' ');
    const encodedWords = words.map((word) => {
      const symbols = Array.from(word).map((ch) => {
        if (MORSE[ch]) return MORSE[ch];
        if (ch === ' ') return '/';
        throw Object.assign(new Error(`Unsupported character for morse: ${ch}`), { statusCode: 400 });
      });
      return symbols.join(' ');
    });
    return { morse: encodedWords.join(' / ') };
  }

  if (act === 'morsedecode') {
    const norm = normalizeSpacesForDecode(text);
    // Split by word separator '/'
    const wordParts = norm.split('/').map((s) => s.trim()).filter(Boolean);
    const decodedWords = wordParts.map((part) => {
      const tokens = part.split(' ').filter(Boolean);
      return tokens.map((tok) => {
        const ch = REVERSE[tok];
        if (!ch) throw Object.assign(new Error(`Invalid morse token: ${tok}`), { statusCode: 400 });
        return ch;
      }).join('');
    });
    return { text: decodedWords.join(' ') };
  }

  throw Object.assign(new Error('Invalid action. Supported: morseEncode, morseDecode'), { statusCode: 400 });
}

module.exports = { textService };

