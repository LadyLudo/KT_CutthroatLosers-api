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
  
    getContestWeighins(knex, contest_id, user_id) {
      return knex
        .from('weighin')
        .select(knex.raw('CAST(date_created AS DATE), CAST (weight AS DOUBLE PRECISION)'))
        .where({ contest_id, user_id }) 
        .orderBy('date_created')  
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

    getUserWeights(knex, user_id) {
        return knex
          .from('weighin')
          .select('weight')
          .where('user_id', user_id)
          .orderBy('date_created', desc) 
          .limit(1)  
      },

      getAdminUserWeights(knex, user_id) {
        return knex
          .from('weighin')
          .select(knex.raw('CAST (weight AS DOUBLE PRECISION), date_created'))
          .where('user_id', user_id)
          .orderBy('date_created') 
          .limit(2)  
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