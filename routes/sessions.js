const router = require('express').Router()
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const Session = require('../models/session')
const User = require('../models/user')

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

router.post('/', (req, res, next) => {
    if (req.body.pseudo != "" || req.body.pseudo != null || req.body.password != "" || req.body.password != null) {
        User.getUserByPseudo(req.body.pseudo).then((user) => {
            if (!user || user == '') {
                res.format({
                    html: () => {
                        res.render('sessions/authentification', {
                            loginFailed: true
                        })
                    },
                    json: () => {
                        res.status(403);
                        res.end();
                    }
                })
            }
            var isMatch =bcrypt.compareSync(req.body.password, user.password)
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
