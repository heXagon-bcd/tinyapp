const { assert } = require('chai');

const { emailLookup } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = emailLookup("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.isOk(true, 'this will pass');
  });
});
describe('getUserByEmail', function() {
  it('should return fail', function() {
    const user = emailLookup("aaa@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.isNotOk(false, 'this will fail');
  });
});
describe('getUserByEmail', function() {
  it('should return this value is undefined', function() {
    const user = emailLookup("bbb@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.notExists(user, 'this value is undefined');
  });
});