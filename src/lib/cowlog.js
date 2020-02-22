'use strict'
module.exports = exports = function (logger, messageCreator, runtimeVariables, dictionary, environmentDependent) {
  return function () {
    let exitCalled = false
    const cowlog = {
      _exit: function () {
        if (runtimeVariables.lastLogs && !exitCalled) {
          console.log(dictionary.dieDelimiter)
          runtimeVariables.lastLogs.forEach(function (log) {
            const result = messageCreator(runtimeVariables.calculatedParameters,
              log, true, true)
            console.log(result)
          })
        }
        exitCalled = true
      },

      log: function () {
        const returnValue = logger(0)(...arguments)
        return returnValue
      },

      init: function () {
        /* istanbul ignore else */
        if (environmentDependent.isNode) {
          process.on('exit', cowlog._exit)
        }

        /* istanbul ignore else */
        if (runtimeVariables.calculatedParameters.registerGlobal) {
          global.cowlog = cowlog
        }
        /* istanbul ignore else */
        if (runtimeVariables.calculatedParameters.registerglobalLogger) {
          /* istanbul ignore else */
          if (!global.l) {
            global.l = cowlog.log
          }
        }

        return cowlog
      }
    }

    return cowlog.init()
  }
}
