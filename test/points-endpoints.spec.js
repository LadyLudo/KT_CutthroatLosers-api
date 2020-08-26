const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makePointsArray } = require('./points.fixtures')
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
    db('points').delete()
})

afterEach('cleanup', () => {
    db('users').delete()
    db('contests').delete()
    db('points').delete()
})

describe('GET /api/points', function() {
    context('Given no points', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/points')
                .expect(200, [])
        })
    })

    context('Given that there are points in the database', () => {
        const testPoints = makePointsArray()
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
        beforeEach('insert points', () => {
            return db
                .into('points')
                .insert(testPoints)
        })

        it('Responds with 200 and all of the points', () => {
            return supertest(app)
                .get('/api/points')
                .expect(200, testPoints)
        })

        
    })
})

describe.only('GET /api/points/userId/:user_id', () => {
    context('Given no points', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .get(`/api/points/userId/${user_id}`)
                .expect(404, { error: { message: `Points do not exist` } })
        })
    })

    context('Given there are points in the database', () => {
        const testPoints = makePointsArray()
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
        beforeEach('insert points', () => {
            return db
                .into('points')
                .insert(testPoints)
        })

        it('Responds with 200 and the expected points', () => {
            const user_id = 1
            const expectedPoints = testPoints.filter(user => user.user_id === user_id)
            return supertest(app)
                .get(`/api/points/userId/${user_id}`)
                .expect(200, expectedPoints)
        })
        
    })
})
