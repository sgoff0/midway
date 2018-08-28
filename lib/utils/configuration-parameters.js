/**
* MIT License
*
* Copyright (c) 2018-present, Walmart Inc.,
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*/
var argv = require('yargs')
  .usage('Usage: node $0 [options]')
  .describe('midwayHost', 'Host address for midway server')
  .string('midwayHost')
  .describe('midwayPort', 'Port number for midway server')
  .number('midwayPort')
  .describe('httpsPort', 'Https Port number for midway server')
  .number('httpsPort')
  .describe('project', 'Your project name. Eg. homepage, cart')
  .string('project')
  .describe('midwaySessions', 'Number of parallel sessions beside default')
  .number('midwaySessions')
  .describe('mockedData', 'Mocked data directory')
  .string('mockedData')
  .example('node $0 --midwayHost localhost --midwayPort 8090', 'Start the midway server at http://localhost:8090/midway')
  .example('node $0 --midwayHost http://localhost', 'Start the midway server at http://localhost:8080/midway - using default port')
  .example('node $0 --midwayHost http://localhost --midwaySessions 2', 'Start the midway server at http://localhost:8080/midway - using default port with two parallel sessions plus one default session')
  .help('h')
  .alias('h', 'help')
  .argv;

module.exports.argv = argv;
