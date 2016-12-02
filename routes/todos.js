const router = require('express').Router()
const Session = require('../models/session')
const User = require('../models/user')
const Todo = require('../models/todo')

// On récupère l'id de l'utilisateur connecté puis on recherche ses informations,
// une fois qu'on les a récupérées, on récupère les todos de cet utilisateur
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

// Sauvegarder d'un todo
router.post('/', (req, res, next) => {
    var token = Session.getToken(req)
    var task = req.body.task
    var taskAssignedTo = req.body.taskAssignedTo

console.log('--- POST todos ---')
    // Si le todo ou l'utilisateur à laquelle elle est assignée n'est pas renseignée,
    // on renvoie vers la page des todos avec un message d'erreur
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
        // Si les deux champs sont renseignés, on assigne le todo à l'utilisateur passé
        // en paramètre. Seul lui pourra voir le todo
        User.getUserByPseudo(taskAssignedTo).then((user) => {
            Todo.create(user.rowid, user.pseudo, task, taskAssignedTo).then(() => {
                res.redirect('/todos')
            })
        })
})

// Suppression d'un todo puis redirection vers la page todo de l'utilisateur connecté
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
