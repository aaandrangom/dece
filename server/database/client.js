import { createClient } from "@libsql/client";
import { EnvConfig } from "../config/env.js";

export const turso = createClient({
    url: EnvConfig().tursoDatabaseUrl,
    authToken: EnvConfig().tursoAuthToken
});