const { success } = require('../utils/response');
const { imageService } = require('../services/imageService');

const router = require('express').Router();

router.post(['', '/'], async (req, res, next) => {
  try {
    const body = req.body || {};
    const action = body.action;
    const imageBase64 = body.imageBase64;
    const quality = body.quality;
    const format = body.format;

    const data = await imageService({ action, imageBase64, quality, format });
    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

