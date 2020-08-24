function makeUsersArray () {
    return [
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
}

module.exports = {
    makeUsersArray,
}