const express = require('express')
const CurrentStatsService = require('./current_stats-service')

const CurrentStatsRouter = express.Router()
const jsonParser = express.json()

CurrentStatsRouter
    .route('/')
    .get((req,res,next) => {
        CurrentStatsService.getAllUsers(
            req.app.get('db')
        )
            .then(users => {
                res.json(users)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { user_id, current_weight, goal_weight, display_name, contest_id } = req.body
        const newCurrentStats = { user_id, current_weight, goal_weight, display_name, contest_id }

        for (const [key, value] of Object.entries(newCurrentStats)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        CurrentStatsService.insertUser(
          req.app.get('db'),
          newCurrentStats
        )
          .then(currentstats => {
            res
              .status(201)
              .json(currentstats)
          })
          .catch(next)
    })

CurrentStatsRouter
        .route('/contests')
            .get((req,res,next) => {
                CurrentStatsService.getAllContests(
                    req.app.get('db')
                )
                    .then(users => {
                        res.json(users)
                    })
                    .catch(next)
            })
    

CurrentStatsRouter
        .route('/userId/:user_id')
        .all((req,res,next) => {
            CurrentStatsService.getByUserId(
                req.app.get('db'),
                req.params.user_id
            )
                .then(currentstats => {
                    if(!currentstats) {
                        return res.status(404).json({
                            error: { message: `CurrentStats doesn't exist` }
                        })
                    }
                    res.currentstats = currentstats
                    next()
        
                })
                .catch(next)
        })
        .get((req, res, next) => {
            res.json({
                user_id: res.currentstats.user_id,
                current_weight: res.currentstats.current_weight,
                goal_weight: res.currentstats.goal_weight,
                display_name: res.currentstats.display_name,
                contest_id: res.currentstats.contest_id
            })
        })
        .delete((req,res,next) => {
            CurrentStatsService.deleteUser(
                req.app.get('db'),
                req.params.user_id
            )
                .then(() => {
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch( jsonParser, (req,res, next) => {
            const { user_id, current_weight, goal_weight, display_name, contest_id } = req.body
            const userToUpdate = { user_id, current_weight, goal_weight, display_name, contest_id }
    
            const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
            if (numberOfValues === 0) {
                return res.status(400).json({
                    error: {
                        message: `Request body must contain either 'user_id' 'current_weight', 'goal_weight', 'display_name', or 'contest_id'`
                    }
                })
            }
    
            CurrentStatsService.updateUser(
                req.app.get('db'),
                req.params.user_id,
                userToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })

CurrentStatsRouter
        .route('/contestId/:contest_id')
        .all((req,res,next) => {
            CurrentStatsService.getByContestId(
                req.app.get('db'),
                req.params.contest_id
            )
                .then(currentstats => {
                    if(!currentstats) {
                        return res.status(404).json({
                            error: { message: `CurrentStats doesn't exist` }
                        })
                    }
                    res.currentstats = currentstats
                    next()
        
                })
                .catch(next)
        })
        .get((req, res, next) => {
            res.json({
                user_id: res.currentstats.user_id,
                current_weight: res.currentstats.current_weight,
                goal_weight: res.currentstats.goal_weight,
                display_name: res.currentstats.display_name,
                contest_id: res.currentstats.contest_id
            })
        })

module.exports = CurrentStatsRouter