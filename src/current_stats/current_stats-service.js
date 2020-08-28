const CurrentStatsService = {
    getAllUsers(knex) {
      return knex
        .select('*')
        .from('current_stats')
        .orderBy('user_id')
    },

    getAllContests(knex) {
        return knex
          .select('*')
          .from('current_stats')
          .orderBy('contest_id')
      },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('current_stats')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getByUserId(knex, user_id) {
      return knex
        .from('current_stats')
        .select('*')
        .where('user_id', user_id)
    },

    getByContestId(knex, contest_id) {
        return knex
          .from('current_stats')
          .select('*')
          .where('contest_id', contest_id)
      },

    getByContestUserId(knex, user_id, contest_id) {
        return knex
          .from('current_stats')
          .select('*')
          .where({user_id, contest_id})
      },

    getDisplayName(knex, user_id, contest_id) {
        return knex
          .from('current_stats')
          .select('display_name')
          .where({user_id, contest_id})
      },
  
    deleteCurrentStats(knex, user_id, contest_id) {
      return knex('current_stats')
        .where({ user_id })
        .delete()
    },
  
    updateCurrentStats(knex, user_id, contest_id, newCurrentStatsFields) {
      return knex('current_stats')
        .where({ user_id })
        .update(newCurrentStatsFields)
    },
  }
  
  module.exports = CurrentStatsService