const express = require('express')
const ContestsService = require('./contests-service')

const ContestsRouter = express.Router()
const jsonParser = express.json()

ContestsRouter
    .route('/')
    .get((req,res,next) => {
        ContestsService.getAllContests(
            req.app.get('db')
        )
            .then(contests => {
                res.json(contests)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { date_start, date_end, contest_name, weighin_day } = req.body
        const newContest = { date_start, date_end, contest_name, weighin_day }

        for (const [key, value] of Object.entries(newContest)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ContestsService.insertContest(
          req.app.get('db'),
          newContest
        )
          .then(contest => {
            res
              .status(201)
              .json(contest)
          })
          .catch(next)
    })

ContestsRouter
    .route('/:contest_id')
    .all((req,res,next) => {
        ContestsService.getById(
            req.app.get('db'),
            req.params.contest_id
        )
            .then(contest => {
                if(!contest) {
                    return res.status(404).json({
                        error: { message: `Contest doesn't exist` }
                    })
                }
                res.contest = contest
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            contest_id: res.contest.contest_id,
            date_start: res.contest.date_start,
            date_end: res.contest.date_end,
            contest_name: res.contest.contest_name,
            weighin_day: res.contest.weighin_day,
            date_created: res.contest.date_created
        })
    })
    .delete((req,res,next) => {
        ContestsService.deleteContest(
            req.app.get('db'),
            req.params.contest_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { date_start, date_end, contest_name, weighin_day } = req.body
        const contestToUpdate = { date_start, date_end, contest_name, weighin_day }

        const numberOfValues = Object.values(contestToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'date_start', 'date_end', 'contest_name', or 'weighin_day'`
                }
            })
        }

        ContestsService.updateContest(
            req.app.get('db'),
            req.params.contest_id,
            contestToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

ContestsRouter
    .route('/contestName/:contest_name')
    .all((req,res,next) => {
        ContestsService.getByContestName(
            req.app.get('db'),
            req.params.contest_name
        )
            .then(contest => {
                if(!contest) {
                    return res.status(404).json({
                        error: { message: `Contest doesn't exist` }
                    })
                }
                res.contest = contest
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json([res.contest])
    })

module.exports = ContestsRouter