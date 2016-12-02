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
  assignedUser: String,
  done: Boolean
})

var todoModel = mongoose.model('todo', todoSchema)

module.exports = {
  create: (userId, userPseudo, task, assignedUser) => {
    var todo = new todoModel({
      todoId: require('uuid').v4(),
      userId: userId,
      pseudo: userPseudo,
      createdAt: Date.now(),
      task: task,
      assignedUser: assignedUser,
    })
    return todo.save()
  },

  findByUserId: (userId) => {
    return todoModel.find({userId: userId}).exec()
  },

  delete: (todoId) => {
    return todoModel.remove({todoId: todoId})
  }
}
