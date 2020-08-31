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

let authToken;

beforeEach('register and login', () => {
    return true;
    /*supertest.post('/api/users',{body:{username:testUsers[0].username, password:testUsers[0].password}})
        .then(res=>{
            supertest.post('/api/auth/login',{body:{username:testUsers[0].username, password:testUsers[0].password}})
            .then(res2=>res2.json())
            .then(resJson=>{
                authToken = resJson.body.authToken;
            })
        })*/
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
                //.set('headers',{Authorization:`Bearer ${authToken}`})
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

describe('GET /api/points/userId/:user_id', () => {
    context('Given no points', () => {
        it('responds with 404', () => {
            const user_id = 99999
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

describe('GET /api/points/contestId/:contest_id', () => {
    context('Given no points', () => {
        it('responds with 404', () => {
            const contest_id = 99999
            return supertest(app)
                .get(`/api/points/contestId/${contest_id}`)
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
            const contest_id = 1
            const expectedPoints = testPoints.filter(contest => contest.contest_id === contest_id)
            return supertest(app)
                .get(`/api/points/contestId/${contest_id}`)
                .expect(200, expectedPoints)
        })
        
    })
})

describe('GET /api/points/id/:id', () => {
    context('Given no points', () => {
        it('responds with 404', () => {
            const id = 99999
            return supertest(app)
                .get(`/api/points/id/${id}`)
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
            const id = 1
            const expectedPoints = testPoints.filter(points => points.id === id)
            return supertest(app)
                .get(`/api/points/id/${id}`)
                .expect(200, expectedPoints)
        })
        
    })
})

describe('POST /api/points/', () => {
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

        it('create points, responding with 201 and the new points', () => {
            const newPoints = {
                user_id: 1,
                contest_id: 1,
                points: 3,
                category: 'weight',
                description: '',
                win_id: 1
            }
            return supertest(app)
                .post('/api/points')
                .send(newPoints)
                .expect(201)
                .expect(res => {
                    expect(res.body.user_id).to.eql(newPoints.user_id)
                    expect(res.body.contest_id).to.eql(newPoints.contest_id)
                    expect(res.body.points).to.eql(newPoints.points)
                    expect(res.body.category).to.eql(newPoints.category)
                    expect(res.body.description).to.eql(newPoints.description)
                    expect(res.body.win_id).to.eql(newPoints.win_id)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/points/id/${postRes.body.id}`)
                        .expect([postRes.body])
                    )
        })
    })

    const requiredFields = [ 'user_id', 'contest_id', 'points', 'category', 'description', 'win_id' ]
    requiredFields.forEach(field => {
        const newPoints = {
            user_id: 4,
            contest_id: 1,
            points: 3,
            category: 'stomach',
            description: 'winner',
            win_id: 2
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newPoints[field]

        return supertest(app)
        .post('/api/points')
        .send(newPoints)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/points/id/:id', () => {

    context('Given no points', () => {
        it('responds with 404', () => {
            const id = 123456
            return supertest(app)
                .delete(`/api/points/id/${id}`)
                .expect(404, {
                    error: { message: `Points do not exist` }
                })
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

        it('responds with 204 and removes the points', () => {
            const IdToRemove = 1
            const expectedPoints = testPoints.filter(points => points.id !== IdToRemove)
            return supertest(app)
                .delete(`/api/points/id/${IdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/points')
                        .expect(expectedPoints)
                )
        })
    })
})

describe('PATCH /api/points/id/:id', () => {
    context('Given no points', () => {
        it('resonds with 404', () => {
            const id = 123456
            return supertest(app)
                .patch(`/api/points/id/${id}`)
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

        it('Responds with 204 and updates the points', () => {
            const IdToUpdate = 2
            const updatedPoints = {
                user_id: 2,
                contest_id: 1,
                points: 4,
                category: 'stomach',
                description: 'testy stuff',
                win_id: 2
            }
            const expectedPoints = {
                ...testPoints[IdToUpdate -1],
                ...updatedPoints
            }
            return supertest(app)
                .patch(`/api/points/id/${IdToUpdate}`)
                .send(updatedPoints)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/points/id/${IdToUpdate}`)
                        .expect([expectedPoints])
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/points/id/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'user_id', 'contest_id', 'points', 'category', 'description', or 'win_id'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedPoints = {
                user_id: 2,
                contest_id: 1,
                points: 2,
                category: 'workout',
                description: 'more test stuff',
                win_id: 3
            }
            const expectedPoints = {
                ...testPoints[idToUpdate -1],
                ...updatedPoints
            }

            return supertest(app)
                .patch(`/api/points/id/${idToUpdate}`)
                .send({
                    ...updatedPoints,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/points/id/${idToUpdate}`)
                        .expect([expectedPoints])
                )
        })
    })
})

describe.only('GET /api/points/totalUserPoints', () => {
    context('Given no points', () => {
        it('responds with 404', () => {
            const contest_id = 99999
            const user_id = 1234
            return supertest(app)
                .get(`/api/points/totalUserPoints`)
                .query({ user_id, contest_id })
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
            const contest_id = 1
            const user_id = 1
            return supertest(app)
                .get(`/api/points/totalUserPoints`)
                .query({ user_id, contest_id })
                .expect(200, '[{"sum":"18"}]')
        })
        
    })
})