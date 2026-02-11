import { z } from "zod";

export const MockRuleSchema = z.object({
  id: z.string(),
  enabled: z.boolean().default(true),

  match: z.object({
    method: z.string(),
    path: z.string(),

    query: z.record(z.string(), z.string()).optional(),
    body: z.any().optional(),
  }),

  response: z.object({
    status: z.number(),
    delay: z.number().optional(),
    body: z.any(),

    error: z.object({
      when: z.string(),
      status: z.number(),
      body: z.any(),
    }).optional()
  })
});

export type MockRule = z.infer<typeof MockRuleSchema>;
