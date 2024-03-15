const bcrypt = require('bcrypt')
const { api, getUsers } = require('./helpers')
const User = require('../models/User')
const mongoose = require('mongoose')
const { server } = require('../index')

describe('User', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash('password', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('works as excpeted creating a fresh username', async () => {
    const usersAtStart = await getUsers()

    const newUser = {
      username: 'newUser',
      name: 'New User',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await getUsers()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })
})

test('creation fails with proper statuscode and message if username already taken', async () => {
  const usersAtStart = await getUsers()

  const newUser = {
    username: 'root',
    name: 'Superuser',
    password: 'password'
  }

  const result = await api
    .post('/api/users')
    .send(newUser)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  expect(result.body.error).toContain('`username` to be unique')

  const usersAtEnd = await getUsers()
  expect(usersAtEnd).toHaveLength(usersAtStart.length)
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
