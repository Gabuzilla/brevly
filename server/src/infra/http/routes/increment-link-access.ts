import { incrementLinkAccess } from '@/app/functions/increment-link-access' 
import { GenericError } from '@/app/functions/errors/genericError'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found'
import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { isLeft, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

const shortUrlParamSchema = z.object({
  shortUrl: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]{4,15}$/,
      'A URL encurtada no caminho deve ter entre 4 e 15 caracteres, contendo apenas letras, números, hífens ou underlines.'
    ),
})

const incrementLinkAccessResponseSchema = z.object({
  shortUrl: z.string(),
  newAccessCount: z.number(),
})

export const incrementLinkAccessRoute: FastifyPluginAsyncZod = async server => {
  server.patch(
    '/:shortUrl/access', 
    {
      schema: {
        summary: 'Incrementa a contagem de acesso de um link',
        tags: ['Links'],
        params: shortUrlParamSchema,
        response: {
          200: incrementLinkAccessResponseSchema.describe(
            'Contagem de acesso incrementada com sucesso'
          ),
          400: z
            .object({ message: z.string() })
            .describe('Requisição inválida (ex: formato inválido da shortUrl)'),
          404: z
            .object({ message: z.string() })
            .describe('Link não encontrado'),
          500: z
            .object({ message: z.string() })
            .describe('Erro interno do servidor'),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await incrementLinkAccess({ shortUrl })

      if (isLeft(result)) {
        const error = unwrapEither(result)
        server.log.error(error, `Error in incrementLinkAccess for ${shortUrl}`)

        if (error instanceof ZodGenericError) {
          return reply.status(400).send({ message: error.message })
        }

        if (error instanceof LinkNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }

        if (error instanceof GenericError) {
          return reply.status(500).send({
            message:
              error.message ||
              'Erro interno do servidor ao incrementar o acesso ao link.',
          })
        }

        return reply.status(500).send({
          message: 'Erro interno desconhecido ao incrementar o acesso ao link.',
        })
      }

      const data = unwrapEither(result)
      return reply.status(200).send(data)
    }
  )
}