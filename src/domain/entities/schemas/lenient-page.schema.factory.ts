import { TypeOf, z } from 'zod';
import { Page } from '@/domain/entities/page.entity';

/**
 * Builds a lenient page schema that filters out invalid items from the results array.
 */
export function buildLenientPageSchema<T extends z.ZodTypeAny>(
  itemSchema: T,
): z.ZodType<Page<z.infer<T>>> {
  return z.object({
    count: z.number().nullable(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(z.any()).transform((items) =>
      items.flatMap((item) => {
        const result = itemSchema.safeParse(item);
        return result.success ? [result.data as TypeOf<T>] : [];
      }),
    ),
  });
}