import { FastifyReply, FastifyRequest } from 'fastify'

export const checkSessionIdExists = async (
  request: FastifyRequest,
  response: FastifyReply,
) => {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    return response.code(401).send({
      error: 'Unauthorized',
    })
  }
}
