import { z } from "zod";

export const MockRuleSchema = z.object({
  id: z.string().default(crypto.randomUUID()).optional(),
  enabled: z.boolean().default(true).optional(),
  triggerError: z.boolean().default(false).optional(),

  match: z.object({
    method: z.string(),
    path: z.string(),

    query: z.record(z.string(), z.any()).optional(),
    body: z.any().optional(),
  }),

  error: z
    .object({
      status: z.number(),
      body: z.any().optional(),
    })
    .optional(),

  response: z.object({
    status: z.number(),
    delay: z.number().optional(),
    body: z.any(),
  }),
});

export type MockRule = z.infer<typeof MockRuleSchema>;
