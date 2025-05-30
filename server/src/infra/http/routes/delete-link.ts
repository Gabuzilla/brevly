import { deleteLink } from '@/app/functions/delete-link'
import { isLeft, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { LinkNotFoundError } from '@/app/functions/errors/link-not-found'
import { ZodGenericError } from '@/app/functions/errors/zod-error'

export const deleteLinkRoute: FastifyPluginAsyncZod = async server => {
  server.delete(
    '/:shortUrl',
    {
      schema: {
        summary: 'Deleta um link',
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
          204: z.null().describe('Link deletado com sucesso'),
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

      const result = await deleteLink({ shortUrl })

      if (isLeft(result)) {
        const error = unwrapEither(result)

        if (error instanceof ZodGenericError) {
          return reply.status(400).send({ message: error.message })
        }

        if (error instanceof LinkNotFoundError) {
          return reply.status(404).send({ message: error.message })
        }

        return reply
          .status(500)
          .send({ message: 'Erro interno do servidor ao deletar o link.' })
      }

      return reply.status(204).send() 
    }
  )
}