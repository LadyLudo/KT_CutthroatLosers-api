const express = require('express')
const WinService = require('./win-service')

const WinRouter = express.Router()
const jsonParser = express.json()

WinRouter
    .route('/')
        .get((req,res,next) => {
            WinService.getAllWins(
                req.app.get('db')
            )
                .then(wins => {
                    res.json(wins)
                })
                .catch(next)
        })
        .post(jsonParser, (req,res,next) => {
            const { win, contest_id } = req.body
            const newWin = { win, contest_id }
    
            for (const [key, value] of Object.entries(newWin)) {
                if (value == null) {
                    return res.status(400).json({
                        error: { message: `Missing '${key}' in request body` }
                    })
                }
            }
    
            WinService.insertWin(
              req.app.get('db'),
              newWin
            )
              .then(win => {
                res
                  .status(201)
                  .json(win)
              })
              .catch(next)
        })

WinRouter
    .route('/winId/:win_id')
    .all((req,res,next) => {
        WinService.getByWinId(
            req.app.get('db'),
            req.params.win_id
        )
            .then(win => {
                if(win.length === 0) {
                    return res.status(404).json({
                        error: { message: `Win does not exist` }
                    })
                }
                
                res.win = win
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.win )
    })
    .delete((req,res,next) => {
        WinService.deleteWin(
            req.app.get('db'),
            req.params.win_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { win, contest_id } = req.body
        const winToUpdate = { win, contest_id }

        const numberOfValues = Object.values(winToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'win' or 'contest_id'`
                }
            })
        }

        WinService.updateWin(
            req.app.get('db'),
            req.params.win_id,
            winToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = WinRouter