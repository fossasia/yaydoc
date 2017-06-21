const assert = require('assert')
const crypter = require('../util/crypter')
const spawn = require('child_process').spawn
const uuidV4 = require("uuid/v4")
const fs = require('fs')

describe('crypter test', () => {
  it('decrytion of encrypted value should be same as original value', () =>{
    let demoValue = 'testData'
    assert.equal(demoValue, crypter.decrypt(crypter.encrypt(demoValue)))
  })
})

describe('WebUi Generator', () => {
  let uniqueId = uuidV4()
  let email = 'fossasia@gmail.com'
  let args = [
    "-g", "https://github.com/fossasia/yaydoc.git",
    "-t", "alabaster",
    "-m", email,
    "-u", uniqueId,
    "-w", "true"
  ]
  let exitCode
  let files

  before((done) => {
    let process = spawn('./generate.sh', args)
    process.on('exit', (code) => {
      exitCode = code
      files = fs.readdirSync(`temp/${email}`)
      done()
    })
  })
  it('exit code should be zero', () => {
    assert.equal(exitCode, 0)
  })
  it('preview folder should be created', () => {
    if(files.indexOf(`${uniqueId}_preview`) < 0){
      throw new Error('preview not created')
    }
  })
  it('zipped documentation should be created', () => {
    if(files.indexOf(`${uniqueId}.zip`) < 0){
      throw new Error('zipped documentation not created')
    }
  })
})
