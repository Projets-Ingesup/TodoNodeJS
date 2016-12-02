const router = require('express').Router()
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const Session = require('../models/session')
const User = require('../models/user')

// Affichage du formulaire d'authentification
router.get('/', (req, res, next) => {
    res.format({
        html: () => {
            res.render('sessions/authentification')
        },
        json: () => {
            res.status(400)
            res.end()
        }
    })
})

// Enregistrement d'une session
router.post('/', (req, res, next) => {
    // Gestion des erreurs (password ou pseudo non renseignés ou null)
    if (req.body.pseudo != "" || req.body.pseudo != null || req.body.password != "" || req.body.password != null) {
        User.getUserByPseudo(req.body.pseudo).then((user) => {
            // Si il n'y a pas d'utilisateur ayant le pseudo passé en paramètre,
            // on redirige vers le formulaire avec un message d'erreur
            if (!user || user == '') {
                res.format({
                    html: () => {
                        res.render('sessions/authentification', {
                            loginFailed: true
                        })
                    },
                    json: () => {
                        res.status(401)
                        res.end()
                    }
                })
            }
            // On test si le password passé en paramètre est le même que celui stocké
            // en base pour l'utilisateur qui a le même pseudo que celui passé en paramètre
            var isMatch =bcrypt.compareSync(req.body.password, user.password)

            // Si les password sont identiques, on créé un accessToken
            if (isMatch) {
              require('crypto').randomBytes(48, (err, buffer) => {
                var token = buffer.toString('hex')
                Session.add(user.rowid, token).then( (result) => {
                  console.log(result)
                  res.format({
                    html: () => {
                      res.cookie('accessToken', token, {httpOnly: true})
                      res.redirect('/')
                    },
                    json: () => {
                      res.send({accessToken: token})
                    }
                  })
                }).catch( (err) => {
                  return err;
                })
              })
            }
            // Si les deux password ne sont pas identiques, on renvoie de nouveau
            // le formulaire d'authentification
            else {
              res.format({
                html: () => {
                    res.render('sessions/authentification', {
                        loginFailed: true
                    })
                },
                json: () => {
                  res.status(401)
                  res.end()
                }
              })
            }

        })
    } else {
        res.format({
            html: () => {
                res.render('sessions/authentification', {
                    loginFailed: true
                })
            },
            json: () => {
                res.status(400);
                res.end();
            }
        })
    }
})

// Suppression de l'accessToken puis on renvoie vers le formulaire d'authentification
router.delete('/', (req, res, next) => {
  res.format({
    html:() => {
      res.clearCookie('accessToken')
      res.redirect('/sessions')
    },
    json: () => {
      res.status(400)
      res.end()
    }
  })
})





module.exports = router
