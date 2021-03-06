'use strict'
const stringifyObject = require('stringify-object')
const flatten = require('flat')
const fclone = require('fclone')
//todo: Needs refactoring!
const weGotMarkdown = process.env.markdown;

module.exports = exports = function (container) {
  module.dictionary = container.get('dictionary')
  module['logger-print-helpers'] = container.get('logger-print-helpers')

  return function (colored,  originalArguments, calculatedParameters, loggerPrintHelpers) {
    let referenceFunctionArguments = false
    return module.createBody(colored,
                             referenceFunctionArguments, originalArguments, calculatedParameters, loggerPrintHelpers)
  }
}

module.createArgumentName = function extracted (referenceFunctionArguments, iterator) {
  let argumentName = iterator

  return argumentName
}

module.createArgumentDelimiter = function (text, colored, argumentName) {
  let delimiter = argumentName + ` ${text} ${module.dictionary.argumentNameDelimiter}---`
  delimiter = module['logger-print-helpers'].getInverseString(colored, delimiter)
  delimiter = '\n' + delimiter + '\n'
  return delimiter
}

module.createBody = function extracted (colored, referenceFunctionArguments, originalArguments,
                                                                             calculatedParameters, loggerPrintHelpers) {
  if(colored && weGotMarkdown){
    colored = false
  }
  let logBody = ''
  let parametersLength = originalArguments.length
  for (let i = 0; i < parametersLength; i++) {
    let argumentName = module.createArgumentName(referenceFunctionArguments, i)
    let newMsg = ''
    newMsg += module.createArgumentDelimiter(module.dictionary.beginning, colored, argumentName, calculatedParameters,
                                                                                                     loggerPrintHelpers)
    let value = originalArguments[i]
    const isObject = value != null && typeof value === 'object'
    let valueToShow = isObject ? flatten(fclone(value)) : value
    let stringifyedParameter = stringifyObject(valueToShow , {
      indent: '  ',
      singleQuotes: false
    })
    newMsg += stringifyedParameter
    newMsg += module.createArgumentDelimiter(module.dictionary.end, colored, argumentName, calculatedParameters,
                                                                                                     loggerPrintHelpers)
    logBody += newMsg
  }

  let theRightWidthOutput = (function (logBody) {
    const cols = process.stdout.columns || 80
    let bodyArray = logBody.split('\n')
    let ret = []
    bodyArray.forEach(function (line, index) {
      let limit = cols -6
      let tooLongLine = line.length >= limit
      if(tooLongLine){
        let re = new RegExp(`.{1,${limit}}`, 'gm')
        let m = line.match(re)
        ret.push(m.join('\n'))
      }
      if(!tooLongLine || !line.length)
      {
        ret.push(line)
      }
    })

    return ret.join('\n')
  }(logBody))

  return theRightWidthOutput
}
