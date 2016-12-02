const Redis = require('ioredis')
const redis = new Redis()

module.exports = {
  add: (userId, token) => {
    return redis.hmset('token:' + token, 'userId', userId, 'createdAt', Date.now(), 'expiresAt', (Date.now() + 10800000))
  },

  isExistingToken: (accessToken) => {
    return redis.hgetall('token:' + accessToken)
  },

  getToken: (req) => {
    var accessToken = req.cookies.accessToken
    		if (!accessToken) accessToken = req.headers['x-accessToken']
    		return accessToken  }
}
