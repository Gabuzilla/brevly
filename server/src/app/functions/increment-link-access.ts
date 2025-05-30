import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GenericError } from './errors/genericError'
import { LinkNotFoundError } from './errors/link-not-found'
import { ZodGenericError } from './errors/zod-error'

const incrementLinkAccessInput = z.object({
  shortUrl: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{4,15}$/, 'Formato de URL encurtada inválido.'),
})

type IncrementLinkAccessInput = z.input<typeof incrementLinkAccessInput>

type IncrementLinkAccessOutput = {
  shortUrl: string
  newAccessCount: number
}

export async function incrementLinkAccess(
  input: IncrementLinkAccessInput
): Promise<Either<Error, IncrementLinkAccessOutput>> {
  try {
    const { shortUrl } = incrementLinkAccessInput.parse(input)

    const [link] = await db
      .select({ accessCount: schema.links.accessCount })
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))
      .limit(1)

    if (!link) {
      return makeLeft(new LinkNotFoundError(shortUrl))
    }

    const newAccessCount = (link.accessCount ?? 0) + 1

    await db
      .update(schema.links)
      .set({ accessCount: newAccessCount })
      .where(eq(schema.links.shortUrl, shortUrl))

    return makeRight({ shortUrl, newAccessCount })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return makeLeft(new ZodGenericError(`${error.errors[0].message}`))
    }
    return makeLeft(new GenericError())
  }
}
