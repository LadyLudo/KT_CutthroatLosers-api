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
        .first()
    },

    getByContestId(knex, contest_id) {
        return knex
          .from('measurements')
          .select('*')
          .where('contest_id', contest_id)
          .first()
      },

    getById(knex, id) {
        return knex
          .from('measurements')
          .select('*')
          .where('id', id)
          .first()
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