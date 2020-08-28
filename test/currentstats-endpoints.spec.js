const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeCurrentStatsArray } = require('./currentstats.fixtures')
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
    db('current_stats').delete()
})

afterEach('cleanup', () => {
    db('users').delete()
    db('contests').delete()
    db('current_stats').delete()
})

describe('GET /api/currentstats', function() {
    context('Given no currentstats', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/currentstats')
                .expect(200, [])
        })
    })

    context('Given that there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 200 and all of the currentstats', () => {
            return supertest(app)
                .get('/api/currentstats')
                .expect(200, testCurrentStats)
        })

        
    })
})

describe('GET /api/currentstats/contests', function() {
    context('Given no currentstats', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/currentstats/contests')
                .expect(200, [])
        })
    })

    context('Given that there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 200 and all of the currentstats', () => {
            return supertest(app)
                .get('/api/currentstats/contests')
                .expect(200, testCurrentStats)
        })

        
    })
})

describe('GET /api/currentstats/userId/:user_id', () => {
    context('Given no currentstats', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .get(`/api/currentstats/userId/${user_id}`)
                .expect(404, { error: { message: `CurrentStats doesn't exist` } })
        })
    })

    context('Given there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 200 and the expected user', () => {
            const user_id = 2
            const expectedCurrentStats = testCurrentStats.filter(currentStats => currentStats.user_id === user_id)
            return supertest(app)
                .get(`/api/currentstats/userId/${user_id}`)
                .expect(200, expectedCurrentStats)
        })
        
    })
})

describe('GET /api/currentstats/contestId/:contest_id', () => {
    context('Given no currentstats', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            return supertest(app)
                .get(`/api/currentstats/contestId/${contest_id}`)
                .expect(404, { error: { message: `CurrentStats doesn't exist` } })
        })
    })

    context('Given there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 200 and the expected contest', () => {
            const contest_id = 1
            const expectedCurrentStats = testCurrentStats.filter(currentstats => currentstats.contest_id === contest_id)
            return supertest(app)
                .get(`/api/currentstats/contestId/${contest_id}`)
                .expect(200, expectedCurrentStats)
        })
        
    })
})

describe('POST /api/currentstats/', () => {
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

        it('create currentstats, responding with 201 and the new currentstats', () => {
            const newCurrentStats = {
                user_id: 1,
                current_weight: "123",
                goal_weight: '123',
                display_name: "John Test",
                contest_id: 2
            }
            return supertest(app)
                .post('/api/currentstats')
                .send(newCurrentStats)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(newCurrentStats.user_id)
                    expect(res.body.current_weight).to.eql(newCurrentStats.current_weight)
                    expect(res.body.goal_weight).to.eql(newCurrentStats.goal_weight)
                    expect(res.body.display_name).to.eql(newCurrentStats.display_name)
                    expect(res.body.contest_id).to.eql(newCurrentStats.contest_id)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/currentstats/userId/${postRes.body.user_id}`)
                        .expect([postRes.body])
                    )
        })
    })


    const requiredFields = ['user_id', 'current_weight', 'goal_weight', 'display_name', 'contest_id']
    requiredFields.forEach(field => {
        const newCurrentStats = {
            user_id: 4,
            current_weight: '123',
            goal_weight: '123',
            display_name: 'John Test',
            contest_id: 1
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newCurrentStats[field]

        return supertest(app)
        .post('/api/currentstats')
        .send(newCurrentStats)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/currentstats/userId/:user_id', () => {

    context('Given no currentstats', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .delete(`/api/currentstats/userId/${user_id}`)
                .expect(404, {
                    error: { message: `CurrentStats doesn't exist` }
                })
        })
    })

    context('Given there are contestUsers in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('responds with 204 and removes the currentstats', () => {
            const userIdToRemove = 1
            const expectedCurrentStats = testCurrentStats.filter(currentstats => currentstats.user_id !== userIdToRemove)
            return supertest(app)
                .delete(`/api/currentstats/userId/${userIdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/currentstats')
                        .expect(expectedCurrentStats)
                )
        })
    })
})

describe('PATCH /api/currentstats/userId/:user_id', () => {
    context('Given no currentstats', () => {
        it('resonds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .patch(`/api/currentstats/userId/${user_id}`)
                .expect(404, { error: { message: `CurrentStats doesn't exist` } })
        })
    })

    context('Given there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 204 and updates the currentstats', () => {
            const userIdToUpdate = 2
            const updatedCurrentStats = {
                user_id: 2,
                current_weight: '123',
                goal_weight: '123',
                display_name: 'John Test Updated',
                contest_id: 1
            }
            const expectedCurrentStats = {
                ...testCurrentStats[userIdToUpdate -1],
                ...updatedCurrentStats
            }
            return supertest(app)
                .patch(`/api/currentstats/userId/${userIdToUpdate}`)
                .send(updatedCurrentStats)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/currentstats/userId/${userIdToUpdate}`)
                        .expect([expectedCurrentStats])
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/currentstats/userId/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'user_id' 'current_weight', 'goal_weight', 'display_name', or 'contest_id'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedCurrentStats = {
                user_id: 2,
                current_weight: '124',
                goal_weight: '124',
                display_name: 'Johnny Test',
                contest_id: 1
            }
            const expectedCurrentStats = {
                ...testCurrentStats[idToUpdate -1],
                ...updatedCurrentStats
            }

            return supertest(app)
                .patch(`/api/currentstats/userId/${idToUpdate}`)
                .send({
                    ...updatedCurrentStats,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/currentstats/userId/${idToUpdate}`)
                        .expect([expectedCurrentStats])
                )
        })
    })
})

describe('GET /api/currentstats/contestUserId', () => {
    context('Given no currentstats', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            const user_id = 1234
            return supertest(app)
                .get(`/api/currentstats/contestUserId`)
                .query({user_id: user_id, contest_id: contest_id})
                .expect(404, { error: { message: `CurrentStats doesn't exist` } })
        })
    })

    context('Given there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 200 and the expected contest', () => {
            const contest_id = 1
            const user_id = 1
            const expectedCurrentStats = testCurrentStats.filter(currentstats => currentstats.contest_id === contest_id && currentstats.user_id === user_id)
            return supertest(app)
                .get(`/api/currentstats/contestUserId`)
                .query({user_id: user_id, contest_id: contest_id})
                .expect(200, expectedCurrentStats)
        })
        
    })
})

describe.only('GET /api/currentstats/contestUserId/displayname', () => {
    context('Given no currentstats', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            const user_id = 1234
            return supertest(app)
                .get(`/api/currentstats/contestUserId/displayname`)
                .query({user_id: user_id, contest_id: contest_id})
                .expect(404, { error: { message: `CurrentStats doesn't exist` } })
        })
    })

    context('Given there are currentstats in the database', () => {
        const testCurrentStats = makeCurrentStatsArray()
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
        beforeEach('insert currentstats', () => {
            return db
                .into('current_stats')
                .insert(testCurrentStats)
        })

        it('Responds with 200 and the expected contest', () => {
            const contest_id = 1
            const user_id = 1
            const expectedCurrentStats = testCurrentStats.filter(currentstats => currentstats.contest_id === contest_id && currentstats.user_id === user_id)
            return supertest(app)
                .get(`/api/currentstats/contestUserId/displayname`)
                .query({user_id: user_id, contest_id: contest_id})
                .expect(200, `"${expectedCurrentStats[0].display_name}"`)
        })
        
    })
})