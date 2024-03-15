require('dotenv').config()
require('./mongo')
const { ProfilingIntegration } = require('@sentry/profiling-node')
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
const Sentry = require('@sentry/node')
const { default: mongoose } = require('mongoose')
const usersRouter = require('./controllers/users')
const User = require('./models/User')
const loginRouter = require('./controllers/login')
const userExtractor = require('./middleware/userExtractor')

app.use(cors())
app.use(express.json())
app.use('/images', express.static('images'))

Sentry.init({
  dsn: 'https://dc8bcf852870db1173aa1746c944863e@o4506907120828416.ingest.us.sentry.io/4506907157004288',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration()
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0
})

// El controlador de solicitudes debe ser el primer middleware en la aplicación
app.use(Sentry.Handlers.requestHandler())

// TracingHandler crea un rastro para cada solicitud entrante
app.use(Sentry.Handlers.tracingHandler())

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})
// la siguiente funcion es para que se nos muestren todas las notas en la base de datos de mongo en JSON
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  res.json(notes)
})
// la siguiente funcion es para que se nos muestre una nota en particular en la base de datos de mongo en JSON
app.get('/api/notes/:id', (req, res, next) => {
  const { id } = req.params
  Note.findById(id).then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
  }).catch(err => next(err))
})
// La siguiente funcion es para actualizar una nota en la base de datos de mongo
app.put('/api/notes/:id', userExtractor, (req, res, next) => {
  const { id } = req.params
  const note = req.body

  const newNoteInfo = {
    content: note.content,
    important: note.important
  }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => {
      res.json(result)
    }).catch(err => next(err))
})
// La siguiente funcion es para borrar una nota en la base de datos de mongo
app.delete('/api/notes/:id', userExtractor, async (req, res, next) => {
  const { id } = req.params
  const results = await Note.findByIdAndDelete(id)
  if (results === null) return res.sendStatus(404)

  res.status(204).end()
})
// La siguiente funcion es para postear una nueva nota en la base de datos de mongo

app.post('/api/notes', userExtractor, async (request, response, next) => {
  const {
    content,
    important = false
  } = request.body

  // sacar el userId del request
  const { userId } = request
  const user = await User.findById(userId)

  if (!content) {
    return response.status(400).json({
      error: 'required "content" field is missing'
    })
  }

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id
  })

  // newNote.save().then(savedNote => {
  //   response.json(savedNote)
  // }).catch(err => next(err))

  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.json(savedNote)
  } catch (err) {
    next(err)
  }
})

// La siguiente funcion es para los usuarios
app.use('/api/users', usersRouter)
// La siguiente funcion es para inicio de sesion
app.use('/api/login', loginRouter)
// La siguiente funcion es para manejar errores 404
app.use(notFound)
// El manejador de errores debe registrarse antes que cualquier otro middleware de errores y después de todos los controladores
app.use(Sentry.Handlers.errorHandler())
// La siguiente funcion es para manejar errores 500
app.use(handleErrors)
// Se define el puerto en el que se va a correr el servidor en una variable de entorno para que sea mas facil de cambiar
// en caso de que sea necesario en el futuro y se le asigna el valor de la variable de entorno PORT
// en caso de que no exista la variable de entorno PORT se le asigna el valor 3001
const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})

process.on('uncaughtException', () => {
  mongoose.connection.disconnect()
})

module.exports = { app, server }
