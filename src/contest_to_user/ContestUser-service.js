const ContestUserService = {
    getAllContestUsers(knex) {
      return knex
        .select('*')
        .from('contest_to_user')
        .orderBy('user_id')
    },
  
    insertContestUser(knex, newContestUser) {
      return knex
        .insert(newContestUser)
        .into('contest_to_user')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getByUserId(knex, user_id) {
      return knex
        .from('contest_to_user')
        .select('*')
        .where('user_id', user_id)
    },

    getByContestId(knex, contest_id) {
        return knex
          .from('contest_to_user')
          .select('*')
          .where('contest_id', contest_id)
    },

    getById(knex, id) {
        return knex
          .from('contest_to_user')
          .select('*')
          .where('id', id)
          .first()
    },

    getOnlyUserId(knex, contest_id) {
        return knex
          .from('contest_to_user')
          .select('user_id')
          .where('contest_id', contest_id)
    },
  
    deleteContestUser(knex, user_id) {
      return knex('contest_to_user')
        .where({ user_id })
        .delete()
    },
  
    updateContestUser(knex, user_id, newContestUserFields) {
      return knex('contest_to_user')
        .where({ user_id })
        .update(newContestUserFields)
    },
  }
  
  module.exports = ContestUserService