function success(res, message = 'Success', data = {}) {
  return res.status(200).json({ success: true, message, data });
}

function error(res, message = 'Error', statusCode = 400) {
  return res.status(statusCode).json({ success: false, message });
}

module.exports = { success, error };

