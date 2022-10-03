const express = require('express')
const { v4: uuidV4 } = require('uuid')

const app = express()

app.use(express.json())

const customers = []

/**
 * cpf - string
 * name - string
 * id - uuid
 * statements - []
 */
app.post('/account', (request, response) => {
    const { cpf, name } = request.body
    const id = uuidV4()

    customers.push({
        cpf,
        name,
        id,
        statements: []
    })

    return response.status(201).send()
})

app.listen(3333)