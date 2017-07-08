require('dotenv').config({ path: './.env'});
const assert = require('assert');
const crypter = require('../util/crypter');

describe('crypter test', function () {
  it('decrytion of encrypted value should be same as original value', function () {
    let demoValue = 'testData';
    assert.equal(demoValue, crypter.decrypt(crypter.encrypt(demoValue)));
  });
});
