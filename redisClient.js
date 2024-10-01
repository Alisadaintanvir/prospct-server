// server/redisClient.js
const Redis = require("ioredis");

// Configure Redis connection (default is localhost:6379)
const redis = new Redis({
  host: "Jbi6TgnhsiSKmIhGTVfN2SyFxsrsL7P2", // Redis server address
  port: 15752, // Redis server port
  password: "LORV9p8EWz0nReW2Uldx3EmFrSivhGDk", // If you have a password set for Redis
  // db: 0               // Select database number
});

module.exports = redis;
