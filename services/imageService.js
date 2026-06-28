const Jimp = require('jimp');

function normalizeFormat(format) {
  const f = (format || '').toLowerCase();
  if (['jpeg', 'jpg', 'png', 'webp', 'avif'].includes(f)) return f === 'jpg' ? 'jpeg' : f;
  return 'webp';
}

async function imageService({ action, imageBase64, quality, format } = {}) {
  const act = (action || '').toLowerCase() || 'compress';
  if (act !== 'compress') {
    throw Object.assign(new Error('Invalid action. Supported: compress'), { statusCode: 400 });
  }
  if (!imageBase64) throw Object.assign(new Error('imageBase64 is required'), { statusCode: 400 });

  // Accept raw base64 or dataUrl
  const b64 = String(imageBase64);
  const cleaned = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
  const buf = Buffer.from(cleaned, 'base64');

  let q = quality != null ? Number(quality) : 80;
  if (!Number.isFinite(q)) q = 80;
  q = Math.max(1, Math.min(100, q));

  const fmt = normalizeFormat(format);

  const image = await Jimp.read(buf);

  // Jimp quality mapping is supported for jpeg/webp via quality() (not all formats)
  if (typeof image.quality === 'function') {
    image.quality(q);
  }

  let mime;
  let outFormat = fmt;
  if (fmt === 'jpeg') mime = 'image/jpeg';
  else if (fmt === 'png') mime = 'image/png';
  else if (fmt === 'webp') mime = 'image/webp';
  else if (fmt === 'avif') {
    // Jimp may not support avif; fall back to webp
    outFormat = 'webp';
    mime = 'image/webp';
  }

  let out;
  if (outFormat === 'png') out = await image.getBufferAsync(Jimp.MIME_PNG);
  else if (outFormat === 'jpeg') out = await image.getBufferAsync(Jimp.MIME_JPEG);
  else out = await image.getBufferAsync(Jimp.MIME_WEBP);

  const base64 = out.toString('base64');
  return { mime, format: outFormat, pngOrImageBase64: base64, dataUrl: `data:${mime};base64,${base64}` };
}

module.exports = { imageService };

