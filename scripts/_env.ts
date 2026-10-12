// Load .env, .env.local etc. the same way Next.js does, so scripts see the same configuration.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
