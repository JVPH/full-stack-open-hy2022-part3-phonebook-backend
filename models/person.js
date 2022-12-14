const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  // eslint-disable-next-line no-unused-vars
  .then(_result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    unique: true,
    required: [true, 'User name required'],
  },
  phone: {
    type: String,
    minLength: 8,
    validate: {
      validator: v => /\d{2,3}-\d{3,}/.test(v),
      message: props => `${props.value} is not a valid phone number!`

    },
    required: [true, 'User phone number required'],
  },
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)