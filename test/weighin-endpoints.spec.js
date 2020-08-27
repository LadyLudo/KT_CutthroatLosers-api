const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeWeighinsArray } = require('./weighin.fixtures')
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
    db('weighin').delete()
})

afterEach('cleanup', () => {
    db('users').delete()
    db('contests').delete()
    db('weighin').delete()
})

describe('GET /api/weighins', function() {
    context('Given no weighins', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/weighins')
                .expect(200, [])
        })
    })

    context('Given that there are weighins in the database', () => {
        const testWeighins = makeWeighinsArray()
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
        beforeEach('insert weighins', () => {
            return db
                .into('weighin')
                .insert(testWeighins)
        })

        it('Responds with 200 and all of the weighins', () => {
            return supertest(app)
                .get('/api/weighins')
                .expect(200, testWeighins)
        })

        
    })
})

describe('GET /api/weighins/userId/:user_id', () => {
    context('Given no weighins', () => {
        it('responds with 404', () => {
            const user_id = 99999
            return supertest(app)
                .get(`/api/weighins/userId/${user_id}`)
                .expect(404, { error: { message: `Weighins do not exist` } })
        })
    })

    context('Given there are weighins in the database', () => {
        const testWeighins = makeWeighinsArray()
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
        beforeEach('insert weighins', () => {
            return db
                .into('weighin')
                .insert(testWeighins)
        })

        it('Responds with 200 and the expected weighins', () => {
            const user_id = 1
            const expectedWeighins = testWeighins.filter(weighin => weighin.user_id === user_id)
            return supertest(app)
                .get(`/api/weighins/userId/${user_id}`)
                .expect(200, expectedWeighins)
        })
        
    })
})

describe('GET /api/weighins/contestId/:contest_id', () => {
    context('Given no weighins', () => {
        it('responds with 404', () => {
            const contest_id = 99999
            return supertest(app)
                .get(`/api/weighins/contestId/${contest_id}`)
                .expect(404, { error: { message: `Weighins do not exist` } })
        })
    })

    context('Given there are weighins in the database', () => {
        const testWeighins = makeWeighinsArray()
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
        beforeEach('insert weighins', () => {
            return db
                .into('weighin')
                .insert(testWeighins)
        })

        it('Responds with 200 and the expected weighins', () => {
            const contest_id = 1
            const expectedWeighins = testWeighins.filter(weighin => weighin.contest_id === contest_id)
            return supertest(app)
                .get(`/api/weighins/contestId/${contest_id}`)
                .expect(200, expectedWeighins)
        })
        
    })
})

describe('GET /api/weighins/id/:id', () => {
    context('Given no weighins', () => {
        it('responds with 404', () => {
            const id = 99999
            return supertest(app)
                .get(`/api/weighins/id/${id}`)
                .expect(404, { error: { message: `Weighins do not exist` } })
        })
    })

    context('Given there are weighins in the database', () => {
        const testWeighins = makeWeighinsArray()
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
        beforeEach('insert weighins', () => {
            return db
                .into('weighin')
                .insert(testWeighins)
        })

        it('Responds with 200 and the expected weighins', () => {
            const id = 1
            const expectedWeighins = testWeighins.filter(weighin => weighin.id === id)
            return supertest(app)
                .get(`/api/weighins/id/${id}`)
                .expect(200, expectedWeighins)
        })
        
    })
})

describe('POST /api/weighins/', () => {
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

        it('create weighin, responding with 201 and the new weighin', () => {
            const newWeighin = {
                user_id: 1,
                contest_id: 1,
                weight: '123'
            }
            return supertest(app)
                .post('/api/weighins')
                .send(newWeighin)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(newWeighin.user_id)
                    expect(res.body.contest_id).to.eql(newWeighin.contest_id)
                    expect(res.body.weight).to.eql(newWeighin.weight)
                    
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/weighins/id/${postRes.body.id}`)
                        .expect([postRes.body])
                    )
        })
    })

    const requiredFields = [ 'user_id', 'contest_id', 'weight' ]
    requiredFields.forEach(field => {
        const newWeighin = {
            user_id: 4,
            contest_id: 1,
            weight: '123'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newWeighin[field]

        return supertest(app)
        .post('/api/weighins')
        .send(newWeighin)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/weighins/id/:id', () => {

    context('Given no weighins', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .delete(`/api/weighins/id/${id}`)
                .expect(404, {
                    error: { message: `Weighins do not exist` }
                })
        })
    })

    context('Given there are weighins in the database', () => {
        const testWeighins = makeWeighinsArray()
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
        beforeEach('insert weighins', () => {
            return db
                .into('weighin')
                .insert(testWeighins)
        })

        it('responds with 204 and removes the weighin', () => {
            const IdToRemove = 1
            const expectedWeighins = testWeighins.filter(weighin => weighin.id !== IdToRemove)
            return supertest(app)
                .delete(`/api/weighins/id/${IdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/weighins')
                        .expect(expectedWeighins)
                )
        })
    })
})

describe('PATCH /api/weighins/id/:id', () => {
    context('Given no weighins', () => {
        it('resonds with 404', () => {
            const id = 123456
            return supertest(app)
                .patch(`/api/weighins/id/${id}`)
                .expect(404, { error: { message: `Weighins do not exist` } })
        })
    })

    context('Given there are wieghins in the database', () => {
        const testWeighins = makeWeighinsArray()
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
        beforeEach('insert weighins', () => {
            return db
                .into('weighin')
                .insert(testWeighins)
        })

        it('Responds with 204 and updates the weighin', () => {
            const IdToUpdate = 2
            const updatedWeighin = {
                user_id: 2,
                contest_id: 1,
                weight: '124'
            }
            const expectedWeighin = {
                ...testWeighins[IdToUpdate -1],
                ...updatedWeighin
            }
            return supertest(app)
                .patch(`/api/weighins/id/${IdToUpdate}`)
                .send(updatedWeighin)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/weighins/id/${IdToUpdate}`)
                        .expect([expectedWeighin])
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/weighins/id/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'user_id', 'contest_id', or 'weight'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedWeighin = {
                user_id: 2,
                contest_id: 1,
                weight: '214'
            }
            const expectedWeighin = {
                ...testWeighins[idToUpdate -1],
                ...updatedWeighin
            }

            return supertest(app)
                .patch(`/api/weighins/id/${idToUpdate}`)
                .send({
                    ...updatedWeighin,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/weighins/id/${idToUpdate}`)
                        .expect([expectedWeighin])
                )
        })
    })
})