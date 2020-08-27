const express = require('express')
const WeighinService = require('./weighin-service')

const WeighinRouter = express.Router()
const jsonParser = express.json()

WeighinRouter
    .route('/')
    .get((req,res,next) => {
        WeighinService.getAllWeighins(
            req.app.get('db')
        )
            .then(weighins => {
                res.json(weighins)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { user_id, contest_id, weight } = req.body
        const newWeighin = { user_id, contest_id, weight } 

        for (const [key, value] of Object.entries(newWeighin)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        WeighinService.insertWeighin(
          req.app.get('db'),
          newWeighin
        )
          .then(weighin => {
            res
              .status(201)
              .json(weighin)
          })
          .catch(next)
    })

WeighinRouter
    .route('/userId/:user_id')
    .all((req,res,next) => {
        WeighinService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(weighins => {
                if(weighins.length === 0) {
                    return res.status(404).json({
                        error: { message: `Weighins do not exist` }
                    })
                }
                
                res.weighins = weighins
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.weighins )
    })

WeighinRouter
    .route('/contestId/:contest_id')
    .all((req,res,next) => {
        WeighinService.getByContestId(
            req.app.get('db'),
            req.params.contest_id
        )
            .then(weighins => {
                if(weighins.length === 0) {
                    return res.status(404).json({
                        error: { message: `Weighins do not exist` }
                    })
                }
                
                res.weighins = weighins
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.weighins )
    })

WeighinRouter
    .route('/id/:id')
    .all((req,res,next) => {
        WeighinService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(weighins => {
                if(!weighins) {
                    return res.status(404).json({
                        error: { message: `Weighins do not exist` }
                    })
                }
                
                res.weighins = weighins
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json([{
            id: res.weighins.id,
            user_id: res.weighins.user_id,
            contest_id: res.weighins.contest_id,
            weight: res.weighins.weight,
            date_created: res.weighins.date_created
        }])
    })
    .delete((req,res,next) => {
        WeighinService.deleteWeighin(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { user_id, contest_id, weight } = req.body
        const weighinToUpdate = { user_id, contest_id, weight }

        const numberOfValues = Object.values(weighinToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'user_id', 'contest_id', or 'weight'`
                }
            })
        }

        WeighinService.updateWeighin(
            req.app.get('db'),
            req.params.id,
            weighinToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = WeighinRouter