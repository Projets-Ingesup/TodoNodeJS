const router = require('express').Router()
const User = require('../models/user')
const Session = require('../models/session')

/* Users : liste */
router.get('/', (req, res, next) => {
    let limit = parseInt(req.query.limit) || 20
    let offset = parseInt(req.query.offset) || 0

    if (limit < 1) limit = 1
    else if (limit > 100) limit = 100

    if (offset < 0) offset = 0

    Promise.all([
        User.getAllUsers(limit, offset),
        User.count()
    ]).then((results) => {
        var token = Session.getToken(req)
        User.getUserIdFromToken(token).then((currentUserId) => {
            User.getUserById(currentUserId).then((currentUser) => {
                res.format({
                    html: () => {
                        res.render('users/index', {
                            users: results[0],
                            count: results[1].count,
                            limit: limit,
                            currentUser: currentUser,
                            offset: offset
                        })
                    },
                    json: () => {
                        res.send({
                            data: results[0],
                            meta: {
                                count: results[1].count
                            }
                        })
                    }
                })
            })
        })
    }).catch(next)
})

// On affiche les informations d'un utilisateur qui pourront être modifiées
router.get('/:userId(\\d+)/edit', (req, res, next) => {
    res.format({
        html: () => {
          // On récupère les informations de l'utilisateurs dont l'id est passé
          // en paramètre
            User.getUserById(req.params.userId).then((user) => {
                if (!user) return next()

                res.render('users/edit', {
                    user: user,
                    action: `/users/${user.rowid}?_method=put`
                })
            }).catch(next)
        },
        json: () => {
            let err = new Error('Bad Request')
            err.status = 400
            next(err)
        }
    })
})

// On affiche le formulaire pour ajouter un nouvel utilisateur
router.get('/add', (req, res, next) => {
    res.format({
        html: () => {
            res.render('users/add', {
                action: '/users'
            })
        },
        json: () => {
            let err = new Error('Bad Request')
            err.status = 400
            next(err)
        }
    })
})

// On affiche les informations de l'utilisateur dont on a passé l'id
// en paramètre
router.get('/:userId(\\d+)', (req, res, next) => {
    User.getUserById(req.params.userId).then((user) => {
        if (!user) return next()

        res.format({
            html: () => {
                res.render('users/show', {
                    user: user
                })
            },
            json: () => {
                res.send({
                    data: user
                })
            }
        })
    }).catch(next)
})

// Ajout d'un utilisateur en base
router.post('/', (req, res, next) => {
    // On vérifie qu'aucun des input n'est pas renseigné ou a une valeur null
    if (!req.body.pseudo || req.body.pseudo === '' ||
        !req.body.email || req.body.email === '' ||
        !req.body.password || req.body.password === '' ||
        !req.body.firstname || req.body.firstname === ''
    ) {
        // Gestion des erreurs si un paramètre n'est pas renseigné
        let err = new Error('Bad Request')
        err.status = 400
        return next(err)
    }

    User.getUserByPseudo(req.body.pseudo).then( (user) => {
      // Si il n'y a pas d'utilisateur avec le même pseudo en base de donnée,
      // on sauvegarde le nouvel utilisateur
      if (user == "" || !user) {
        User.insert(req.body).then(() => {
            res.format({
                html: () => {
                    res.redirect('/users')
                },
                json: () => {
                    res.status(201).send({
                        message: 'success'
                    })
                }
            })
        }).catch(next)
      } else {
        // Si il y a déjà un utilisateur avec ce pseudo, on redirige vers le formulaire
        // d'ajout de nouvel utilisateur
        res.format({
          html: () => {
            res.redirect('/users/add')
          },
          json: () => {
            res.status(409).send({
              message: 'User cannot be saved, another user has already this pseudo.'
            })
          }
        })

      }
    })
})

// Suppression d'un utilisateur selon l'id passé en paramètre
router.delete('/:userId(\\d+)', (req, res, next) => {
    User.removeUserById(req.params.userId).then(() => {
        res.format({
            html: () => {
                res.redirect('/users')
            },
            json: () => {
                res.send({
                    message: 'success'
                })
            }
        })
    }).catch(next)
})


router.put('/:userId(\\d+)', (req, res, next) => {
    User.update(req.params.userId, req.body).then(() => {
        res.format({
            html: () => {
                res.redirect('/users')
            },
            json: () => {
                res.send({
                    message: 'success'
                })
            }
        })
    }).catch(next)
})

module.exports = router
