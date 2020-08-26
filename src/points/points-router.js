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

PointsRouter
    .route('/userId/:user_id')
    .all((req,res,next) => {
        PointsService.getByUserId(
            req.app.get('db'),
            req.params.user_id
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
        console.log(res.points)
        res.json({ 
            id: res.points.id,
            user_id: res.points.user_id,
            contest_id: res.points.contest_id,
            points: res.points.points,
            category: res.points.category,
            description: res.points.description,
            win_id: res.points.win_id,
            date_created: res.points.date_created})
    })

module.exports = PointsRouter