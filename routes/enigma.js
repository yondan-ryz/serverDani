const router = require('express').Router();

const { enigmaService } = require('../services/enigmaService');
const { success } = require('../utils/response');

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};
    const data = await enigmaService({
      action: body.action,
      text: body.text,
      key: body.key
    });

    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

