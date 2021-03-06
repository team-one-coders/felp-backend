// import chai assertion functions
const should = require('chai').should();
const expect = require('chai').expect;
const assert = require('chai').assert;

// import supertest to connect to HTTP in testing frameworks
const supertest = require('supertest');
const api = supertest(require('../index.js'));

// GET posts which will list out all the posts
describe('GET all posts /api/posts/', () => {
    it('Should return an array of posts', (done) => {
        api.get('/api/posts').end((err, res) => {
            expect(res.body).to.be.an('array');
            done();
        });
    });
    // Test currently does not pass because the test is trying to identity values for each input but it seems like one of our seed data doesn't have an input
    it('Each post should have an id, state, city, title, date, message, years of residence, and type property', (done) => {
        api.get('/api/posts').end((err, res) => {
            res._body.forEach((post) => {
                expect(post._id).to.be.an('string');
                expect(post.state).to.be.an('string');
                expect(post.city).to.be.an('string');
                expect(post.title).to.be.an('string');
                expect(post.date).to.be.an('string');
                expect(post.message).to.be.an('string');
                expect(post.years_of_residence).to.be.an('number');
                expect(post.type).to.be.an('string');
            });
            done();
        });
    });
    it('Each post should have a "owner" property', (done) => {
        api.get('/api/posts').end((err, res) => {
            res._body.forEach((post) => {
                expect(post).to.have.property('owner');
            });
            done();
        });
    });
    it('The "owner" property should be an object', (done) => {
        api.get('/api/posts').end((err, res) => {
            res._body.forEach((post) => {
                expect(post.owner).to.be.an('object');
            });
            done();
        });
    });
    it('The "owner" property should have a username and email properties', (done) => {
        api.get('/api/posts').end((err, res) => {
            res._body.forEach((post) => {
                expect(post.owner).to.have.property('username');
                expect(post.owner).to.have.property('email');
            });
            done();
        });
    });
    it('The "owner" property should not have a password property', (done) => {
        api.get('/api/posts').end((err, res) => {
            res._body.forEach((post) => {
                expect(post.owner).to.not.have.property('passwprd');
            });
            done();
        });
    });
});

// GET request by state tests
describe('GET posts by state /state/:state', () => {
    let state;
    before((done) => {
        api.get('/api/posts').end((err, res) => {
            state = res._body[0].state;
            done();
        });
    });
    it('Should all have the same value for the "state" property', (done) => {
        api.get(`/api/posts/state/${state}`).end((err, res) => {
            res._body.forEach((post) => {
                expect(post.state).to.equal(state);
            });
            done();
        });
    });
    it('Each post should have a "owner" property', (done) => {
        api.get(`/api/posts/state/${state}`).end((err, res) => {
            res._body.forEach((post) => {
                expect(post).to.have.property('owner');
            });
            done();
        });
    });
    it('The "owner" property should be an object', (done) => {
        api.get(`/api/posts/state/${state}`).end((err, res) => {
            res._body.forEach((post) => {
                expect(post.owner).to.be.an('object');
            });
            done();
        });
    });
    it('The "owner" property should have a username and email properties and not have a password property', (done) => {
        api.get(`/api/posts/state/${state}`).end((err, res) => {
            res._body.forEach((post) => {
                expect(post.owner).to.have.property('username');
                expect(post.owner).to.have.property('email');
                expect(post.owner).to.not.have.property('passwprd');
            });
            done();
        });
    });
});

// POST request tests
describe('POST request /api/posts', () => {
    let token = process.env.TOKEN;
    const newPost = {
        state: "CA",
        city: "Los Angeles",
        title: "Hello LA",
        date: "1-2-1234",
        message: "If you find this, then hello world",
        years_of_residence: 2,
        type: "Experience",
    }
    it('Should be able to create a post', (done) => {
        api.post('/api/posts').send(newPost).set({Authorization: `Bearer ${token}`}).end((err, res) => {
            expect(res._body).to.have.property('state');
            expect(res._body).to.have.property('city');
            expect(res._body).to.have.property('title');
            expect(res._body).to.have.property('date');
            expect(res._body).to.have.property('message');
            expect(res._body).to.have.property('years_of_residence');
            expect(res._body).to.have.property('type');
            done();
        });
    });
    // Need to refactor differently because the test is looking for a header but the header seems like it's always going to be not undefined since it looks like it's a concactination of strings
    it('Should require a token', (done) => {
        api.post('/api/posts').send(newPost).set({Authorization: `Bearer ${token}`}).end((err, res) => {
            expect(res.req._header).to.not.be.undefined;
            done();
        });
    });
});

// DELETE request test
describe('DELETE request /id/:id', () => {
    let token = process.env.TOKEN;
    let id;
    before((done) => {
        api.get('/api/posts').end((err, res) => {
            id = res._body[res._body.length - 1]._id;
            console.log(id);
            done();
        });
    });
    it('Response should return the deleted post', (done) => {
        api.delete(`/api/posts/id/${id}`).set({Authorization: `Bearer ${token}`}).end((err, res) => {
            expect(res._body._id).to.equal(id);
            done();
        });
    });
    // Need to refactor differently because the test is looking for a header but the header seems like it's always going to be not undefined since it looks like it's a concactination of strings
    it('Request should require a token', (done) => {
        api.delete(`/api/posts/id/${id}`).set({Authorization: `Bearer ${token}`}).end((err, res) => {
            expect(res.req._header).to.not.be.undefined;
            done();
        });
    });
});