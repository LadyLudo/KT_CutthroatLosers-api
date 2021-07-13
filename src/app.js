require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const usersRouter = require('./users/users-router')
const contestsRouter = require('./contests/contests-router')
const contestUserRouter = require('./contest_to_user/ContestUser-router')
const CurrentStatsRouter = require('./current_stats/current_stats-router')
const MeasurementsRouter = require('./measurements/measurements-router')
const PointsRouter = require('./points/points-router')
const WinRouter = require('./win/win-router')
const WeighinRouter = require('./Weighin/weighin-router')
const WorkoutRouter = require('./workout_tracking/workout_tracking-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
const whitelist = ['https://cutthroat-losers-app.herokuapp.com', 'http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || origin === undefined) {
            callback(null, true)
        } else {
            console.log({origin})
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}
app.use(cors(corsOptions))


app.use('/api/users', usersRouter)
app.use('/api/contests', contestsRouter)
app.use('/api/contesttouser', contestUserRouter)
app.use('/api/currentstats', CurrentStatsRouter)
app.use('/api/measurements', MeasurementsRouter)
app.use('/api/points', PointsRouter)
app.use('/api/wins', WinRouter)
app.use('/api/weighins', WeighinRouter)
app.use('/api/workouts', WorkoutRouter)

app.get('/', (req,res) => {
    res.send('Hello, cutthroat losers world!')
})

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})
module.exports = app