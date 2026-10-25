// backend/middleware/sanitize.js
// Basic protection against NoSQL operator injection such as {"email": {"$ne": null}}.
// Removes any key starting with "$" or containing "." from req.body (works on Express 5).
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      out[key] = clean(val);
    }
    return out;
  }
  return value;
};

module.exports = (req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = clean(req.body);
  next();
};
