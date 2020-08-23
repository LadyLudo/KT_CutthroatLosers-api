const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')

describe.only('Users Endpoints', function() {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('users').delete())

    afterEach('cleanup', () => db('users').delete())

    context('Given that there are users in the database', () => {
        const testUsers = [
            {
                user_id: 1,
                password: 'test123',
                display_name: 'John Test',
                date_created: '2020-08-23T00:00:00.000Z',
                username: 'john@gmail.com'
            },
            {
                user_id: 2,
                password: 'test123',
                display_name: 'Abby Test',
                date_created: '2020-08-23T00:00:00.000Z',
                username: 'abby@gmail.com'
            },
            {
                user_id: 3,
                password: 'test123',
                display_name: 'Matt Test',
                date_created: '2020-08-23T00:00:00.000Z',
                username: 'matt@gmail.com'
            },
            {
                user_id: 4,
                password: 'test123',
                display_name: 'Libby Test',
                date_created: '2020-08-23T00:00:00.000Z',
                username: 'libby@gmail.com'
            },
        ];

        beforeEach('insert users', () => {
            return db
                .into('users')
                .insert(testUsers)
        })

        it('GET /users responds with 200 and all of the users', () => {
            return supertest(app)
                .get('/users')
                .expect(200, testUsers)
        })

        it('GET /users/:user_id responds with 200 and the expected user', () => {
            const user_id = 2
            const expectedUser = testUsers[user_id -1]
            return supertest(app)
                .get(`/users/${user_id}`)
                .expect(200, expectedUser)
        })
    })
})