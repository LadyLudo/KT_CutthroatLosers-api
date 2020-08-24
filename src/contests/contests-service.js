const ContestsService = {
    getAllContests(knex) {
      return knex
        .select('*')
        .from('contests')
        .orderBy('contest_id')
    },
  
    insertContest(knex, newContest) {
      return knex
        .insert(newContest)
        .into('contests')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, contest_id) {
      return knex
        .from('contests')
        .select('*')
        .where('contest_id', contest_id)
        .first()
    },
  
    deleteContest(knex, contest_id) {
      return knex('contests')
        .where({ contest_id })
        .delete()
    },
  
    updateContest(knex, contest_id, newContestFields) {
      return knex('contests')
        .where({ contest_id })
        .update(newContestFields)
    },
  }
  
  module.exports = ContestsService