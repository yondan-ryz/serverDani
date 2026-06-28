const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function getShiftFromKey(key) {
  if (!key || typeof key !== 'string' || key.length !== 1) return 0;

  key = key.toUpperCase();

  if (key < 'A' || key > 'Z') return 0;

  return key.charCodeAt(0) - 65;
}

function encrypt(text, key) {
  let shift = getShiftFromKey(key);
  let result = '';

  text = (text || '').toUpperCase();

  for (const ch of text) {
    const idx = alphabet.indexOf(ch);

    if (idx === -1) {
      result += ch;
      continue;
    }

    result += alphabet[(idx + shift) % 26];
    shift = (shift + 1) % 26;
  }

  return result;
}

function decrypt(text, key) {
  let shift = getShiftFromKey(key);
  let result = '';

  text = (text || '').toUpperCase();

  for (const ch of text) {
    const idx = alphabet.indexOf(ch);

    if (idx === -1) {
      result += ch;
      continue;
    }

    let original = idx - shift;

    while (original < 0) original += 26;

    result += alphabet[original % 26];
    shift = (shift + 1) % 26;
  }

  return result;
}

async function enigmaService({ action, text, key }) {
  const safeAction = String(action || '').toLowerCase();
  const safeText = text || '';
  const safeKey = key ?? 'A';

  if (typeof safeKey !== 'string' || safeKey.length !== 1) {
    const err = new Error('Key harus 1 huruf A-Z');
    err.statusCode = 400;
    throw err;
  }

  const upperKey = safeKey.toUpperCase();
  if (upperKey < 'A' || upperKey > 'Z') {
    const err = new Error('Key harus 1 huruf A-Z');
    err.statusCode = 400;
    throw err;
  }

  if (safeAction === 'encrypt') {
    return {
      action: 'encrypt',
      input: safeText,
      key: upperKey,
      result: encrypt(safeText, upperKey)
    };
  }

  if (safeAction === 'decrypt') {
    return {
      action: 'decrypt',
      input: safeText,
      key: upperKey,
      result: decrypt(safeText, upperKey)
    };
  }

  const err = new Error("Action harus 'encrypt' atau 'decrypt'");
  err.statusCode = 400;
  throw err;
}

module.exports = { enigmaService };

