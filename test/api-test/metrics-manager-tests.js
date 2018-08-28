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
var MetricManager = require('../../lib/utils/metrics-manager');
var Expect = require('chai').expect;
var midway = require('../../lib/index');
require('../../resources/run-mock-server-api-dynamic.js');

describe('Generation of metrics test', function () {
  it('should provide have at least 2 metrics when root path is provided', function () {
    var request = getRequestObject('/');
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(2);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
  });

  it('should provide  3 metrics with just a simple path ', function () {
    var request = getRequestObject('/message');
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(3);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.message');
  });

  it('should provide atlest 3 metrics with just a simple path  with / seperation', function () {
    var request = getRequestObject('/message/xyz');
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(3);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.message_xyz');
  });

  it('should provide 4 metrics if url param is sent', function () {
    var request = getRequestObject('/message/{id}', undefined, [20]);
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(4);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.message_id');
    Expect(metrics[3]).to.be.equal('midway.MidwayTest.message_id.20');

  });

  it('should provide 4 metrics with id value attached in the end in opposite order', function () {
    var request = getRequestObject('/{id}/message', undefined, [20]);
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(4);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.id_message');
    Expect(metrics[3]).to.be.equal('midway.MidwayTest.id_message.20');
  });

  it('should provide 4 metrics with id value attached when url is extended after dynamic value of url - part 1', function () {
    var request = getRequestObject('/{id}/message/{id2}', undefined, [20, 30]);
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(4);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.id_message_id2');
    Expect(metrics[3]).to.be.equal('midway.MidwayTest.id_message_id2.20_30');
  });

  it('should provide 4 metrics with id value attached when url is extended after dynamic value of url - part 2', function () {
    var request = getRequestObject('/{id}/message/{id2}/xyz', undefined, [20, 30]);
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(4);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.id_message_id2_xyz');
    Expect(metrics[3]).to.be.equal('midway.MidwayTest.id_message_id2_xyz.20_30');
  });

  it('should provide 4 metrics with id value attached when url is extended after dynamic value of url -part 3', function () {
    var request = getRequestObject('/{id1}/{id2/{id3}', undefined, [20, 30, 60]);
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(4);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.id1_id2_id3');
    Expect(metrics[3]).to.be.equal('midway.MidwayTest.id1_id2_id3.20_30_60');
  });

  it('should provide 3 metrics with id value attached when no paramsArray is provided', function () {
    var request = getRequestObject('/{id1}/{id2/message', undefined);
    var metrics = MetricManager.getMetrics(request, 'MidwayTest');
    Expect(metrics.length).to.be.equal(3);
    Expect(metrics[0]).to.be.equal('midway');
    Expect(metrics[1]).to.be.equal('midway.MidwayTest');
    Expect(metrics[2]).to.be.equal('midway.MidwayTest.id1_id2_message');
  });

  it('should NOT collect metrics when url is midway', function (done) {
    var request = getRequestObject('/midway');
    var metrics = MetricManager.getMetrics(request, 'default');
    Expect(metrics).to.be.undefined;
    done();
  });

  it('should NOT collect metrics when url is _admin', function (done) {
    var request = getRequestObject('/_admin');
    var metrics = MetricManager.getMetrics(request, 'default');
    Expect(metrics).to.be.undefined;
    done();
  });

  it('should NOT collect metrics when a non mocked route is entered', function (done) {
    var request = getRequestObject('/non-mocked', '/{p*}', [ 'non-mocked' ]);
    var metrics = MetricManager.getMetrics(request, 'default');
    Expect(metrics).to.be.undefined;
    done();
  });

  it('should collect metrics when url is non midway or _admin', function (done) {
    var request = getRequestObject('/message');
    var metrics = MetricManager.getMetrics(request, 'default');
    Expect(metrics.length).to.be.equal(3);
    done();
  });

  it('should collect metrics without sessionId when url has session id ', function (done) {
    var sessionId = midway.registerSession();
    var regex = new RegExp(sessionId, 'i');
    var request = getRequestObject('/' + sessionId + '/message');
    var metrics = MetricManager.getMetrics(request, 'default');
    metrics.forEach(function (metric) {
      Expect(metric).to.not.match(regex);
    });
    closeSession(sessionId, done);
  });

  it('should collect metrics without sessionId when reply with hard coded text is used ', function (done) {
    var sessionId = midway.registerSession();
    var regex = new RegExp(sessionId, 'i');
    var request = getRequestObject('/' + sessionId + '/helloMidway');
    var metrics = MetricManager.getMetrics(request, 'default');
    metrics.forEach(function (metric) {
      Expect(metric).to.not.match(regex);
    });
    closeSession(sessionId, done);
  });

});

function getRequestObject(path, routePath, params) {
  var request = {};
  request.path = path;
  request.route = {};
  request.route.path = path;
  if (routePath) {
    request.route.path = routePath;
  }
  if (params) {
    request.paramsArray = params;
  }
  return request;
}

function closeSession(sessionId, callback) {
  midway.closeSession(sessionId, function () {
    callback();
  });
}
