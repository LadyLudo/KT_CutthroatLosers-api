const express = require('express')
const WorkoutTrackingService = require('./workout_tracking-service')

const WorkoutRouter = express.Router()
const jsonParser = express.json()

WorkoutRouter
    .route('/')
    .get((req,res,next) => {
        WorkoutTrackingService.getAllWorkouts(
            req.app.get('db')
        )
            .then(workouts => {
                res.json(workouts)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { user_id, contest_id, category } = req.body
        const newWorkout = { user_id, contest_id, category } 

        for (const [key, value] of Object.entries(newWorkout)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        WorkoutTrackingService.insertWorkout(
          req.app.get('db'),
          newWorkout
        )
          .then(workout => {
            res
              .status(201)
              .json(workout)
          })
          .catch(next)
    })

WorkoutRouter
    .route('/userId/:user_id')
    .all((req,res,next) => {
        WorkoutTrackingService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(workouts => {
                if(workouts.length === 0) {
                    return res.status(404).json({
                        error: { message: `Workouts do not exist` }
                    })
                }
                
                res.workouts = workouts
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.workouts )
    })

WorkoutRouter
    .route('/contestId/:contest_id')
    .all((req,res,next) => {
        WorkoutTrackingService.getByContestId(
            req.app.get('db'),
            req.params.contest_id
        )
            .then(workouts => {
                if(workouts.length === 0) {
                    return res.status(404).json({
                        error: { message: `Workouts do not exist` }
                    })
                }
                
                res.workouts = workouts
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.workouts )
    })

WorkoutRouter
    .route('/id/:id')
    .all((req,res,next) => {
        WorkoutTrackingService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(workout => {
                if(!workout) {
                    return res.status(404).json({
                        error: { message: `Workout does not exist` }
                    })
                }
                
                res.workout = workout
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json([{
            id: res.workout.id,
            contest_id: res.workout.contest_id,
            user_id: res.workout.user_id,
            category: res.workout.category,
            date_created: res.workout.date_created
        }])
    })
    .delete((req,res,next) => {
        WorkoutTrackingService.deleteWorkout(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { user_id, contest_id, category } = req.body
        const workoutToUpdate = { user_id, contest_id, category }

        const numberOfValues = Object.values(workoutToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'user_id', 'contest_id', or 'category'`
                }
            })
        }

        WorkoutTrackingService.updateWorkout(
            req.app.get('db'),
            req.params.id,
            workoutToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = WorkoutRouter