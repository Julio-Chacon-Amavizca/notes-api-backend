const mongoose = require('mongoose')

// variables de entorno
const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

const connectionStr = NODE_ENV === 'test'
  ? MONGO_DB_URI_TEST
  : MONGO_DB_URI

// Conexión a la base de datos

mongoose.connect(connectionStr)
  .then(() => {
    console.log('Connected to MongoDB')
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err.message)
  })
