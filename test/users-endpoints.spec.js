const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const { makeUsersArray } = require('./users.fixtures')


    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('users').delete())

    afterEach('cleanup', () => db('users').delete())

describe('GET /api/users', function() {
    context('Given no users', () => {
        it('responds with 200 and an empty list', () => {
            return supertest(app)
                .get('/api/users')
                .expect(200, [])
        })
    })

    context('Given that there are users in the database', () => {
        const testUsers = makeUsersArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and all of the users', () => {
            return supertest(app)
                .get('/api/users')
                .expect(200, testUsers)
        })

        
    })
})

describe('GET /api/users/:user_id', () => {
    context('Given no users', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .get(`/api/users/${user_id}`)
                .expect(404, { error: { message: `User doesn't exist` } })
        })
    })

    context('Given there are users in the database', () => {
        const testUsers = makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and the expected user', () => {
            const user_id = 2
            const expectedUser = testUsers[user_id -1]
            return supertest(app)
                .get(`/api/users/${user_id}`)
                .expect(200, expectedUser)
        })
        
    })
})

describe('POST /api/users', () => {
    it('create a user, responding with 201 and the new user', () => {
        const newUser = {
            password: 'test123',
            display_name: 'John Test',
            username: 'john@gmail.com'
        }
        return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect(res => {
                expect(res.body.password).to.eql(newUser.password)
                expect(res.body.display_name).to.eql(newUser.display_name)
                expect(res.body.username).to.eql(newUser.username)
            })
            .then(postRes => 
                supertest(app)
                    .get(`/api/users/${postRes.body.user_id}`)
                    .expect(postRes.body)
                )
    })

    const requiredFields = ['password', 'display_name', 'username']
    requiredFields.forEach(field => {
        const newUser = {
            password: 'test123',
            display_name: 'John Test',
            username: 'john@gmail.com'
        }
        
    it(`responds with 400 and an error when the ${field} is missing in the request body`, () => {
        delete newUser[field]

        return supertest(app)
        .post('/api/users')
        .send(newUser)
        .expect(400, {
            error: { message: `Missing '${field}' in request body`}
        })
    })
    })
    
})

describe('DELETE /api/users/:user_id', () => {

    context('Given no users', () => {
        it('responds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .delete(`/api/users/${user_id}`)
                .expect(404, {
                    error: { message: `User doesn't exist` }
                })
        })
    })

    context('Given there are users in the database', () => {
        const testUsers = makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('responds with 204 and removes the article', () => {
            const idToRemove = 2
            const expectedUsers = testUsers.filter(user => user.user_id !== idToRemove)
            return supertest(app)
                .delete(`/api/users/${idToRemove}`)
                .expect(204)
                .then(res =>
                    supertest(app)
                        .get('/api/users')
                        .expect(expectedUsers)
                )
        })
    })
})

describe('PATCH /api/users/:user_id', () => {
    context('Given no users', () => {
        it('resonds with 404', () => {
            const user_id = 123456
            return supertest(app)
                .patch(`/api/users/${user_id}`)
                .expect(404, { error: { message: `User doesn't exist` } })
        })
    })

    context('Given there are users in the database', () => {
        const testUsers = makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 204 and updates the article', () => {
            const idToUpdate = 2
            const updatedUser = {
                password: 'updatedtest123',
                display_name: 'John Test Jr.',
                username: 'johnjr@gmail.com'
            }
            const expectedUser = {
                ...testUsers[idToUpdate -1],
                ...updatedUser
            }
            return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send(updatedUser)
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/users/${idToUpdate}`)
                        .expect(expectedUser)
                )
        })

        it('Responds with 400 when no required fields supplied', () => {
            const idToUpdate = 2
            return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                        message: `Request body must contain either 'password', 'display_name', or 'username'`
                    }
                })
        })

        it('Responds with 204 when updating only a subset of fields', () => {
            const idToUpdate = 2
            const updatedUser = {
                password: 'updatedtest123',
            }
            const expectedUser = {
                ...testUsers[idToUpdate -1],
                ...updatedUser
            }

            return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send({
                    ...updatedUser,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res => 
                    supertest(app)
                        .get(`/api/users/${idToUpdate}`)
                        .expect(expectedUser)
                )
        })
    })
})

describe('GET /api/users/searchByUsername/:username', () => {
    context('Given no users', () => {
        it('responds with 200 and an empty array', () => {
            const username = 'stephen@gmail.com'
            return supertest(app)
                .get(`/api/users/searchByUsername/${username}`)
                .expect(200, '')
        })
    })

    context('Given there are users in the database', () => {
        const testUsers = makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and the expected user', () => {
            const username = 'john@gmail.com'
            const user_id = 1
            const expectedUser = testUsers[user_id -1]
            return supertest(app)
                .get(`/api/users/searchByUsername/${username}`)
                .expect(404, { error: { message: `User already exists` }})
        })
        
    })
})

describe('GET /api/users/userAuth', () => {
    context('Given no users', () => {
        it('responds with 404', () => {
            const user_name = 'testusername@gmail.com'
            const password = 'testpassword'
            return supertest(app)
                .get(`/api/users/login/userAuth`)
                .query({ username : user_name, password: password })
                .expect(404, { error: { message: `User doesn't exist` } })
        })
    })

    context('Given there are users in the database', () => {
        const testUsers = makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and the expected user', () => {
            const username = 'john@gmail.com'
            const password = 'test123'
            const expectedUser = testUsers[0]
            return supertest(app)
                .get(`/api/users/login/userAuth`)
                .query({ username: username, password: password})
                .expect(200)
        })

        it('Responds with 200 and the message if passwords do not match', () => {
            const username = 'john@gmail.com'
            const password = 'te123'
            return supertest(app)
                .get(`/api/users/login/userAuth`)
                .query({ username: username, password: password})
                .expect(200, 'password does not match')
        })
        
    })
})

describe('GET /api/adminPage/all', function() {
    context('Given no users', () => {
        it('responds with 404 and an error', () => {
            return supertest(app)
                .get('/api/users/adminPage/all')
                .expect(404, {
                    error: { message: `Users do not exist` }
                })
        })
    })

    context('Given that there are users in the database', () => {
        const testUsers = makeUsersArray()

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and all of the users', () => {
            return supertest(app)
                .get('/api/users/adminPage/all')
                .expect(200)
        })

        
    })
})

describe('GET /api/users/searchByUsername/getId/:username', () => {
    context('Given no users', () => {
        it('responds with 404', () => {
            const username = 'stephen@gmail.com'
            return supertest(app)
                .get(`/api/users/searchByUsername/getId/${username}`)
                .expect(404, { error: { message: `User doesn't exist` } })
        })
    })

    context('Given there are users in the database', () => {
        const testUsers = makeUsersArray()
        
        beforeEach('insert users', () => {
            return db  
                .into('users')
                .insert(testUsers)
        })

        it('Responds with 200 and the expected user', () => {
            const username = 'john@gmail.com'
            return supertest(app)
                .get(`/api/users/searchByUsername/getId/${username}`)
                .expect(200)
        })
        
    })
})