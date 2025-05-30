import { RepeatedShortLinkError } from '@/app/functions/errors/repeated-short-link'
import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isLeft, isRight, unwrapEither } from '@/infra/shared/either'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { eq } from 'drizzle-orm'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeLink } from '@/test/factories/make-link'

import { createLink } from './post-link'

describe('createLink', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })
  it('should be able to create a new short link', async () => {
    const originalUrl = faker.internet.url()
    const shortUrl = faker.string.alphanumeric(8)

    const sut = await createLink({ originalUrl, shortUrl })

    expect(isRight(sut)).toBe(true)

    const result = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))

    expect(result).toHaveLength(1)
    expect(result[0].originalUrl).toEqual(originalUrl)
    expect(result[0].shortUrl).toEqual(shortUrl)
  })

  it('should not be able to create a link with a repeated short URL', async () => {
    const existingLink = await makeLink() 

    const sut = await createLink({
      originalUrl: faker.internet.url(),
      shortUrl: existingLink.shortUrl,
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(RepeatedShortLinkError)
    expect((unwrapEither(sut) as RepeatedShortLinkError).message).toEqual(
      `Short URL "${existingLink.shortUrl}" is already in use.`
    )
  })

  it('should not be able to create a link with an invalid original URL', async () => {
    const sut = await createLink({
      originalUrl: 'invalid-url',
      shortUrl: faker.string.alphanumeric(8),
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ZodGenericError)
    expect((unwrapEither(sut) as ZodGenericError).message).toEqual(
      'Validation Error: The original URL must be a valid URL.'
    )
  })

  it('should not be able to create a link with an invalid short URL format', async () => {
    const sut = await createLink({
      originalUrl: faker.internet.url(),
      shortUrl: 'abc',
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ZodGenericError)
    expect((unwrapEither(sut) as ZodGenericError).message).toEqual(
      'Validation Error: The short URL must be between 4 and 10 characters, containing only letters, numbers, hyphens, or underscores.'
    )
  })

  it('should not be able to create a link with a short URL that is too long', async () => {
    const sut = await createLink({
      originalUrl: faker.internet.url(),
      shortUrl: faker.string.alphanumeric(16), 
    })

    expect(isLeft(sut)).toBe(true)
    expect(unwrapEither(sut)).toBeInstanceOf(ZodGenericError)
    expect((unwrapEither(sut) as ZodGenericError).message).toEqual(
      'Validation Error: The short URL must be between 4 and 10 characters, containing only letters, numbers, hyphens, or underscores.'
    )
  })
})