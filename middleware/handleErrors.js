module.exports = (err, req, res, next) => {
  console.error(err)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else {
    return res.status(500).send({ error: 'Internal Server Error' })
  }
}
