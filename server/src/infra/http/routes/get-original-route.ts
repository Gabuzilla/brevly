import { LinkNotFoundError } from '@/app/functions/errors/link-not-found'
import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { getOriginalUrl } from '@/app/functions/get-original-url'
import { isLeft, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const getOriginalUrlRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/:shortUrl',
    {
      schema: {
        summary: 'Obtém a URL original por uma URL encurtada e redireciona',
        tags: ['Links'],
        params: z.object({
          shortUrl: z
            .string()
            .regex(
              /^[a-zA-Z0-9_-]{4,15}$/,
              'A URL encurtada deve ter entre 4 e 15 caracteres, contendo apenas letras, números, hífens ou underlines.'
            ),
        }),
        response: {
          302: z.null().describe('Redirecionamento para a URL original'),
          400: z
            .object({ message: z.string() })
            .describe('Requisição inválida'),
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

      const getResult = await getOriginalUrl({ shortUrl })

      if (isLeft(getResult)) {
        const error = unwrapEither(getResult)

        if (error instanceof ZodGenericError) {
          return reply.status(400).send({ message: error.message })
        }

        if (error instanceof LinkNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }

        return reply
          .status(500)
          .send({ message: 'Erro interno do servidor ao buscar o link.' })
      }

      const { originalUrl } = unwrapEither(getResult)

      return reply.status(200).send({ message: originalUrl }) 
    }
  )
}
