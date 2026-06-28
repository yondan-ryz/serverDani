const QRCode = require('qrcode');

async function qrcodeService({ text, size } = {}) {
  const t = text != null ? String(text) : 'hello';
  const w = size != null ? Number(size) : 256;

  if (!t) throw Object.assign(new Error('text is required'), { statusCode: 400 });
  if (!Number.isFinite(w) || w <= 0) throw Object.assign(new Error('size must be a positive number'), { statusCode: 400 });

  const pngBuffer = await QRCode.toBuffer(t, {
    type: 'png',
    width: w,
    margin: 1,
    errorCorrectionLevel: 'M'
  });

  const pngBase64 = pngBuffer.toString('base64');

  return {
    text: t,
    pngBase64,
    dataUrl: `data:image/png;base64,${pngBase64}`
  };
}

module.exports = { qrcodeService };

