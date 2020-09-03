const WorkoutTrackingService = {
    getAllWorkouts(knex) {
      return knex
        .select('*')
        .from('workout_tracking')
        .orderBy('date_created')
    },
  
    insertWorkout(knex, newWorkout) {
      return knex
        .insert(newWorkout)
        .into('workout_tracking')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getByUserId(knex, user_id) {
      return knex
        .from('workout_tracking')
        .select('*')
        .where('user_id', user_id)   
    },

    getByContestId(knex, contest_id) {
        return knex
          .from('workout_tracking')
          .select('*')
          .where('contest_id', contest_id)
      },

    getById(knex, id) {
        return knex
          .from('workout_tracking')
          .select('*')
          .where('id', id)
          .first()
      },

    getWorkoutData(knex, contest_id, user_id, category) {
        return knex
          .from('workout_tracking')
          .select('date_created')
          .where({ contest_id: contest_id, user_id: user_id, category: category})
          .orderBy('date_created')
      },

      getDates(knex, user_id, contest_id) {
        return knex
          .from('workout_tracking')
          .select('date_created')
          .where({ user_id: user_id, contest_id: contest_id})
          .orderBy('date_created')
      },
  
    deleteWorkout(knex, id) {
      return knex('workout_tracking')
        .where({ id })
        .delete()
    },
  
    updateWorkout(knex, id, newWorkoutFields) {
      return knex('workout_tracking')
        .where({ id })
        .update(newWorkoutFields)
    },
  }
  
  module.exports = WorkoutTrackingService