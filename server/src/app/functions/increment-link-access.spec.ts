import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { beforeEach, describe, expect, it } from 'vitest'
import { LinkNotFoundError } from './errors/link-not-found'
import { incrementLinkAccess } from './increment-link-access'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'

describe('incrementLinkAccess', () => {
    beforeEach(async () => {
      await db.delete(schema.links)
    })
  it('should increment the access count of an existing short URL', async () => {
    const existingLink = await makeLink()

    const sut = await incrementLinkAccess({ shortUrl: existingLink.shortUrl })

    expect(isRight(sut)).toBe(true)

    const result = unwrapEither(sut)

    if (result instanceof Error) {
      throw result
    }

    expect(result.shortUrl).toEqual(existingLink.shortUrl)
    expect(result.newAccessCount).toBe((existingLink.accessCount ?? 0) + 1)
  })

  it('should return an error if the short URL does not exist', async () => {
    const sut = await incrementLinkAccess({ shortUrl: 'nonexistent-url' })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(LinkNotFoundError)
  })

  it('should return an error for invalid short URL format', async () => {
    const sut = await incrementLinkAccess({ shortUrl: 'inv' })
    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ZodGenericError)
  })
})