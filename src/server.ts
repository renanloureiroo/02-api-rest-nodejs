import fastify from 'fastify'
import { knex } from './database'
import { env } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(transactionsRoutes, {
  prefix: '/transactions',
  logLevel: 'debug',
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => console.log('HTTP server running on port 3333'))
