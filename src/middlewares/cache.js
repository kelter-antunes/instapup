const NodeCache = require('node-cache')

const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new NodeCache({ stdTTL: ttl })

function set(key) {
  console.log('setting cache for ' + key);
  cache.set(user, res.locals.data)
  return next()
}

function get(key) {
  console.log('reading cache for ' key);
  const content = cache.get(key)
  if (content) {
    return res.status(200).send(content)
  }
  return next()
}

module.exports = { get, set }