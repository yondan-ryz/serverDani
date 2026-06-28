const { success } = require('../utils/response');
const { minifyService } = require('../services/minifyService');

const router = require('express').Router();

router.post(['', '/'], async (req, res, next) => {
  try {
    const body = req.body || {};
    const type = body.type;
    const code = body.code;

    const data = await minifyService({ type, code });
    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

