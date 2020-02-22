'use strict'
const writeFile = require('write')
const hashCreator = require('./hash-creator')
const path = require('path')
const fs = require('fs')

module.exports = exports = (dir) => (fileContent, logTypeString) => {
  logTypeString = logTypeString || '.log'
  const insertToString = function (str, index, value) {
    return str.substr(0, index) + value + str.substr(index)
  }
  const makeFileNameHashPath = function (hash) {
    return insertToString(hash, 2, '/')
  }
  const makeHashPath = function (relativeFilePath, logTypeString) {
    return path.join(dir, relativeFilePath) + logTypeString
  }
  const hash = fileContent ? hashCreator(fileContent) : hashCreator(Math.random())
  const relativeFilePath = makeFileNameHashPath(hash)
  const filePath = makeHashPath(relativeFilePath, '_' + logTypeString)
  /* istanbul ignore else */
  if (!fs.existsSync(filePath)) {
    writeFile.sync(filePath, fileContent)
  }

  return filePath
}
