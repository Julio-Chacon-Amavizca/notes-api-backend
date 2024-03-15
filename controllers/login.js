const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async (request, response) => {
  const { body } = request
  const { username, password } = body

  const user = await User.findOne({ username })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(passwordCorrect && user)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    id: user._id,
    username: user.username
  }

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60 * 60 * 24 } // 1 hora en segundos (60 segundos * 60 minutos) es el tiempo de expiracion del token
    // Se deja en 24 horas para que no expire tan rapido entorno a pruebas
  )

  response.send({
    username: user.username,
    name: user.name,
    token
  })
})

module.exports = loginRouter
