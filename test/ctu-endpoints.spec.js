const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeContestUsersArray } = require('./ctu.fixtures')
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
    db('contest_to_user').delete()
})

afterEach('cleanup', () => {
    db('users').delete()
    db('contests').delete()
    db('contest_to_user').delete()
})

describe('GET /api/contesttouser', function() {
    context('Given no contest-users', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/contesttouser')
                .expect(200, [])
        })
    })

    context('Given that there are contest-users in the database', () => {
        const testContestUsers = makeContestUsersArray()
        const testUsers = makeUsersArray()
        const testContests = makeContestsArray()

        beforeEach('insert contest-users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })
        beforeEach('insert contest-users', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
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

describe('GET /api/contesttouser/userId/:user_id', () => {
    context('Given no contestUsers', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .get(`/api/contesttouser/userId/${user_id}`)
                .expect(404, { error: { message: `ContestUser doesn't exist` } })
        })
    })

    context('Given there are contestUsers in the database', () => {
        const testContestUsers = makeContestUsersArray()
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
        beforeEach('insert contest-users', () => {
            return db
                .into('contest_to_user')
                .insert(testContestUsers)
        })

        it('Responds with 200 and the expected user', () => {
            const user_id = 2
            const expectedContestUser = testContestUsers[user_id -1]
            return supertest(app)
                .get(`/api/contesttouser/userId/${user_id}`)
                .expect(200, expectedContestUser)
        })
        
    })
})

describe('POST /api/contesttouser/', () => {
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

        it('create a contestUser, responding with 201 and the new contestUser', () => {
            const newContestUser = {
                user_id: 1,
                contest_id: 2
            }
            return supertest(app)
                .post('/api/contesttouser')
                .send(newContestUser)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(newContestUser.user_id)
                    expect(res.body.contest_id).to.eql(newContestUser.contest_id)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/contesttouser/userId/${postRes.body.user_id}`)
                        .expect(postRes.body)
                    )
        })
    })


    const requiredFields = ['user_id', 'contest_id']
    requiredFields.forEach(field => {
        const newContestUser = {
            user_id: 1,
            contest_id: 2
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newContestUser[field]

        return supertest(app)
        .post('/api/contesttouser')
        .send(newContestUser)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/contesttouser/userId/:user_id', () => {

    context('Given no contestUsers', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .delete(`/api/contesttouser/userId/${user_id}`)
                .expect(404, {
                    error: { message: `ContestUser doesn't exist` }
                })
        })
    })

    context('Given there are contestUsers in the database', () => {
        const testContestUsers = makeContestUsersArray()
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
        beforeEach('insert contest-users', () => {
            return db
                .into('contest_to_user')
                .insert(testContestUsers)
        })

        it('responds with 204 and removes the contestUser', () => {
            const userIdToRemove = 1
            const expectedContestUsers = testContestUsers.filter(contestUser => contestUser.user_id !== userIdToRemove)
            return supertest(app)
                .delete(`/api/contesttouser/userId/${userIdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/contesttouser')
                        .expect(expectedContestUsers)
                )
        })
    })
})

describe('PATCH /api/contesttouser/userId/:user_id', () => {
    context('Given no contestUsers', () => {
        it('resonds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .patch(`/api/contesttouser/userId/${user_id}`)
                .expect(404, { error: { message: `ContestUser doesn't exist` } })
        })
    })

    context('Given there are contestUsers in the database', () => {
        const testContestUsers = makeContestUsersArray()
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
        beforeEach('insert contest-users', () => {
            return db
                .into('contest_to_user')
                .insert(testContestUsers)
        })

        it('Responds with 204 and updates the article', () => {
            const userIdToUpdate = 2
            const updatedContestUser = {
                user_id: 2,
                contest_id: 3
            }
            const expectedContestUser = {
                ...testContestUsers[userIdToUpdate -1],
                ...updatedContestUser
            }
            return supertest(app)
                .patch(`/api/contesttouser/userId/${userIdToUpdate}`)
                .send(updatedContestUser)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/contesttouser/userId/${userIdToUpdate}`)
                        .expect(expectedContestUser)
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/contesttouser/userId/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'user_id' or 'contest_id'`
                    }
                })
        })
    })
})

describe('GET /api/contesttouser/contestId/:contest_id', () => {
    context('Given no contestUsers', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            return supertest(app)
                .get(`/api/contesttouser/contestId/${contest_id}`)
                .expect(404, { error: { message: `ContestUser doesn't exist` } })
        })
    })

    context('Given there are contestUsers in the database', () => {
        const testContestUsers = makeContestUsersArray()
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
        beforeEach('insert contest-users', () => {
            return db
                .into('contest_to_user')
                .insert(testContestUsers)
        })

        it('Responds with 200 and the expected contestUser', () => {
            const contest_id = 1
            const expectedContestUser = testContestUsers[contest_id -1]
            return supertest(app)
                .get(`/api/contesttouser/contestId/${contest_id}`)
                .expect(200, expectedContestUser)
        })
        
    })
})