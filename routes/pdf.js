const { pdfService } = require('../services/pdfService');

const router = require('express').Router();

router.post(['', '/'], async (req, res, next) => {
  try {
    const body = req.body || {};
    const text = body.text;

    const pdfBuffer = await pdfService({ text });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
    res.setHeader('Content-Length', Buffer.byteLength(pdfBuffer));
    return res.status(200).send(pdfBuffer);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

