import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string(),
  SUPABASE_SECRET_KEY: z.string(),
  IA_SERVICE_URL: z.string().url().default('http://localhost:8000'),
})

export const env = schema.parse(process.env)
