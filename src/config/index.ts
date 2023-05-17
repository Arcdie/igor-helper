const config = {
  app: {
    host: 'localhost',
    name: 'igor-helper',
    url: process.env.APP_URL,
    environment: process.env.NODE_ENV,
    port: Number(process.env.APP_PORT),
  },

  mongodb: {
    host: process.env.MONGODB_HOST,
    port: process.env.MONGODB_PORT,
    database: process.env.MONGODB_DATABASE,
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    options: {
      connectTimeoutMS: 30000,
    },
  },

  sendgrid: {
    from: String(process.env.SENDGRID_FROM),
    apikey: String(process.env.SENDGRID_APIKEY),
  },

  jwt: {
    secret: String(process.env.JWT_SECRET),
  },
};

export default config;
