const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeWinsArray } = require('./win.fixtures')
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
    db('contests').delete()
    db('win').delete()
})

afterEach('cleanup', () => {
    db('contests').delete()
    db('win').delete()
})

describe('GET /api/wins', function() {
    context('Given no wins', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/wins')
                .expect(200, [])
        })
    })

    context('Given that there are wins in the database', () => {
        const testWins = makeWinsArray()
        const testContests = makeContestsArray()

        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert wins', () => {
            return db
                .into('win')
                .insert(testWins)
        })

        it('Responds with 200 and all of the wins', () => {
            return supertest(app)
                .get('/api/wins')
                .expect(200, testWins)
        })

        
    })
})

describe('GET /api/wins/winId/:win_id', () => {
    context('Given no wins', () => {
        it('responds with 404', () => {
            const user_id = 99999
            return supertest(app)
                .get(`/api/points/userId/${user_id}`)
                .expect(404, { error: { message: `Points do not exist` } })
        })
    })

    context('Given there are wins in the database', () => {
        const testWins = makeWinsArray()
        const testContests = makeContestsArray()

        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert wins', () => {
            return db
                .into('win')
                .insert(testWins)
        })

        it('Responds with 200 and the expected wins', () => {
            const win_id = 1
            const expectedWin = testWins.filter(wins => wins.win_id === win_id)
            return supertest(app)
                .get(`/api/wins/winId/${win_id}`)
                .expect(200, expectedWin)
        })
        
    })
})

describe('POST /api/wins/', () => {
    context('Given that there are contests in the database', () => {
        const testContests = makeContestsArray()

        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })

        it('create win, responding with 201 and the new win', () => {
            const newWin = {
                win: 'weight',
                contest_id: 1
            }
            return supertest(app)
                .post('/api/wins')
                .send(newWin)
                .expect(201)
                .expect(res => {
                    expect(res.body.win).to.eql(newWin.win)
                    expect(res.body.contest_id).to.eql(newWin.contest_id)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/wins/winId/${postRes.body.win_id}`)
                        .expect([postRes.body])
                    )
        })
    })

    const requiredFields = [ 'win', 'contest_id' ]
    requiredFields.forEach(field => {
        const newWin = {
            win: 2,
            contest_id: 1
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newWin[field]

        return supertest(app)
        .post('/api/wins')
        .send(newWin)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/wins/winId/:win_id', () => {

    context('Given no wins', () => {
        it('responds with 404', () => {
            const win_id = 123456
            return supertest(app)
                .delete(`/api/wins/winId/${win_id}`)
                .expect(404, {
                    error: { message: `Win does not exist` }
                })
        })
    })

    context('Given there are wins in the database', () => {
        const testWins = makeWinsArray()
        const testContests = makeContestsArray()

        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert wins', () => {
            return db
                .into('win')
                .insert(testWins)
        })

        it('responds with 204 and removes the wins', () => {
            const IdToRemove = 1
            const expectedWins = testWins.filter(wins => wins.win_id !== IdToRemove)
            return supertest(app)
                .delete(`/api/wins/winId/${IdToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/wins')
                        .expect(expectedWins)
                )
        })
    })
})

describe('PATCH /api/wins/winId/:win_id', () => {
    context('Given no wins', () => {
        it('resonds with 404', () => {
            const win_id = 123456
            return supertest(app)
                .patch(`/api/wins/winId/${win_id}`)
                .expect(404, { error: { message: `Win does not exist` } })
        })
    })

    context('Given there are wins in the database', () => {
        const testWins = makeWinsArray()
        const testContests = makeContestsArray()

        beforeEach('insert contests', () => {
            return db
                .into('contests')
                .insert(testContests)
        })
        beforeEach('insert wins', () => {
            return db
                .into('win')
                .insert(testWins)
        })

        it('Responds with 204 and updates the win', () => {
            const IdToUpdate = 2
            const updatedWin = {
                win: 'workout',
                contest_id: 1
            }
            const expectedWin = {
                ...testWins[IdToUpdate -1],
                ...updatedWin
            }
            return supertest(app)
                .patch(`/api/wins/winId/${IdToUpdate}`)
                .send(updatedWin)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/wins/winId/${IdToUpdate}`)
                        .expect([expectedWin])
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/wins/winId/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'win' or 'contest_id'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedWin = {
                win: 'workout',
                contest_id: 1
            }
            const expectedWin = {
                ...testWins[idToUpdate -1],
                ...updatedWin
            }

            return supertest(app)
                .patch(`/api/wins/winId/${idToUpdate}`)
                .send({
                    ...updatedWin,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/wins/winId/${idToUpdate}`)
                        .expect([expectedWin])
                )
        })
    })
})