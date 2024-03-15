const { app } = require('../index')
const supertest = require('supertest')
const User = require('../models/User')

const api = supertest(app)

const initialNotes = [
  {
    content: 'lorem ipsum dolor sit amet',
    important: true,
    date: new Date()
  },
  {
    content: 'lorem ipsum dolor sit amet 2',
    important: true,
    date: new Date()
  },
  {
    content: 'lorem ipsum dolor sit amet 3',
    important: true,
    date: new Date()
  }
]

const getAllContentFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    contents: response.body.map(r => r.content),
    response
  }
}

const getUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

module.exports = {
  initialNotes,
  api,
  getAllContentFromNotes,
  getUsers
}
