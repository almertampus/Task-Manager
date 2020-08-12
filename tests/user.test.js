const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Io',
    email: 'io@gmail.com',
    password: 'hd720;730',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should sign up a new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Kaya',
            email: 'kayaexample@gmail.com',
            password: 'kayaKaya/;#01W'
        })
        .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user)
        .not
        .toBeNull()

    expect(response.body)
        .toMatchObject({
            user: {
                name: 'Kaya',
                email: 'kayaexample@gmail.com'
            },
            token: user.tokens[0].token
        })

    expect(user.password)
        .not
        .toBe('kayaKaya/;#01W')
})

test('Should login existing user', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token)
        .toBe(user.tokens[1].token)
})

test('Should not login existing user', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'nonExistentUser',
            password: 'nonExistentPassword1234'
        })
        .expect(400)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(userOneId)
    expect(user)
        .toBeNull()
})

test('Should not delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('upload', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Almer',
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe('Almer')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Manila'
        })
        .expect(400)
})