module.exports = {
  apps: [
    {
      name: "prospct-server",
      script: "./server.js",
      env_production: {
        NODE_ENV: "production",
        MONGO_URL:
          "mongodb://tanvir:Ticltd%40%40@localhost:27017/ticltdDB?authSource=admin",
        JWT_SECRET: "Prospct by Sadain",
      },
    },
  ],
};
