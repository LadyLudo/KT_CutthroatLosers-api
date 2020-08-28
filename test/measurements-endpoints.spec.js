const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeMeasurementsArray } = require('./measurements.fixtures')
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
    db('measurements').delete()
})

afterEach('cleanup', () => {
    db('users').delete()
    db('contests').delete()
    db('measurements').delete()
})

describe('GET /api/measurements', function() {
    context('Given no measurements', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/measurements')
                .expect(200, [])
        })
    })

    context('Given that there are measurements in the database', () => {
        const testMeasurements = makeMeasurementsArray()
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
        beforeEach('insert measurements', () => {
            return db
                .into('measurements')
                .insert(testMeasurements)
        })

        it('Responds with 200 and all of the measurements', () => {
            return supertest(app)
                .get('/api/measurements')
                .expect(200, testMeasurements)
        })

        
    })
})

describe('GET /api/measurements/userId/:user_id', () => {
    context('Given no measurements', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .get(`/api/measurements/userId/${user_id}`)
                .expect(404, { error: { message: `Measurements do not exist` } })
        })
    })

    context('Given there are measurements in the database', () => {
        const testMeasurements = makeMeasurementsArray()
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
        beforeEach('insert measurements', () => {
            return db
                .into('measurements')
                .insert(testMeasurements)
        })

        it('Responds with 200 and the expected measurement', () => {
            const user_id = 2
            const expectedMeasurement = testMeasurements.filter(measurement => measurement.user_id === user_id)
            return supertest(app)
                .get(`/api/measurements/userId/${user_id}`)
                .expect(200, expectedMeasurement)
        })
        
    })
})

describe('GET /api/measurements/contestId/:contest_id', () => {
    context('Given no measurements', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            return supertest(app)
                .get(`/api/measurements/contestId/${contest_id}`)
                .expect(404, { error: { message: `Measurements do not exist` } })
        })
    })

    context('Given there are measurements in the database', () => {
        const testMeasurements = makeMeasurementsArray()
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
        beforeEach('insert measurements', () => {
            return db
                .into('measurements')
                .insert(testMeasurements)
        })

        it('Responds with 200 and the expected measurement', () => {
            const contest_id = 1
            const expectedMeasurement = testMeasurements.filter(measurement => measurement.contest_id === contest_id)
            return supertest(app)
                .get(`/api/measurements/contestId/${contest_id}`)
                .expect(200, expectedMeasurement)
        })
        
    })
})

describe('POST /api/measurements/', () => {
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

        it('create measurement, responding with 201 and the new measurement', () => {
            const newMeasurement = {
                user_id: 1,
                contest_id: 1,
                measurement: '44'
            }
            return supertest(app)
                .post('/api/measurements')
                .send(newMeasurement)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(newMeasurement.user_id)
                    expect(res.body.contest_id).to.eql(newMeasurement.contest_id)
                    expect(res.body.measurement).to.eql(newMeasurement.measurement)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/measurements/userId/${postRes.body.user_id}`)
                        .expect([postRes.body])
                    )
        })
    })


    const requiredFields = [ 'user_id', 'contest_id', 'measurement' ]
    requiredFields.forEach(field => {
        const newMeasurement = {
            user_id: 4,
            contest_id: 1,
            measurement: '44'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newMeasurement[field]

        return supertest(app)
        .post('/api/measurements')
        .send(newMeasurement)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('GET /api/measurements/id/:id', () => {
    context('Given no measurements', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .get(`/api/measurements/id/${id}`)
                .expect(404, { error: { message: `Measurements do not exist` } })
        })
    })

    context('Given there are measurements in the database', () => {
        const testMeasurements = makeMeasurementsArray()
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
        beforeEach('insert measurements', () => {
            return db
                .into('measurements')
                .insert(testMeasurements)
        })

        it('Responds with 200 and the expected measurement', () => {
            const id = 1
            const expectedMeasurement = testMeasurements[id -1]
            return supertest(app)
                .get(`/api/measurements/id/${id}`)
                .expect(200, expectedMeasurement)
        })
        
    })
})

describe('DELETE /api/measurements/id/:id', () => {

    context('Given no measurements', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .delete(`/api/measurements/id/${id}`)
                .expect(404, {
                    error: { message: `Measurements do not exist` }
                })
        })
    })

    context('Given there are measurements in the database', () => {
        const testMeasurements = makeMeasurementsArray()
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
        beforeEach('insert measurements', () => {
            return db
                .into('measurements')
                .insert(testMeasurements)
        })

        it('responds with 204 and removes the measurement', () => {
            const IdToRemove = 1
            const expectedMeasurements = testMeasurements.filter(measurements => measurements.id !== IdToRemove)
            return supertest(app)
                .delete(`/api/measurements/id/${IdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/measurements')
                        .expect(expectedMeasurements)
                )
        })
    })
})

describe('PATCH /api/measurements/id/:id', () => {
    context('Given no measurements', () => {
        it('resonds with 404', () => {
            const id = 123456
            return supertest(app)
                .patch(`/api/measurements/id/${id}`)
                .expect(404, { error: { message: `Measurements do not exist` } })
        })
    })

    context('Given there are measurements in the database', () => {
        const testMeasurements = makeMeasurementsArray()
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
        beforeEach('insert measurements', () => {
            return db
                .into('measurements')
                .insert(testMeasurements)
        })

        it('Responds with 204 and updates the measurement', () => {
            const IdToUpdate = 2
            const updatedMeasurement = {
                user_id: 2,
                contest_id: 1,
                measurement: '44'
            }
            const expectedMeasurement = {
                ...testMeasurements[IdToUpdate -1],
                ...updatedMeasurement
            }
            return supertest(app)
                .patch(`/api/measurements/id/${IdToUpdate}`)
                .send(updatedMeasurement)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/measurements/id/${IdToUpdate}`)
                        .expect(expectedMeasurement)
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/measurements/id/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'user_id', 'contest_id', or 'measurement'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedMeasurement = {
                user_id: 2,
                contest_id: 1,
                measurement: '44'
            }
            const expectedMeasurement = {
                ...testMeasurements[idToUpdate -1],
                ...updatedMeasurement
            }

            return supertest(app)
                .patch(`/api/measurements/id/${idToUpdate}`)
                .send({
                    ...updatedMeasurement,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/measurements/id/${idToUpdate}`)
                        .expect(expectedMeasurement)
                )
        })
    })
})