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
var Expect = require('chai').expect;
var midway = require('../../lib/index');
var MidwayUtils = require('../../lib/utils/common-utils');
var MidwayServer = require('../../resources/run-mock-server-api-dynamic.js');

describe('plugin-test', function () {

  it('Test for session value', function (done) {
    MidwayUtils.setServerRunningStatus(true);
    var plugin = midway.toPlugin({}, {mockedDirectory: './resources/mocked-data', sessions: 5});
    Expect(plugin.attributes.sessions).to.equal(5);
    midway.resetMockId();
    midway.resetURLCount();
    MidwayUtils.setServerRunningStatus(false);
    done();
  });

  it('Test for session value 0 if not passed in options', function (done) {
    MidwayUtils.setServerRunningStatus(true);
    var plugin = midway.toPlugin({}, {mockedDirectory: './resources/mocked-data'});
    Expect(plugin.attributes.sessions).to.equal(0);
    midway.resetMockId();
    midway.resetURLCount();
    MidwayUtils.setServerRunningStatus(false);
    done();
  });

  it('Verify no error if midwayOptions are undefined', function (done) {
    try {
      var MidwayOptions = MidwayServer.getMidwayServer().midwayOptions;
      MidwayUtils.setServerRunningStatus(true);
      var plugin = midway.toPlugin();
      Expect(plugin.attributes.sessions).to.equal(0);
      midway.resetMockId();
      midway.resetURLCount();
      midway.toPlugin({}, MidwayOptions);
      MidwayUtils.setServerRunningStatus(false);
      done();
    } catch (err) {
      Expect.fail();
    }
  });
});
