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

module.exports = contestUserRouter