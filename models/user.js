const db = require('sqlite')
const bcrypt = require('bcryptjs')

const Session = require('../models/session')

module.exports = {
  getUserById: (userId) => {
    return db.get('SELECT rowid, * FROM users WHERE rowid = ?', userId)
  },

  getUserByPseudo: (pseudo) => {
    return db.get('SELECT rowid, * FROM users WHERE pseudo = ?', pseudo)
  },

  getAllUsers: (limit, offset) => {
    return db.all('SELECT rowid, * FROM users LIMIT ? OFFSET ?', limit, offset)
  },

  count: () => {
    return db.get('SELECT COUNT(*) as count FROM users')
  },

  insert: (params) => {
    let hashPassword = bcrypt.hashSync(params.password)
    return db.run(
      'INSERT INTO users (pseudo, password, email, firstname, createdAt, updatedAt, teamName, teamId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      params.pseudo,
      hashPassword,
      params.email,
      params.firstname,
      Date.now(),
      null,
      null,
      null
    )
  },

  update: (userId, body) => {
    return db.run('UPDATE users SET pseudo = ?, email = ?, firstname = ?, updatedAt = ? WHERE rowid = ?', body.pseudo, body.email, body.firstname, Date.now(), userId )
  },

  removeUserById: (userId) => {
    return db.run('DELETE FROM users WHERE rowid = ?', userId)
  },

  getUserIdFromToken: (accessToken) => {
    return Session.isExistingToken(accessToken).then((token) => {return token.userId})
  }
}
