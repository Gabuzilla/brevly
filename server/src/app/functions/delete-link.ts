import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { GenericError } from './errors/genericError'
import { ZodGenericError } from './errors/zod-error'
import { LinkNotFoundError } from './errors/link-not-found'

const deleteLinkInput = z.object({
  shortUrl: z.string().regex(/^[a-zA-Z0-9_-]{4,15}$/, 'Formato de URL encurtada inválido.'),
})

type DeleteLinkInput = z.input<typeof deleteLinkInput>
type DeleteLinkOutput = {
  success: boolean
}

export async function deleteLink(
  input: DeleteLinkInput
): Promise<Either<Error, DeleteLinkOutput>> {
  try {
    const { shortUrl } = deleteLinkInput.parse(input)

    const [deletedLink] = await db
      .delete(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))
      .returning()

    if (!deletedLink) {
      return makeLeft(new LinkNotFoundError(shortUrl))
    }

    return makeRight({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return makeLeft(new ZodGenericError(`${error.errors[0].message}`))
    }
    return makeLeft(new GenericError())
  }
}

