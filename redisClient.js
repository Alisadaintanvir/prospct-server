// server/redisClient.js
const Redis = require("ioredis");

// Configure Redis connection (default is localhost:6379)
const redis = new Redis({
  host: "redis-18543.c17.us-east-1-4.ec2.redns.redis-cloud.com", // Redis server address
  port: 18543, // Redis server port
  password: "LORV9p8EWz0nReW2Uldx3EmFrSivhGDk", // If you have a password set for Redis
  // db: 0               // Select database number
});

module.exports = redis;
