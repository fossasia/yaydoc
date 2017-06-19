const assert = require('assert')
const crypter = require('../util/crypter')

describe('crypter test', () => {
  it('decrytion of encrypted value should be same as original value', () =>{
    let demoValue = 'testData'
    assert.equal(demoValue, crypter.decrypt(crypter.encrypt(demoValue)))
  })
})
