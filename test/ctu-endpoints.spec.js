const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeContestUsersArray } = require('./ctu.fixtures')

let db

before('make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
})

after('disconnect from db', () => db.destroy())

before('clean the table', () => db('contest_to_user').delete())

afterEach('cleanup', () => db('contest_to_user').delete())

describe.only('GET /api/contesttouser', function() {
    context('Given no contest-users', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/contesttouser')
                .expect(200, [])
        })
    })

    context('Given that there are contest-users in the database', () => {
        const testContestUsers = makeContestUsersArray()

        beforeEach('insert contest-users', () => {
            return db
                .into('contest_to_user')
                .insert(testContestUsers)
        })

        it('Responds with 200 and all of the contest-users', () => {
            return supertest(app)
                .get('/api/contesttouser')
                .expect(200, testContestUsers)
        })

        
    })
})