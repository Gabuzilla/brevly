import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/infra/shared/either'
import { makeLink } from '@/test/factories/make-link'
import { beforeEach, describe, expect, it } from 'vitest'
import { getAllLinks } from './get-all-links'

describe('getAllLinks', () => {
  beforeEach(async () => {
    await db.delete(schema.links)
  })

  it('should be able to retrieve all existing links', async () => {
    const link1 = await makeLink()
    const link2 = await makeLink()
    const link3 = await makeLink()

    const sut = await getAllLinks()

    expect(isRight(sut)).toBe(true)

    const result = unwrapEither(sut)

    if (result instanceof Error) {
      throw result
    }

    expect(result).toHaveLength(3)

    const originalUrls = result.map(link => link.originalUrl)
    expect(originalUrls).toContain(link1.originalUrl)
    expect(originalUrls).toContain(link2.originalUrl)
    expect(originalUrls).toContain(link3.originalUrl)

    const shortUrls = result.map(link => link.shortUrl)
    expect(shortUrls).toContain(link1.shortUrl)
    expect(shortUrls).toContain(link2.shortUrl)
    expect(shortUrls).toContain(link3.shortUrl)
  })

  it('should return an empty array if no links exist', async () => {
    const sut = await getAllLinks()

    expect(isRight(sut)).toBe(true)

    const result = unwrapEither(sut)

    if (result instanceof Error) {
      throw result
    }

    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })

})
