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
import * as Logger from 'testarmada-midway-logger';
import Utils from './../utils/common-utils';
import Constants from '../constants';
const state = {};

export default {

  addState: function (route, stateKey, stateValue) {
    const sessionId = Utils.getSessionId({ route: route.variant._route });
    Logger.debug('Setting stateKey and stateValue with session Id', stateKey, stateValue, sessionId);
    if (state[sessionId] === undefined) {
      state[sessionId] = {};
    }
    state[sessionId][stateKey] = stateValue;
  },

  getState: function (route, stateKey) {
    const sessionId = Utils.getSessionId({ route: route.variant._route });
    if (state[sessionId] === undefined) {
      return undefined;
    }
    return state[sessionId][stateKey];
  },

  clearState: function (sessionId) {
    if (sessionId) {
      delete state[sessionId];
    } else {
      delete state[Constants.DEFAULT_SESSION];
    }
  }
};