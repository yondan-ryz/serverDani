const { success } = require('../utils/response');
const { barcodeService } = require('../services/barcodeService');

const router = require('express').Router();

router.post(['', '/'], async (req, res, next) => {
  try {
    const body = req.body || {};
    const value = body.value;
    const type = body.type; // default: code128, optional: ean13

    const data = await barcodeService({ value, type });
    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

