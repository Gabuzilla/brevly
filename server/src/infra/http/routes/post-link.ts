import { RepeatedShortLinkError } from '@/app/functions/errors/repeated-short-link'
import { ZodGenericError } from '@/app/functions/errors/zod-error'
import { createLink } from '@/app/functions/post-link'
import { isLeft, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const postLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/',
    {
      schema: {
        summary: 'Encurta uma URL',
        tags: ['Links'],
        body: z.object({
          originalUrl: z
            .string()
            .url('A URL original deve ser uma URL válida.'),
          shortUrl: z
            .string()
            .regex(
              /^[a-zA-Z0-9_-]{4,15}$/,
              'A URL encurtada deve ter entre 4 e 15 caracteres, contendo apenas letras, números, hífens ou underlines.'
            ),
        }),
        response: {
          201: z
            .object({
              shortUrl: z.string(),
            })
            .describe('Link encurtado com sucesso'),
          400: z
            .object({ message: z.string() })
            .describe('Requisição inválida'),
          409: z
            .object({ message: z.string() })
            .describe('URL encurtada já existe'),
          500: z
            .object({ message: z.string() })
            .describe('Erro interno do servidor'),
        },
      },
    },
    async (request, reply) => {
      const { originalUrl, shortUrl } = request.body

      const result = await createLink({ originalUrl, shortUrl })

      if (isLeft(result)) {
        const error = unwrapEither(result)

        if (error instanceof ZodGenericError) {
          return reply.status(400).send({ message: error.message })
        }

        if (error instanceof RepeatedShortLinkError) {
          return reply.status(409).send({ message: error.message })
        }

        return reply
          .status(500)
          .send({ message: 'Erro interno do servidor ao criar o link.' })
      }

      const newLink = unwrapEither(result)
      return reply.status(201).send({ shortUrl: newLink.shortUrl })
    }
  )
}
