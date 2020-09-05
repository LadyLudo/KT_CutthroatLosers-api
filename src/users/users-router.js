const express = require('express')
const UsersService = require('./users-service')
const bcrypt = require('bcrypt')

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
        bcrypt.hash(newUser.password, 10)
            .then((hash) => {
                const hashedUser = {
                    password: hash,
                    display_name: newUser.display_name,
                    username: newUser.username
                }
                UsersService.insertUser(
                    req.app.get('db'),
                    hashedUser
                  )
                    .then(user => {
                      res
                        .status(201)
                        .json(user)
                    })
                    .catch(next)
            })

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
        if(req.body.password !== undefined){
            bcrypt.hash(req.body.password, 6)
            .then((hashPass) => {
                const hashedUser = {
                    password: hashPass,
                    display_name: userToUpdate.display_name,
                    username: userToUpdate.username
                }
                console.log(hashedUser, "hashedUser")
                UsersService.updateUser(
                    req.app.get('db'),
                    req.params.user_id,
                    hashedUser
                  )
                    .then(user => {
                      res
                        .status(204).end()
                    })
                    .catch(next)
            })
        } else {
            UsersService.updateUser(
                req.app.get('db'),
                req.params.user_id,
                userToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        }
    })

usersRouter
    .route('/searchByUsername/:username')
    .all((req,res,next) => {
        UsersService.getByUsername(
            req.app.get('db'),
            req.params.username
        )
            .then(user => {
                if(user) {
                    return res.status(404).json({
                        error: { message: `User already exists` }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req,res,next) => {
        res.json()
    })

usersRouter
    .route('/searchByUsername/getId/:username')
    .all((req,res,next) => {
        UsersService.getIdOnly(
            req.app.get('db'),
            req.params.username
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
    .get((req,res,next) => {
        res.json(res.user)
    })

usersRouter
    .route('/login/userAuth')
    .all((req,res,next) => {
        UsersService.userAuth(
            req.app.get('db'),
            req.query.username,
            req.query.password
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
    .get((req,res,next) => {
        if (res.user.password === req.query.password){
            res.json({
            user_id: res.user.user_id,
            password: res.user.password,
        })
        } else{
            res.status(200).send('password does not match')
        }

        
    })

usersRouter
    .route('/adminPage/all')
    .all((req,res,next) => {
        UsersService.adminGetAllUsers(
            req.app.get('db'),
        )
            .then(user => {
                if(user.length === 0) {
                    return res.status(404).json({
                        error: { message: `Users do not exist` }
                    })
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.user )
    })


module.exports = usersRouter
