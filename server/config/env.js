const {
    PORT,
    TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN,
    ACCESS_TOKEN_SECRET_KEY,
    REFRESH_TOKEN_SECRET_KEY,
    NODE_ENV
} = process.env;

export const EnvConfig = () => ({
    port: PORT,
    tursoDatabaseUrl: TURSO_DATABASE_URL,
    tursoAuthToken: TURSO_AUTH_TOKEN,
    accessTokenSecretKey: ACCESS_TOKEN_SECRET_KEY,
    refreshTokenSecretKey: REFRESH_TOKEN_SECRET_KEY,
    env: NODE_ENV
})
