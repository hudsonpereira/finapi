const express = require('express')
const { v4: uuidV4 } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

const verifyIfAccountExists = (request, response, next) => {
    const { cpf } = request.headers
    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer) {
        return response.status(404).json({
            error: 'Customer not found'
        })
    }

    request.customer = customer

    return next()
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statements - []
 */
app.post('/account', (request, response) => {
    const { cpf, name } = request.body

    const customerAlreadyExists = customers.some(customer => customer.cpf === cpf)

    if (customerAlreadyExists) {
        return response.status(400).json({
            error: "Customer already exists!"
        })
    }

    customers.push({
        cpf,
        name,
        id: uuidV4(),
        statements: []
    })

    return response.status(201).send()
})

app.get('/statement', verifyIfAccountExists, (request, response) => {
    const { customer } = request

    return response.json(customer.statements)
})

app.post('/deposit', verifyIfAccountExists, (request, response) => {
    const { customer } = request
    const { description, amount } = request.body

    const statement = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    }

    customer.statements.push(statement)

    return response.status(201).send()
})

app.listen(3333)