import { z } from 'zod'

const configSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    API_BASE_URL: z.string(),
    API_KEY: z.string(),
    API_SECRET: z.string(),
    API_TIMEOUT: z.number().default(10000),
    API_RETRIES: z.number().default(3),
    API_RETRY_DELAY: z.number().default(1000),
    API_RETRY_JITTER: z.number().default(100),
    API_RETRY_JITTER_MAX: z.number().default(5000),
    API_RETRY_JITTER_MIN: z.number().default(100),
})

export type Config = z.infer<typeof configSchema>

export function validateConfig(config: Record<string, unknown>): Config {
    return configSchema.parse(config)
}
