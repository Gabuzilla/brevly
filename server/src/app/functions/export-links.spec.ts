
import {  isRight, unwrapEither } from '@/infra/shared/either'
import { fakerPT_BR as faker } from '@faker-js/faker'
import { beforeEach, describe, expect, it } from 'vitest'

import { exportLinks } from './export-links'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'

describe('exportLinks', () => {
      beforeEach(async () => {
        await db.delete(schema.links)
      })
    it('should be able to export links to a CSV file', async () => {
        const searchQuery = faker.internet.url()

        const sut = await exportLinks({ searchQuery })

        expect(isRight(sut)).toBe(true)

        const { reportUrl } = unwrapEither(sut)

        expect(reportUrl).toContain('https://pub-dc2225781c004efb9c7453ce72f8f1da.r2.dev/downloads/')
    })

    it('should return an empty CSV file if no links match the search query', async () => {
        const searchQuery = 'nonexistent-url'

        const sut = await exportLinks({ searchQuery })

        expect(isRight(sut)).toBe(true)

        const { reportUrl } = unwrapEither(sut)

        expect(reportUrl).toContain('https://pub-dc2225781c004efb9c7453ce72f8f1da.r2.dev/downloads/')
    })
})

