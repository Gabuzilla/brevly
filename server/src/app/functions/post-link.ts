import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GenericError } from './errors/genericError'
import { RepeatedShortLinkError } from './errors/repeated-short-link'
import { ZodGenericError } from './errors/zod-error'

const createLinkInput = z.object({
  originalUrl: z.string().url('The original URL must be a valid URL.'),
  shortUrl: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]{4,15}$/,
      'The short URL must be between 4 and 10 characters, containing only letters, numbers, hyphens, or underscores.'
    ),
})

type CreateLinkInput = z.input<typeof createLinkInput>

type CreateLinkOutput = {
  shortUrl: string
}

export async function createLink(
  input: CreateLinkInput
): Promise<Either<Error, CreateLinkOutput>> {
  try {
    const { originalUrl, shortUrl } = createLinkInput.parse(input)

    const existingLink = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))
      .limit(1)

    if (existingLink.length > 0) {
      return makeLeft(new RepeatedShortLinkError(shortUrl))
    }

    const [newLink] = await db
      .insert(schema.links)
      .values({ originalUrl, shortUrl })
      .returning()

    return makeRight(newLink)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return makeLeft(new ZodGenericError(`${error.errors[0].message}`))
    }
    return makeLeft(new GenericError())
  }
}
