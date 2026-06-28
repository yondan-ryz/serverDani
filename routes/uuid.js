const { success } = require('../utils/response');
const { generateUuid } = require('../services/uuidService');

const router = require('express').Router();

router.get('/', async (req, res, next) => {
  try {
    const versionParam = req.query.version;
    const version = versionParam ? Number(versionParam) : undefined;

    const uuid = generateUuid({ version });
    return success(res, 'Success', { uuid });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

