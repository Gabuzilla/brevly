import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GenericError } from './errors/genericError'
import { LinkNotFoundError } from './errors/link-not-found'
import { ZodGenericError } from './errors/zod-error'

const getOriginalUrlInput = z.object({
  shortUrl: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{4,15}$/, 'Formato de URL encurtada inválido.'),
})

type GetOriginalUrlInput = z.input<typeof getOriginalUrlInput>
type GetOriginalUrlOutput = {
  originalUrl: string
}

export async function getOriginalUrl(
  input: GetOriginalUrlInput
): Promise<Either<Error, GetOriginalUrlOutput>> {
  try {
    const { shortUrl } = getOriginalUrlInput.parse(input)

    const [link] = await db
      .select({ originalUrl: schema.links.originalUrl, accessCount: schema.links.accessCount })
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))
      .limit(1)

    if (!link) {
      return makeLeft(new LinkNotFoundError(shortUrl))
    }

    await db
      .update(schema.links)
      .set({ accessCount: (link.accessCount ?? 0) + 1 })
      .where(eq(schema.links.shortUrl, shortUrl))

    return makeRight(link)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return makeLeft(new ZodGenericError(`${error.errors[0].message}`))
    }
    return makeLeft(new GenericError())
  }
}