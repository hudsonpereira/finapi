const express = require('express');
const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(express.json());

const customers = [];

const verifyIfAccountExists = (request, response, next) => {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(404).json({
      error: 'Customer not found',
    });
  }

  request.customer = customer;

  return next();
};

const getBalance = (statements) => {
  return statements.reduce((acc, statement) => {
    if (statement.type === 'credit') return acc + statement.amount;

    return acc - statement.amount;
  }, 0);
};

/**
 * cpf - string
 * name - string
 * id - uuid
 * statements - []
 */
app.post('/account', (request, response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({
      error: 'Customer already exists!',
    });
  }

  customers.push({
    cpf,
    name,
    id: uuidV4(),
    statements: [],
  });

  return response.status(201).send();
});

app.put('/account', verifyIfAccountExists, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(200).send();
});

app.get('/account', verifyIfAccountExists, (request, response) => {
  return response.status(200).json({
    ...request.customer,
    balance: getBalance(request.customer.statements),
  });
});

app.delete('/account', verifyIfAccountExists, (request, response) => {
  const { customer } = request;

  customers.splice(customers.indexOf(customer), 1);

  return response.status(200).send();
});

app.get('/statement', verifyIfAccountExists, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date);

  const statements = date
    ? customer.statements.filter(
        (statement) =>
          statement.created_at.toDateString() ===
          new Date(dateFormat).toDateString()
      )
    : customer.statements;

  return response.json(statements);
});

app.post('/deposit', verifyIfAccountExists, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  const statement = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statements.push(statement);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfAccountExists, (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  const balance = getBalance(customer.statements);

  if (balance < amount) {
    return response.status(400).json({
      error: 'Insufficient funds',
    });
  }

  const statement = {
    description,
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  customer.statements.push(statement);

  return response.status(201).send();
});

app.listen(3333);
