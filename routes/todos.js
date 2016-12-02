const router = require('express').Router()
const Session = require('../models/session')
const User = require('../models/user')
const Todo = require('../models/todo')

router.get('/', (req, res, next) => {
  console.log('--- GET todos ---')
    var token = Session.getToken(req);
    User.getUserIdFromToken(token).then((userId) => {
        Todo.findByUserId(userId).then((listTodos) => {
            res.format({
                html: () => {
                    res.render('todos/todos', {
                        listTodos: listTodos
                    })
                },
                json: () => {
                    res.send({
                        todos: listTodos
                    })
                }
            })
        })
    })
})

router.post('/', (req, res, next) => {
    var token = Session.getToken(req)
    var task = req.body.task
    var taskAssignedTo = req.body.taskAssignedTo

console.log('--- POST todos ---')
    if (!task || !taskAssignedTo) {
        res.format({
            html: () => {
                res.redirect('/todos')
            },
            json: () => {
                res.status(400)
                res.send()
            }
        })
    }

        User.getUserByPseudo(taskAssignedTo).then((user) => {
            Todo.create(user.rowid, user.pseudo, task, taskAssignedTo).then(() => {
                res.redirect('/todos')
            })
        })
})

router.delete('/:todo', (req, res, next) => {
  console.log("Todo deleted")
  Todo.delete(req.params.todo).then( () => {
    console.log('Delete ok')
    res.format({
      html: () => {
        res.redirect('/todos');
      },
      json: () => {
        res.send({message: "Todo deleted"});
      }
    })
  })
})

module.exports = router
