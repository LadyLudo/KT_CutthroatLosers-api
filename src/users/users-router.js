const express = require('express')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter
    .route('/')
    .get((req,res,next) => {
        UsersService.getAllUsers(
            req.app.get('db')
        )
            .then(users => {
                res.json(users)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { password, display_name, username } = req.body
        const newUser = { password, display_name, username }

        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        UsersService.insertUser(
          req.app.get('db'),
          newUser
        )
          .then(user => {
            res
              .status(201)
              .json(user)
          })
          .catch(next)
    })

usersRouter
    .route('/:user_id')
    .all((req,res,next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.user_id
        )
            .then(user => {
                if(!user) {
                    return res.status(404).json({
                        error: { message: `User doesn't exist` }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            user_id: res.user.user_id,
            password: res.user.password,
            display_name: res.user.display_name,
            date_created: res.user.date_created,
            username: res.user.username
        })
    })
    .delete((req,res,next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.user_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { password, display_name, username } = req.body
        const userToUpdate = { password, display_name, username } 

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'password', 'display_name', or 'username'`
                }
            })
        }

        UsersService.updateUser(
            req.app.get('db'),
            req.params.user_id,
            userToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

// usersRouter
//     .route('/searchByUsername/:username')
//     .get((req,res,next) => {
//         UsersService.getByUsername(
//             req.app.get('db'),
//             req.params.username
//         )
//             .then(user => {
//                 if(!user) {
//                     return res.status(404).json({
//                         error: { message: `User doesn't exist` }
//                     })
//                 }
//                 res.user = user
//                 next()
//             })
//             .catch(next)
//     })


module.exports = usersRouter
