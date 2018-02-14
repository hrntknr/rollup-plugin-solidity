const path = require('path')
const fs = require('fs')
const assert = require('assert')
const rollup = require('rollup')
const solidity = require('..')

process.chdir(__dirname)


function executeBundle(bundle) {
  return bundle.generate({format: 'cjs'}).then(data=>data.code)
}

function readFile(_path) {
  return fs.readFileSync(path.resolve(__dirname, _path)).toString()
}

describe('rollup-plugin-solidity', function() {
  it('finds a module', function() {
    return rollup.rollup({
      input: 'samples/module/main.sol',
      plugins: [
        solidity()
      ]
    }).then(executeBundle).then(code=>{
      assert.equal(code, readFile('samples/module/build.js'))
    })
  })

  it('finds a file inside a package directory', function() {
    return rollup.rollup({
      input: 'samples/package/main.sol',
      plugins: [
        solidity()
      ]
    }).then(executeBundle).then(code=>{
      assert.equal(code, readFile('samples/package/build.js'))
    })
  })

  it('finds a file from multiple files', function() {
    return rollup.rollup({
      input: 'samples/multiple/main.sol',
      plugins: [
        solidity()
      ]
    }).then(executeBundle).then(code=>{
      assert.equal(code, readFile('samples/multiple/build.js'))
    })

  })

  it('finds a file from sub directory', function() {
    return rollup.rollup({
      input: 'samples/subdirectory/main.sol',
      plugins: [
        solidity()
      ]
    }).then(executeBundle).then(code=>{
      assert.equal(code, readFile('samples/subdirectory/build.js'))
    })
  })
})

