'use strict';

const test = require('tape');
const request = require('supertest');
const nock = require('nock');

const { app } = require('../server');

// mock a valid GH auth response
nock('https://github.com/')
.post('/login/oauth/access_token', () => true)
.reply(200, 'access_token=mockedToken&token_type=bearer');

test('handle valid code', (t) =>
  request(app)
    .get('/authenticate/good_code')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      t.deepEqual(res.body, {token: 'mockedToken'}, 'Should response with token when code is valid');
      t.end();
    })
);

// mock an invalid GH auth response
nock('https://github.com/')
.post('/login/oauth/access_token', () => true)
.reply(200, 'error=bad_verification_code&error_description=The+code+passed+is+incorrect+or+expired.&error_uri=https%3A%2F%2Fdeveloper.github.com%2Fv3%2Foauth%2F%23bad-verification-code');

test('handle bad code', (t) =>
  request(app)
    .get('/authenticate/bad_code')
    .expect('Content-Type', /json/)
    .expect(200)
    .end((err, res) => {
      t.deepEqual(res.body, { error: 'bad_code' }, 'Should not auth with a bad code');
      t.end();
    })
);
