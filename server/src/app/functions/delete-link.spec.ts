import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeLink } from '@/test/factories/make-link'
import { deleteLink } from './delete-link'
import { LinkNotFoundError } from './errors/link-not-found'

describe('deleteLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should delete an existing short link', async () => {
    const existingLink = await makeLink() 

    const result = await deleteLink({ shortUrl: existingLink.shortUrl })

    expect(isRight(result)).toBe(true)
    expect(unwrapEither(result)).toEqual({ success: true })

    const deletedLink = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, existingLink.shortUrl))

    expect(deletedLink).toHaveLength(0)
  })

  it('should return an error if the short link does not exist', async () => {
    const nonExistentShortUrl = 'nonexistent'

    const result = await deleteLink({ shortUrl: nonExistentShortUrl })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should return an error for invalid short URL format', async () => {
    const result = await deleteLink({ shortUrl: 'abc' })

    expect(isLeft(result)).toBe(true)
    expect(unwrapEither(result)).toBeInstanceOf(ZodGenericError)
  })
})
