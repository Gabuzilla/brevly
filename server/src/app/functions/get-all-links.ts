import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { z } from 'zod'
import { GenericError } from './errors/genericError'
import { ZodGenericError } from './errors/zod-error'

const getAllLinksOutput = z.array(
  z.object({
    id: z.string(),
    originalUrl: z.string(),
    shortUrl: z.string(),
    accessCount: z.number().nullable(),
    createdAt: z.date(),
  })
)

type GetAllLinksOutput = z.infer<typeof getAllLinksOutput>

export async function getAllLinks(): Promise<Either<Error, GetAllLinksOutput>> {
  try {
    const allLinks = await db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.shortUrl,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)

    const parsedLinks = getAllLinksOutput.parse(allLinks)

    return makeRight(parsedLinks)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return makeLeft(new ZodGenericError(`${error.errors[0].message}`))
    }

    return makeLeft(new GenericError())
  }
}
