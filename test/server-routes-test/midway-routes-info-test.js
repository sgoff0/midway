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
var MidwayRoutesInfo = require('../../lib/server-routes/midway-routes-info');
require('../../resources/run-mock-server-api-dynamic.js');

describe('midway-routes-info-test', function () {

  it('Check routes data is added correctly', function (done) {
    var sessionId = midway.registerSession();
    var sessionRoutes = MidwayRoutesInfo.getUserRoutesForSession(sessionId);
    for (var routes in sessionRoutes) {
      Expect(sessionRoutes[routes]._id).to.equal(routes);
      Expect(sessionRoutes[routes]._label).to.not.equal(null);
      Expect(sessionRoutes[routes]._path).to.contain(sessionId);
    }
    midway.closeSession(sessionId, function () {
      done();
    });
  });

  it('Make sure route can not be added once locked', function (done) {
    var routeToAdd =
      { id: 'setState',
        label: 'Add State',
        path: '/123456/addState',
        handler: [Object] };

    MidwayRoutesInfo.addSessionRoute(routeToAdd);
    var sessionRoutes = MidwayRoutesInfo.getUserRoutesForSession('123456');
    Expect(sessionRoutes).to.deep.equal({});
    done();
  });

});

