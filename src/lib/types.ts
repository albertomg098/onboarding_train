import { z } from "zod";

export const VocabularyItemSchema = z.object({
  term: z.string(),
  definition: z.string(),
  example: z.string(),
});

export const LifecycleStepSchema = z.object({
  step: z.number(),
  name: z.string(),
  description: z.string(),
});

export const AIUseCaseSchema = z.object({
  area: z.string(),
  description: z.string(),
  impact: z.string(),
});

export const DomainTheoryDataSchema = z.object({
  domainName: z.string(),
  overview: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()).min(1).max(3),
  }),
  vocabulary: z.array(VocabularyItemSchema).min(8).max(15),
  lifecycle: z.array(LifecycleStepSchema).min(5).max(12),
  aiUseCases: z.array(AIUseCaseSchema).min(3).max(6),
  sources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
      })
    )
    .optional()
    .default([]),
});

export type DomainTheoryData = z.infer<typeof DomainTheoryDataSchema>;
