import { beforeAll, afterAll, it, describe, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const response = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    expect(response.body).toEqual({
      transactions: [
        expect.objectContaining({
          title: 'New transaction',
          amount: 5000,
        }),
      ],
    })
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const response = await supertest(app.server)
      .get('/transactions')
      .set('Cookie', cookies)

    const transactionId = response.body.transactions[0].id

    const getTransactionResponse = await supertest(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        id: transactionId,
        title: 'New transaction',
        amount: 5000,
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const createTransactionResponseCredit = await supertest(app.server)
      .post('/transactions')
      .send({
        title: 'New Credit transaction',
        amount: 5000,
        type: 'credit',
      })
    const cookies = createTransactionResponseCredit.get('Set-Cookie')

    await supertest(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'New Debit transaction',
        amount: 2000,
        type: 'debit',
      })

    const getTransactionSummary = await supertest(app.server)
      .get(`/transactions/summary`)
      .set('Cookie', cookies)

    expect(getTransactionSummary.body.summary).toEqual({
      amount: 3000,
    })
  })
})
