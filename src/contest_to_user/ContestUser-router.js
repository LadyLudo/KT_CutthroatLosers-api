const express = require('express')
const ContestUserService = require('./ContestUser-service')

const contestUserRouter = express.Router()
const jsonParser = express.json()

contestUserRouter
    .route('/')
    .get((req,res,next) => {
        ContestUserService.getAllContestUsers(
            req.app.get('db')
        )
            .then(contestusers => {
                res.json(contestusers)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { user_id, contest_id } = req.body
        const newContestUser = { user_id, contest_id }

        for (const [key, value] of Object.entries(newContestUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ContestUserService.insertContestUser(
          req.app.get('db'),
          newContestUser
        )
          .then(contestUser => {
            res
              .status(201)
              .json(contestUser)
          })
          .catch(next)
    })

contestUserRouter
    .route('/userId/:user_id')
    .all((req,res,next) => {
        ContestUserService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(contestUser => {
                if(!contestUser) {
                    return res.status(404).json({
                        error: { message: `ContestUser doesn't exist` }
                    })
                }
                res.contestUser = contestUser
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.contestUser.id,
            user_id: res.contestUser.user_id,
            contest_id: res.contestUser.contest_id,
            date_created: res.contestUser.date_created
        })
    })
    .delete((req,res,next) => {
        ContestUserService.deleteContestUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { user_id, contest_id } = req.body
        const contestUserToUpdate = { user_id, contest_id }

        const numberOfValues = Object.values(contestUserToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'user_id' or 'contest_id'`
                }
            })
        }

        ContestUserService.updateContestUser(
            req.app.get('db'),
            req.params.user_id,
            contestUserToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = contestUserRouter