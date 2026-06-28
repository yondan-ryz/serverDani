const bwipjs = require('bwip-js');

function barcodeFormatValue({ type } = {}) {
  const t = type ? String(type).toLowerCase() : 'code128';
  if (t === 'ean13' || t === 'code128') return t;
  return 'code128';
}

async function barcodeService({ value, type } = {}) {
  if (value == null || String(value).trim() === '') {
    throw Object.assign(new Error('value is required'), { statusCode: 400 });
  }

  const v = String(value);
  const format = barcodeFormatValue({ type });

  // bwip-js expects numeric for EAN types
  if (format === 'ean13') {
    if (!/^\d{12,13}$/.test(v)) {
      throw Object.assign(new Error('For ean13, value must be 12-13 digits'), { statusCode: 400 });
    }
    // If 12 digits provided, let bwip-js compute/check? bwip-js requires full? Keep strict for now.
    // For safety, require 13 digits.
    if (!/^\d{13}$/.test(v)) {
      throw Object.assign(new Error('For ean13, value must be exactly 13 digits'), { statusCode: 400 });
    }
  }

  const pngBuffer = await bwipjs.toBuffer({
    bcid: format === 'ean13' ? 'ean13' : 'code128',
    text: v,
    scale: 3,
    height: 10,
    includetext: true,
    backgroundcolor: 'FFFFFF'
  });

  return {
    type: format,
    value: v,
    pngBase64: pngBuffer.toString('base64'),
    dataUrl: `data:image/png;base64,${pngBuffer.toString('base64')}`
  };
}

module.exports = { barcodeService };

