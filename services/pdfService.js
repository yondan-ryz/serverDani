const PDFDocument = require('pdfkit');

async function pdfService({ text } = {}) {
  const t = text != null ? String(text) : '';

  const doc = new PDFDocument({ autoFirstPage: true });

  // Build buffer
  const chunks = [];
  return await new Promise((resolve, reject) => {
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).text(t, { align: 'left' });
    doc.end();
  });
}

module.exports = { pdfService };

