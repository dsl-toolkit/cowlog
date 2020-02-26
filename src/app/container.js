'use strict'

const Jimple = require('jimple')
const container = new Jimple()

const os = require('os')
const path = require('path')

const tmpDir = os.tmpdir()
const cowlogTmpDir = path.join(tmpDir, 'cowlog/')
const cowlogHashDir = path.join(cowlogTmpDir, 'hashes/')
const events = require('events')
const ee = new events.EventEmitter()

module.exports = function (calculatedParameters) {
  container.set('calculated-parameters', (c) => c.get('runtime-variables').calculatedParameters)
  container.set('environment-dependent', () => ({ isNode: require('detect-node') }))
  container.set('dictionary', () => require('./dictionary'))
  container.set('event-emitter', () => ee)

  container.set('logger-body-factory', (c) => require('../lib/logger/body-factory')(c))
  container.set('log-file-creator', () => require('../lib/logfile-creator')(cowlogHashDir))
  container.set('cowlog', (c) => {
    const logger = c.logger
    const messageCreator = c.get('message-creator')
    const runtimeVariables = c.get('runtime-variables')
    const dictionary = c.get('dictionary')
    const environmentDependent = c.get('environment-dependent')

    return require('../lib/cowlog')(logger, messageCreator, runtimeVariables, dictionary, environmentDependent)
  })

  container.set('cowlog', (c) => {
    const logger = c.get('logger')
    const messageCreator = c.get('message-creator')
    const runtimeVariables = c.get('runtime-variables')
    const dictionary = c.get('dictionary')
    const environmentDependent = c.get('environment-dependent')

    return require('../lib/cowlog')(logger, messageCreator, runtimeVariables, dictionary, environmentDependent)
  })

  container.set('logger', (c) => require('../lib/logger/logger')(c))
  container.set('logger-print-helpers', () => require('../lib/logger/print-helpers')())
  container.set('logger-stack-trace-factory', (c) => require('../lib/logger/stack-trace-factory')(c))
  // ------
  container.set('message-creator', (c) => require('../lib/message/message-creator')(c))
  container.set('runtime-variables', (c) => ({
    env: {
      prod: !!process.env.PROD
    },
    logs: [],
    fileLogs: {},
    collectedLogs: []
  }))
  container.get('runtime-variables').calculatedParameters = calculatedParameters

  container.set('message-coloring', (c) => require('../lib/message/coloring')())
  container.set('plugin-loader', (c) => require('../lib/plugin/plugin-loader')(c))

  const plugins = container.get('calculated-parameters').plugins || []

  plugins.forEach(function (plugin) {
    container.get('plugin-loader')(plugin)
  })

  return container
}
