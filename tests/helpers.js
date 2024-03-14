const { app } = require('../index')
const supertest = require('supertest')

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

module.exports = {
  initialNotes,
  api,
  getAllContentFromNotes
}
