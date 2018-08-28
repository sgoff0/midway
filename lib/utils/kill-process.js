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
var Kill = require('tree-kill');
var Logger = require('testarmada-midway-logger');

module.exports = function (pid, signal, callback) {
  signal = signal || 'SIGKILL';
  Logger.info('Killing process id ' + pid + ' and its descendant processes with signal ' + signal);
  try {
    Kill(pid, signal, function (err) {
      if (err) {
        Logger.info('Error in killing process with pid ' + pid);
        Logger.error(err);
      } else {
        Logger.info('Killed process with pid pid ' + pid);
      }
      if (callback) {
        return callback();
      }
    });
  } catch (e) {
    Logger.error('Error in killing process with pid :' + pid + ' , error:' + e.message);
    if (callback) {
      return callback();
    }
  }
};
