import { Readable, PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { db } from '@/infra/db';
import { schema } from '@/infra/db/schemas';
import { type Either, makeRight } from '@/infra/shared/either';
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage';
import { stringify } from 'csv-stringify';
import { ilike } from 'drizzle-orm';
import { z } from 'zod';

const exportLinksInput = z.object({
  searchQuery: z.string().optional(),
});

type ExportLinksInput = z.input<typeof exportLinksInput>;

type ExportLinksOutput = {
  reportUrl: string;
};

export async function exportLinks(
  input: ExportLinksInput
): Promise<Either<never, ExportLinksOutput>> {
  const { searchQuery } = exportLinksInput.parse(input);

  const linksData = await db
    .select({
      original_url: schema.links.originalUrl,
      short_url: schema.links.shortUrl,
      access_count: schema.links.accessCount,
      created_at: schema.links.createdAt,
    })
    .from(schema.links)
    .where(
      searchQuery ? ilike(schema.links.shortUrl, `%${searchQuery}%`) : undefined
    );
  
  const dataStream = Readable.from(linksData);

  const csvStream = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'original_url', header: 'Original URL' },
      { key: 'short_url', header: 'Short URL' },
      { key: 'access_count', header: 'Access Count' },
      { key: 'created_at', header: 'Created At' },
    ],
  });

  const uploadToStoragePassThrough = new PassThrough();
  const uploadPromise = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `${new Date().toISOString()}-links.csv`,
    contentStream: uploadToStoragePassThrough,
  });

  await pipeline(dataStream, csvStream, uploadToStoragePassThrough);

  const { url } = await uploadPromise;

  return makeRight({ reportUrl: url });
}