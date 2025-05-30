import { getAllLinks } from '@/app/functions/get-all-links'
import { GenericError } from '@/app/functions/errors/genericError'
import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { isLeft, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const getAllLinksResponseSchema = z.array(
  z.object({
    id: z.string(),
    originalUrl: z.string(),
    shortUrl: z.string(),
    accessCount: z.number().nullable(),
    createdAt: z.date(), 
  })
)

export const getAllLinksRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/',
    {
      schema: {
        summary: 'Obtém todos os links encurtados',
        tags: ['Links'],
        response: {
          200: getAllLinksResponseSchema.describe(
            'Lista de links obtida com sucesso'
          ),
          500: z
            .object({ message: z.string() })
            .describe('Erro interno do servidor'),
        },
      },
    },
    async (request, reply) => {
      const result = await getAllLinks()

      if (isLeft(result)) {
        const error = unwrapEither(result)
        server.log.error(error, 'Error in getAllLinks function')

        if (error instanceof ZodGenericError) {
          return reply.status(500).send({
            message:
              error.message ||
              'Erro interno do servidor ao processar os dados dos links.',
          })
        }

        if (error instanceof GenericError) {
          return reply.status(500).send({
            message:
              error.message || 'Erro interno do servidor ao buscar os links.',
          })
        }

        return reply.status(500).send({
          message: 'Erro interno desconhecido ao buscar os links.',
        })
      }

      const links = unwrapEither(result)
      return reply.status(200).send(links)
    }
  )
}