const { success } = require('../utils/response');
const { textService } = require('../services/textService');

const router = require('express').Router();

router.post(['', '/'], async (req, res, next) => {
  try {
    const body = req.body || {};
    const action = body.action;
    const text = body.text;

    const data = await textService({ action, text });
    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

