require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

// eslint-disable-next-line no-unused-vars
morgan.token('data', (req, _res) => {
  if(Object.keys(req.body).length === 0){
    return '-'
  }
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))


app.get('/', (_request, response) => {
  response.send('<h1>Phonebook Backend</h1>')
})

app.get('/api/persons', (_request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if(person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))

})

app.get('/info', async (_request, response) => {
  const count = await Person.estimatedDocumentCount()
  response.write(`<p>Phonebook has info for ${count} people</p>`)
  response.write(`<p>${new Date()}</p>`)
  response.end()
})

app.delete('/api/persons/:id', (request, response, next) => {
  // eslint-disable-next-line no-unused-vars
  Person.findByIdAndDelete(request.params.id).then(_result => {
    response.status(204).end()
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {

  const body = request.body

  const person = {
    phone: body.phone,
  }

  Person.findByIdAndUpdate(
    request.params.id,
    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (body.name === undefined || body.phone === undefined) {
    return response.status(400).json({ error: 'name and/or phone missing' })
  }

  const person = new Person({
    name: body.name,
    phone: body.phone,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))
})



const unknownEndpoint = (_request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, _request, response, next) => {
  console.error(error.message)
  console.log('error name: ', error.name)
  console.log('error code: ', error.code)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  } else if (error.code === 11000) {
    return response.status(409).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT =  process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})