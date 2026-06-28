const { success } = require('../utils/response');
const { timestampService } = require('../services/timestampService');

const router = require('express').Router();

router.post('/', async (req, res, next) => {
  try {
    const { action } = req.body || {};
    const data = await timestampService({ action });
    return success(res, 'Success', data);
  } catch (e) {
    return next(e);
  }
});

module.exports = router;


