const UsersService = {
    getAllUsers(knex) {
      return knex
        .select('*')
        .from('users')
        .orderBy('user_id')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, user_id) {
      return knex
        .from('users')
        .select('*')
        .where('user_id', user_id)
        .first()
    },

    getByUsername(knex, username) {
      return knex
        .from('users')
        .select('*')
        .where('username', username)
        .first()
    },
  
    deleteUser(knex, user_id) {
      return knex('users')
        .where({ user_id })
        .delete()
    },
  
    updateUser(knex, user_id, newUserFields) {
      return knex('users')
        .where({ user_id })
        .update(newUserFields)
    },
  }
  
  module.exports = UsersService