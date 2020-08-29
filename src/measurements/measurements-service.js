const MeasurementsService = {
    getAllMeasurements(knex) {
      return knex
        .select('*')
        .from('measurements')
        .orderBy('user_id')
    },
  
    insertMeasurement(knex, newMeasurement) {
      return knex
        .insert(newMeasurement)
        .into('measurements')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getByUserId(knex, user_id) {
      return knex
        .from('measurements')
        .select('*')
        .where('user_id', user_id)
    },

    getByContestId(knex, contest_id) {
        return knex
          .from('measurements')
          .select('*')
          .where('contest_id', contest_id)
      },

    getById(knex, id) {
        return knex
          .from('measurements')
          .select('*')
          .where('id', id)
          .first()
      },

    getMeasurementInfo(knex, contest_id, user_id) {
      return knex
        .from('measurements')
        .select(knex.raw('CAST(date_created AS DATE), CAST (measurement AS DOUBLE PRECISION)'))
        .where({ contest_id, user_id })
    },

    getAdminMeasurementProgress(knex, user_id) {
      return knex
        .from('measurements')
        .select('date_created', knex.raw('CAST (measurement AS DOUBLE PRECISION)'))
        .where({ user_id })
        .limit(2)
    },
  
    deleteMeasurement(knex, id) {
      return knex('measurements')
        .where({ id })
        .delete()
    },
  
    updateMeasurement(knex, id, newMeasurementFields) {
      return knex('measurements')
        .where({ id })
        .update(newMeasurementFields)
    },
  }
  
  module.exports = MeasurementsService