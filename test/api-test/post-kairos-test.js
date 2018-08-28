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
var request = require('request');
var sinon = require('sinon');
var Expect = require('chai').expect;
var MetricManager = require('../../lib/utils/metrics-manager');
var Utils = require('../../lib/utils/common-utils');

describe('Metrics Post to Kairos', function () {
  var metrics = [ 'midway', 'midway.default', 'midway.default.message' ];
  var postStub;
  var clock;
  before(function () {
    Utils.setKairosDbUrl('http://kairos.server.com/api/v1/datapoints');
    postStub = sinon
      .stub(request, 'post')
      .yields(null, metrics);
    var now = new Date();
    clock = sinon.useFakeTimers(now.getTime());
  });
  after(function () {
    request.post.restore();
    clock.restore();
  });

  it('should be successful', function () {
    Expect(metrics.length).to.be.equal(3);
    var postBody = { body:
        [ { name: 'midway',
          tags: {
            profile: 'default',
            sequence: 0
          },
          timestamp: clock.now,
          value: 1 },
          { name: 'midway.default',
            tags: {
              profile: 'default',
              sequence: 0
            },
            timestamp: clock.now,
            value: 1 },
          { name: 'midway.default.message',
            tags: {
              profile: 'default',
              sequence: 0
            },
            timestamp: clock.now,
            value: 1 } ],
      json: true,
      url: Utils.getKairosDbUrl()
    };
    MetricManager.postToKairos(metrics, function (err) {
      Expect(request.post.called).to.be.equal(true);
      Expect(err).to.be.not.defined;
    });
    sinon.assert.calledWith(postStub, postBody);
  });

  it('should throw error when error is encountered', function () {
    var expectedError = new Error('fake error');
    postStub.yields(expectedError);
    MetricManager.postToKairos(metrics, function (err) {
      Expect(err.message).to.equal('fake error');
    });
  });

  it('should not throw error if callback is not sent to postToKairos', function () {
    Expect(MetricManager.postToKairos.bind(MetricManager, metrics)).to.not.throw(Error);
  });

});
