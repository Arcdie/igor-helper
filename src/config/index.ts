export default {
  app: {
    host: 'localhost',
    url: process.env.APP_URL,
    environment: process.env.NODE_ENV,
    port: Number(process.env.APP_PORT),
    name: String(process.env.SENDGRID_FROM),
    cookieLifetime: 30 * 24 * 60 * 60 * 1000,
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

  aws: {
    region: 'eu-central-1',
    bucket: 'igor-helper-files',
    accessKey: String(process.env.AWS_ACCESS_KEY),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  },

  sendgrid: {
    from: String(process.env.SENDGRID_FROM),
    apikey: String(process.env.SENDGRID_APIKEY),
  },

  google: {
    apikey: String(process.env.GOOGLE_APIKEY),
  },

  jwt: {
    secret: String(process.env.JWT_SECRET),
  },
};
