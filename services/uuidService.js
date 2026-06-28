const { v4: uuidv4 } = require('uuid');

function generateUuid({ version } = {}) {
  // uuid npm package supports v7 in newer versions, but to keep safe we:
  // - default to uuidv4
  // - if version===7 and uuid provides v7, use it
  const wantV7 = Number(version) === 7;

  if (wantV7 && typeof require('uuid').v7 === 'function') {
    return require('uuid').v7();
  }

  if (wantV7) {
    throw Object.assign(new Error('UUID v7 not supported by installed uuid package'), { statusCode: 400 });
  }

  return uuidv4();
}

module.exports = { generateUuid };

