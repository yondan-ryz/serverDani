async function timestampService({ action } = {}) {
  const act = String(action || 'now');
  const now = new Date();

  if (act === 'now') {
    return {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      seconds: Math.floor(now.getTime() / 1000)
    };
  }

  if (act === 'toUnix') {
    return { unix: Math.floor(now.getTime() / 1000) };
  }

  if (act === 'toDate') {
    return { date: now.toISOString() };
  }

  throw Object.assign(new Error('Invalid action. Supported: now, toUnix, toDate'), { statusCode: 400 });
}

module.exports = { timestampService };

