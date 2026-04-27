import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  API_URL: z.string().url(),
  PORT: z.string().transform(Number),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(env: Record<string, unknown>): Env {
  return envSchema.parse(env)
}
