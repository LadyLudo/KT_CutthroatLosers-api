const express = require('express')
const MeasurementsService = require('./measurements-service')

const MeasurementsRouter = express.Router()
const jsonParser = express.json()

MeasurementsRouter
    .route('/')
    .get((req,res,next) => {
        MeasurementsService.getAllMeasurements(
            req.app.get('db')
        )
            .then(measurements => {
                res.json(measurements)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { user_id, contest_id, measurement } = req.body
        const newMeasurement = { user_id, contest_id, measurement }

        for (const [key, value] of Object.entries(newMeasurement)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        MeasurementsService.insertMeasurement(
          req.app.get('db'),
          newMeasurement
        )
          .then(measurement => {
            res
              .status(201)
              .json(measurement)
          })
          .catch(next)
    })

MeasurementsRouter
    .route('/userId/:user_id')
    .all((req,res,next) => {
        MeasurementsService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(measurements => {
                if(measurements.length === 0) {
                    return res.status(404).json({
                        error: { message: `Measurements do not exist` }
                    })
                }
                res.measurements = measurements
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.measurements)
    })

MeasurementsRouter
    .route('/contestId/:contest_id')
    .all((req,res,next) => {
        MeasurementsService.getByContestId(
            req.app.get('db'),
            req.params.contest_id
        )
            .then(measurements => {
                if(measurements.length === 0) {
                    return res.status(404).json({
                        error: { message: `Measurements do not exist` }
                    })
                }
                res.measurements = measurements
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.measurements)
    })

MeasurementsRouter
    .route('/id/:id')
    .all((req,res,next) => {
        MeasurementsService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(measurements => {
                if(!measurements) {
                    return res.status(404).json({
                        error: { message: `Measurements do not exist` }
                    })
                }
                res.measurements = measurements
                next()
    
            })
            .catch(next)
    })
    .get((req,res,next) => {
        MeasurementsService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(measurements => {
                res.json(measurements)
            })
            .catch(next)
    })
    .delete((req,res,next) => {
        MeasurementsService.deleteMeasurement(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { user_id, contest_id, measurement } = req.body
        const measurementToUpdate = { user_id, contest_id, measurement }

        const numberOfValues = Object.values(measurementToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'user_id', 'contest_id', or 'measurement'`
                }
            })
        }

        MeasurementsService.updateMeasurement(
            req.app.get('db'),
            req.params.id,
            measurementToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

MeasurementsRouter
    .route('/getMeasurementInfo')
    .all((req,res,next) => {
        MeasurementsService.getMeasurementInfo(
            req.app.get('db'),
            req.query.contest_id,
            req.query.user_id
        )
            .then(measurements => {
                
                res.measurements = measurements
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.measurements)
    })

MeasurementsRouter
    .route('/getAdminMeasurementProgress')
    .all((req,res,next) => {
        MeasurementsService.getAdminMeasurementProgress(
            req.app.get('db'),
            req.query.user_id
        )
            .then(measurements => {
                if(measurements.length === 0) {
                    return res.status(404).json({
                        error: { message: `Measurements do not exist` }
                    })
                }
                res.measurements = measurements
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.measurements)
    })



module.exports = MeasurementsRouter