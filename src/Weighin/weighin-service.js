const WeighinService = {
    getAllWeighins(knex) {
      return knex
        .select('*')
        .from('weighin')
        .orderBy('date_created')
    },
  
    insertWeighin(knex, newWeighin) {
      return knex
        .insert(newWeighin)
        .into('weighin')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getByUserId(knex, user_id) {
      return knex
        .from('weighin')
        .select('*')
        .where('user_id', user_id)   
    },

    getByContestId(knex, contest_id) {
        return knex
          .from('weighin')
          .select('*')
          .where('contest_id', contest_id)
      },

    getById(knex, id) {
        return knex
          .from('weighin')
          .select('*')
          .where('id', id)
          .first()
      },
  
    deleteWeighin(knex, id) {
      return knex('weighin')
        .where({ id })
        .delete()
    },
  
    updateWeighin(knex, id, newWeighinFields) {
      return knex('weighin')
        .where({ id })
        .update(newWeighinFields)
    },
  }
  
  module.exports = WeighinService