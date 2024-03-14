const { model, Schema } = require('mongoose') // destructuring

// Definir el esquema de la base de datos
const noteSchema = new Schema({
  content: String,
  date: Date,
  important: Boolean,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
},
{
// Transformar el objeto a JSON
  toJSON: {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  }
})

const Note = model('Note', noteSchema)

module.exports = Note
