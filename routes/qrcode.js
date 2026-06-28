const { success } = require('../utils/response');
const { qrcodeService } = require('../services/qrcodeService');

const router = require('express').Router();

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const text = body.text;
    const size = body.size;

    const data = await qrcodeService({ text, size });
    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;


