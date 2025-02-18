export const ENV = {
    DATABASE_HOST: (process.env.APP_MODE == "development") ? process.env.DEV_DATABASE_HOST : process.env.DATABASE_HOST,
    DATABASE_PORT: (process.env.APP_MODE == "development") ? process.env.DEV_DATABASE_PORT : process.env.DATABASE_PORT,
    DATABASE_USER: (process.env.APP_MODE == "development") ? process.env.DEV_DATABASE_USER : process.env.DATABASE_USER,
    DATABASE_PASSWORD: (process.env.APP_MODE == "development") ? process.env.DEV_DATABASE_PASSWORD : process.env.DATABASE_PASSWORD,
    DATABASE_NAME: (process.env.APP_MODE == "development") ? process.env.DEV_DATABASE_NAME : process.env.DATABASE_NAME,

    STRIPE_SECRET_KEY: (process.env.APP_MODE == "development") ? process.env.STRIPE_SECRET_KEY_DEV : process.env.STRIPE_SECRET_KEY,

    JWT_SECRET : process.env.JWT_SECRET,
    JWT_EXPIRES_IN : process.env.JWT_EXPIRES_IN,

    AX_COMPLETION_TOKENS: process.env.MAX_COMPLETION_TOKENS || 1000,
    GENERATE_SUMMARY_TOKEN: process.env.GENERATE_SUMMARY_TOKEN || 1000,
    GENERATE_SUMMARY_QUESTION: process.env.GENERATE_SUMMARY_QUESTION || 10,

    APP_PORT: process.env.APP_PORT,

    QUERY_USAGE_LIMIT: Number(process.env.QUERY_USAGE_LIMIT),
    LOG_DIRECTORY: process.env.LOG_DIRECTORY,
    MAX_LOG_FILES: process.env.MAX_LOG_FILES,
    UPLOAD_IN: process.env.UPLOAD_IN,
    APP_URL: process.env.APP_URL
};