const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
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

before('clean the table', () => db('contests').delete())

afterEach('cleanup', () => db('contests').delete())

describe('GET /api/contests', function() {
    context('Given no contests', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/contests')
                .expect(200, [])
        })
    })

    context('Given that there are contests in the database', () => {
        const testContests = makeContestsArray()

        beforeEach('insert contests', () => {
            return db  
                .into('contests')
                .insert(testContests)
        })

        it('Reasponds with 200 and all of the contests', () => {
            return supertest(app)
                .get('/api/contests')
                .expect(200, testContests)
        })
    })
})

describe('GET /api/contests/:contest_id', () => {
    context('Given no contests', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            return supertest(app)
                .get(`/api/contests/${contest_id}`)
                .expect(404, { error: { message: `Contest doesn't exist` } })
        })
    })

    context('Given there are contests in the database', () => {
        const testContests = makeContestsArray()
        
        beforeEach('insert contests', () => {
            return db  
                .into('contests')
                .insert(testContests)
        })

        it('Responds with 200 and the expected contest', () => {
            const contest_id = 2
            const expectedContest = testContests[contest_id -1]
            return supertest(app)
                .get(`/api/contests/${contest_id}`)
                .expect(200, expectedContest)
        })
        
    })
})

describe('POST /api/contests', () => {
    it('creates a contest, responding with 201 and the new contest', () => {
        const newContest = {
            date_start: '2020-08-23T06:00:00.000Z',
            date_end: '2020-08-23T06:00:00.000Z',
            contest_name: 'test contest 5',
            weighin_day: 'Monday'
        }
        return supertest(app)
            .post('/api/contests')
            .send(newContest)
            .expect(201)
            .expect(res => {
                expect(res.body.date_start).to.eql(newContest.date_start)
                expect(res.body.date_end).to.eql(newContest.date_end)
                expect(res.body.contest_name).to.eql(newContest.contest_name)
                expect(res.body.weighin_day).to.eql(newContest.weighin_day)
            })
            .then(postRes => 
                supertest(app)
                    .get(`/api/contests/${postRes.body.contest_id}`)
                    .expect(postRes.body)
                )
    })

    const requiredFields = ['date_start', 'date_end', 'contest_name', 'weighin_day']
    requiredFields.forEach(field => {
        const newContest = {
            date_start: '2020-08-23T06:00:00.000Z',
            date_end: '2020-08-23T06:00:00.000Z',
            contest_name: 'test contest 6',
            weighin_day: 'Monday'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newContest[field]

        return supertest(app)
        .post('/api/contests')
        .send(newContest)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/contests/:contest_id', () => {

    context('Given no contests', () => {
        it('responds with 404', () => {
            const contest_id = 123456
            return supertest(app)
                .delete(`/api/contests/${contest_id}`)
                .expect(404, {
                    error: { message: `Contest doesn't exist` }
                })
        })
    })

    context('Given there are contests in the database', () => {
        const testContests = makeContestsArray()
        
        beforeEach('insert contests', () => {
            return db  
                .into('contests')
                .insert(testContests)
        })

        it('responds with 204 and removes the contest', () => {
            const idToRemove = 2
            const expectedContests = testContests.filter(contest => contest.contest_id !== idToRemove)
            return supertest(app)
                .delete(`/api/contests/${idToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/contests')
                        .expect(expectedContests)
                )
        })
    })
})

describe('PATCH /api/contests/:contest_id', () => {
    context('Given no contests', () => {
        it('resonds with 404', () => {
            const contest_id = 123456
            return supertest(app)
                .patch(`/api/contests/${contest_id}`)
                .expect(404, { error: { message: `Contest doesn't exist` } })
        })
    })

    context('Given there are contests in the database', () => {
        const testContests = makeContestsArray()
        
        beforeEach('insert contests', () => {
            return db  
                .into('contests')
                .insert(testContests)
        })

        it('Responds with 204 and updates the contest', () => {
            const idToUpdate = 2
            const updatedContest = {
                date_start: '2020-08-23T06:00:00.000Z',
                date_end: '2020-08-23T06:00:00.000Z',
                contest_name: 'test contest 7',
                weighin_day: 'Monday'
            }
            const expectedContest = {
                ...testContests[idToUpdate -1],
                ...updatedContest
            }
            return supertest(app)
                .patch(`/api/contests/${idToUpdate}`)
                .send(updatedContest)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/contests/${idToUpdate}`)
                        .expect(expectedContest)
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/contests/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'date_start', 'date_end', 'contest_name', or 'weighin_day'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedContest = {
                contest_name: 'updated contest name',
            }
            const expectedContest = {
                ...testContests[idToUpdate -1],
                ...updatedContest
            }

            return supertest(app)
                .patch(`/api/contests/${idToUpdate}`)
                .send({
                    ...updatedContest,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/contests/${idToUpdate}`)
                        .expect(expectedContest)
                )
        })
    })
})

describe('GET /api/contests/contestName/:contest_name', () => {
    context('Given no contests', () => {
        it('responds with 404', () => {
            const contest_name = 'faketestcontest'
            return supertest(app)
                .get(`/api/contests/contestName/${contest_name}`)
                .expect(404, { error: { message: `Contest doesn't exist` } })
        })
    })

    context('Given there are contests in the database', () => {
        const testContests = makeContestsArray()
        
        beforeEach('insert contests', () => {
            return db  
                .into('contests')
                .insert(testContests)
        })

        it('Responds with 200 and the expected contest', () => {
            const contest_name = 'test contest 2'
            const expectedContest = testContests.filter(contest => contest.contest_name === contest_name)
            return supertest(app)
                .get(`/api/contests/contestName/${contest_name}`)
                .expect(200, expectedContest)
        })
        
    })
})