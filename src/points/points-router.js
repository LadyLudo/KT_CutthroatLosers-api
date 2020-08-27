const express = require('express')
const PointsService = require('./points-service')

const PointsRouter = express.Router()
const jsonParser = express.json()

PointsRouter
    .route('/')
    .get((req,res,next) => {
        PointsService.getAllPoints(
            req.app.get('db')
        )
            .then(points => {
                res.json(points)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { user_id, contest_id, points, category, description, win_id } = req.body
        const newPoints = { user_id, contest_id, points, category, description, win_id } 

        for (const [key, value] of Object.entries(newPoints)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        PointsService.insertPoints(
          req.app.get('db'),
          newPoints
        )
          .then(points => {
            res
              .status(201)
              .json(points)
          })
          .catch(next)
    })

PointsRouter
    .route('/userId/:user_id')
    .all((req,res,next) => {
        PointsService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(points => {
                if(points.length === 0) {
                    return res.status(404).json({
                        error: { message: `Points do not exist` }
                    })
                }
                
                res.points = points
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.points )
    })

PointsRouter
    .route('/contestId/:contest_id')
    .all((req,res,next) => {
        PointsService.getByContestId(
            req.app.get('db'),
            req.params.contest_id
        )
            .then(points => {
                if(points.length === 0) {
                    return res.status(404).json({
                        error: { message: `Points do not exist` }
                    })
                }
                
                res.points = points
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.points )
    })

PointsRouter
    .route('/id/:id')
    .all((req,res,next) => {
        PointsService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(points => {
                if(!points) {
                    return res.status(404).json({
                        error: { message: `Points do not exist` }
                    })
                }
                
                res.points = points
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json([{
            id: res.points.id,
            user_id: res.points.user_id,
            contest_id: res.points.contest_id,
            points: res.points.points,
            category: res.points.category,
            description: res.points.description,
            win_id: res.points.win_id,
            date_created: res.points.date_created
        }])
    })
    .delete((req,res,next) => {
        PointsService.deletePoints(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { user_id, contest_id, points, category, description, win_id } = req.body
        const pointsToUpdate = { user_id, contest_id, points, category, description, win_id }

        const numberOfValues = Object.values(pointsToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'user_id', 'contest_id', 'points', 'category', 'description', or 'win_id'`
                }
            })
        }

        PointsService.updatePoints(
            req.app.get('db'),
            req.params.id,
            pointsToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = PointsRouter