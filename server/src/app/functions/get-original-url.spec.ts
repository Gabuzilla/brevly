import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { beforeEach, describe, expect, it } from 'vitest'
import { LinkNotFoundError } from './errors/link-not-found'
import { getOriginalUrl } from './get-original-url'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'

describe('getOriginalUrl', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })
  it('should be able to retrieve the original URL from a short URL', async () => {
    const existingLink = await makeLink()

    const sut = await getOriginalUrl({ shortUrl: existingLink.shortUrl })

    expect(isRight(sut)).toBe(true)

    const result = unwrapEither(sut)

    if (result instanceof Error) {
      throw result
    }

    expect(result.originalUrl).toEqual(existingLink.originalUrl)
  })

  it('should return an error if the short URL does not exist', async () => {
    const sut = await getOriginalUrl({ shortUrl: 'nonexistent-url' })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should return an error for invalid short URL format', async () => {
    const sut = await getOriginalUrl({ shortUrl: 'inv' })
    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ZodGenericError)
  })
})
