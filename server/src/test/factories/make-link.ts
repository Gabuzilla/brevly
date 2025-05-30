import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { fakerPT_BR as faker } from '@faker-js/faker' 
export async function makeLink(
  overrides: Partial<typeof schema.links.$inferInsert> = {}
) {
  const linkData = {
    id: overrides.id ?? faker.string.uuid(),
    originalUrl: overrides.originalUrl ?? faker.internet.url(),
    shortUrl: overrides.shortUrl ?? faker.string.alphanumeric(8), 
    accessCount: overrides.accessCount ?? 0,
    createdAt: overrides.createdAt ?? new Date(),
    ...overrides,
  }

  const [insertedLink] = await db
    .insert(schema.links)
    .values(linkData)
    .returning()

  if (!insertedLink) {
    throw new Error('makeLink failed to insert and return link data.')
  }

  return insertedLink
}