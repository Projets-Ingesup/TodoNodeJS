const mongoose = require('mongoose')

var todoSchema = new mongoose.Schema({
  todoId: String,
  userId: Number,
  userPseudo: String,
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date,
  task: String,
  teamId: Number,
  assignedBy: String,
  assignedUser: String,
  done: Boolean,
  completedAt: Date
})

var todoModel = mongoose.model('todo', todoSchema)

module.exports = {
  create: (userId, userPseudo, task, assignedBy, assignedUser) => {
    var todo = new todoModel({
      todoId: require('uuid').v4(),
      userId: userId,
      pseudo: userPseudo,
      createdAt: Date.now(),
      task: task,
      assignedBy: assignedBy,
      assignedUser: assignedUser,
      done: false,
      completedAt: null
    })
    return todo.save()
  },

  findByUserId: (userId) => {
    return todoModel.find({userId: userId}).exec()
  },

  findNotCompletedTodosByUserId: (userId) => {
    return todoModel.find({userId: userId, done: false}).exec()
  },

  findCompletedTodosByUserId: (userId) => {
    return todoModel.find({userId: userId, done: true}).exec()
  },

  completeTodo: (todoId) => {
    return todoModel.update({todoId: todoId}, {$set: {done: true, completedAt: Date.now() }}, {upsert: true})
  },

  delete: (todoId) => {
    return todoModel.remove({todoId: todoId})
  }
}
