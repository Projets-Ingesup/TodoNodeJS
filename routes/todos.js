const router = require('express').Router()
const Session = require('../models/session')
const User = require('../models/user')
const Todo = require('../models/todo')

// On récupère l'id de l'utilisateur connecté puis on recherche ses informations,
// une fois qu'on les a récupérées, on récupère les todos de cet utilisateur
router.get('/', (req, res, next) => {
    var token = Session.getToken(req);
    User.getUserIdFromToken(token).then((userId) => {
        Todo.findNotCompletedTodosByUserId(userId).then( (listTodosNotCompleted) => {
          Todo.findCompletedTodosByUserId(userId).then( (listTodosCompleted) => {
            console.log('Todo not yet completed')
            console.log(listTodosNotCompleted)

            console.log('Todo completed')
            console.log(listTodosCompleted)
            res.format({
                html: () => {
                    res.render('todos/todos', {
                        listTodosNotCompleted: listTodosNotCompleted,
                        listTodosCompleted: listTodosCompleted
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
})

// Sauvegarde d'un todo dans la base
router.post('/', (req, res, next) => {
    var token = Session.getToken(req)
    var task = req.body.task
    var taskAssignedTo = req.body.taskAssignedTo

    User.getUserIdFromToken(token).then( (currentUserId) => {
      User.getUserById(currentUserId).then( (currentUser) => {
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
            if(user == "" || !user ) {
              res.format({
                html: () => {
                  res.redirect('/todos')
                },
                json: () => {
                  res.send({message: "Erreur,l'utilisateur renseigné n'existe pas." })
                }
              })
            }
            Todo.create(user.rowid, user.pseudo, task, currentUser.pseudo, taskAssignedTo).then(() => {
                res.redirect('/todos')
            })
        })
      })
    })

})

// Modifie un todo existant pour le valider
router.put('/:todo', (req, res, next) => {
  Todo.completeTodo(req.params.todo).then( () => {
    res.format({
      html: () => {
        res.redirect('/todos');
      },
      json: () => {
        res.send({message: "Todo completed"});
      }
    })
  })
})

// Suppression d'un todo puis redirection vers la page todo de l'utilisateur connecté
router.delete('/:todo', (req, res, next) => {
  Todo.delete(req.params.todo).then( () => {
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
