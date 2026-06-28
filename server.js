const express = require('express');
const fs = require('fs');
const path = require('path');

const { errorHandler } = require('./middleware/errorHandler');

const uuidRoutes = require('./routes/uuid');
const timestampRoutes = require('./routes/timestamp');
const qrcodeRoutes = require('./routes/qrcode');
const barcodeRoutes = require('./routes/barcode');
const minifyRoutes = require('./routes/minify');
const textRoutes = require('./routes/text');
const imageRoutes = require('./routes/image');
const pdfRoutes = require('./routes/pdf');
const enigmaRoutes = require('./routes/enigma');

const app = express();

app.use(express.json({ limit: '10mb' }));

function loadConfig() {
  const configPath = path.join(__dirname, 'server.json');
  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return { version: 1, servers: [{ name: 'default', host: 'localhost', port: 3000 }] };
  }
}

const config = loadConfig();
const serverEntry = (config.servers && config.servers[0]) || { host: 'localhost', port: 3000 };

// ---- Routes ----
app.use('/api/uuid', uuidRoutes);
app.use('/api/timestamp', timestampRoutes);
app.use('/api/qrcode', qrcodeRoutes);
app.use('/api/barcode', barcodeRoutes);
app.use('/api/minify', minifyRoutes);
app.use('/api/text', textRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/enigma', enigmaRoutes);

// Support old-style GET routes (backward compatible)

// GET /api/timestamp -> treated as action now
app.get('/api/timestamp', async (req, res, next) => {
  try {
    const data = await require('./services/timestampService').timestampService({ action: 'now' });
    return res.json({ success: true, message: 'Success', data });
  } catch (e) {
    return next(e);
  }
});

// GET /api/qrcode?text=... -> treated as POST with {text,size}
app.get('/api/qrcode', async (req, res, next) => {
  try {
    const data = await require('./services/qrcodeService').qrcodeService({
      text: req.query.text,
      size: req.query.size
    });
    return res.json({ success: true, message: 'Success', data });
  } catch (e) {
    return next(e);
  }
});

// If someone calls POST /api/timestamp (no trailing slash)
app.post('/api/timestamp', async (req, res, next) => {
  try {
    const { action } = req.body || {};
    const data = await require('./services/timestampService').timestampService({ action });
    return res.json({ success: true, message: 'Success', data });
  } catch (e) {
    return next(e);
  }
});

// If someone calls POST /api/qrcode (no trailing slash)
app.post('/api/qrcode', async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = await require('./services/qrcodeService').qrcodeService({ text: body.text, size: body.size });
    return res.json({ success: true, message: 'Success', data });
  } catch (e) {
    return next(e);
  }
});



// 404
app.use((req, res) => {
  return res.status(404).json({ success: false, message: 'Not Found' });
});

// Global error handler
app.use(errorHandler);

// ---- Start ----
const port = serverEntry.port || 3000;
const host = serverEntry.host || 'localhost';

app.listen(port, host, () => {
  console.log(`API running on http://${host}:${port}`);
});


