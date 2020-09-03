const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeWorkoutArray } = require('./workout_tracking.fixtures')
const { makeUsersArray } = require('./users.fixtures')
const { makeContestsArray } = require('./contests.fixtures')

let db

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
})

after('disconnect from db', () => db.destroy())

before('clean the table', () => {
    db('users').delete()
    db('contests').delete()
    db('workout_tracking').delete()
})

afterEach('cleanup', () => {
    db('users').delete()
    db('contests').delete()
    db('workout_tracking').delete()
})

describe('GET /api/workouts', function() {
    context('Given no workokuts', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/workouts')
                .expect(200, [])
        })
    })

    context('Given that there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 200 and all of the workouts', () => {
            return supertest(app)
                .get('/api/workouts')
                .expect(200, testWorkouts)
        })        
    })
})

describe('GET /api/workouts/userId/:user_id', () => {
    context('Given no workouts', () => {
        it('responds with 404', () => {
            const user_id = 99999
            return supertest(app)
                .get(`/api/workouts/userId/${user_id}`)
                .expect(404, { error: { message: `Workouts do not exist` } })
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 200 and the expected workouts', () => {
            const user_id = 1
            const expectedWorkouts = testWorkouts.filter(workout => workout.user_id === user_id)
            return supertest(app)
                .get(`/api/workouts/userId/${user_id}`)
                .expect(200, expectedWorkouts)
        })
        
    })
})

describe('GET /api/workouts/contestId/:contest_id', () => {
    context('Given no workouts', () => {
        it('responds with 404', () => {
            const contest_id = 99999
            return supertest(app)
                .get(`/api/workouts/contestId/${contest_id}`)
                .expect(404, { error: { message: `Workouts do not exist` } })
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 200 and the expected workouts', () => {
            const contest_id = 1
            const expectedWorkouts = testWorkouts.filter(workout => workout.contest_id === contest_id)
            return supertest(app)
                .get(`/api/workouts/contestId/${contest_id}`)
                .expect(200, expectedWorkouts)
        })
        
    })
})

describe('GET /api/workouts/id/:id', () => {
    context('Given no workouts', () => {
        it('responds with 404', () => {
            const id = 99999
            return supertest(app)
                .get(`/api/workouts/id/${id}`)
                .expect(404, { error: { message: `Workout does not exist` } })
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 200 and the expected workout', () => {
            const id = 1
            const expectedWorkout = testWorkouts.filter(workout => workout.id === id)
            return supertest(app)
                .get(`/api/workouts/id/${id}`)
                .expect(200, expectedWorkout)
        })
        
    })
})

describe('POST /api/workouts/', () => {
    context('Given that there are users and contests in the database', () => {
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })

        it('create workout, responding with 201 and the new workout', () => {
            const newWorkout = {
                contest_id: 1,
                user_id: 1,
                category: 'strength',
            }
            return supertest(app)
                .post('/api/workouts')
                .send(newWorkout)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(newWorkout.user_id)
                    expect(res.body.contest_id).to.eql(newWorkout.contest_id)
                    expect(res.body.category).to.eql(newWorkout.category)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/workouts/id/${postRes.body.id}`)
                        .expect([postRes.body])
                    )
        })
    })

    const requiredFields = [ 'user_id', 'contest_id', 'category' ]
    requiredFields.forEach(field => {
        const newWorkout = {
            contest_id: 1,
            user_id: 4,
            category: 'cardio'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newWorkout[field]

        return supertest(app)
        .post('/api/workouts')
        .send(newWorkout)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/workouts/id/:id', () => {

    context('Given no workouts', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .delete(`/api/workouts/id/${id}`)
                .expect(404, {
                    error: { message: `Workout does not exist` }
                })
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('responds with 204 and removes the workout', () => {
            const IdToRemove = 1
            const expectedWorkouts = testWorkouts.filter(workout => workout.id !== IdToRemove)
            return supertest(app)
                .delete(`/api/workouts/id/${IdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/workouts')
                        .expect(expectedWorkouts)
                )
        })
    })
})

describe('PATCH /api/workouts/id/:id', () => {
    context('Given no workouts', () => {
        it('resonds with 404', () => {
            const id = 123456
            return supertest(app)
                .patch(`/api/workouts/id/${id}`)
                .expect(404, { error: { message: `Workout does not exist` } })
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 204 and updates the workout', () => {
            const IdToUpdate = 2
            const updatedWorkout = {
                contest_id: 1,
                user_id: 2,
                category: 'strength'
            }
            const expectedWorkout = {
                ...testWorkouts[IdToUpdate -1],
                ...updatedWorkout
            }
            return supertest(app)
                .patch(`/api/workouts/id/${IdToUpdate}`)
                .send(updatedWorkout)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/workouts/id/${IdToUpdate}`)
                        .expect([expectedWorkout])
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/workouts/id/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'user_id', 'contest_id', or 'category'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedWorkout = {
                contest_id: 1,
                user_id: 3,
                category: 'strength',
            }
            const expectedWorkout = {
                ...testWorkouts[idToUpdate -1],
                ...updatedWorkout
            }

            return supertest(app)
                .patch(`/api/workouts/id/${idToUpdate}`)
                .send({
                    ...updatedWorkout,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/workouts/id/${idToUpdate}`)
                        .expect([expectedWorkout])
                )
        })
    })
})

describe('GET /api/workouts/getWorkoutData', () => {
    context('Given no workouts', () => {
        it('responds with 200 and and empty array', () => {
            const user_id = 99999
            const contest_id = 123
            const category = 'cardio'
            return supertest(app)
                .get(`/api/workouts/getWorkoutData`)
                .query({user_id: user_id, contest_id: contest_id, category: category})
                .expect(200, [])
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 200 and the expected workouts', () => {
            const user_id = 2
            const contest_id = 1
            const category = 'cardio'
            return supertest(app)
                .get(`/api/workouts/getWorkoutData`)
                .query({user_id: user_id, contest_id: contest_id, category: category})
                .expect(200)
        })
        
    })
})

describe('GET /api/workouts/getDates', () => {
    context('Given no workouts', () => {
        it('responds with 404', () => {
            const user_id = 99999
            const contest_id = 123
            return supertest(app)
                .get(`/api/workouts/getDates`)
                .query({user_id: user_id, contest_id: contest_id})
                .expect(404, { error: { message: `Workouts do not exist` } })
        })
    })

    context('Given there are workouts in the database', () => {
        const testWorkouts = makeWorkoutArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert workouts', () => {
            return db
                .into('workout_tracking')
                .insert(testWorkouts)
        })

        it('Responds with 200 and the expected workouts', () => {
            const user_id = 1
            const contest_id = 1
            return supertest(app)
                .get(`/api/workouts/getDates`)
                .query({user_id: user_id, contest_id: contest_id})
                .expect(200)
        })
        
    })
})