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
export { };
const _ = require('lodash');
const mimeTypes = require('mime-types');
const fs = require('fs');
const Path = require('path');

const Variant = function (data, route) {
  if (_.isString(data)) {
    data = { id: data };
  }
  this._id = data.id || 'default';
  this._label = data.label;
  this.handler = data.handler;
  this._route = route;
  this._input = data.input;
  this.appliesToRoute = data.appliesToRoute;
};
_.extend(Variant.prototype, {

  id: function () {
    return this._id;
  },

  label: function (label) {
    if (label) {
      this._label = label;
      return this;
    } else {
      return this._label;
    }
  },

  input: function (input) {
    if (input) {
      this._input = input;
      return this;
    } else {
      return this._input;
    }
  },

  plugin: function (plugin) {
    return this._route.plugin(plugin);
  },

  respondWith: function (handler) {
    this.handler = handler;
    this.done();
    return this;
  },

  respondWithFile: function (options) {
    const self = this;
    return this.respondWith(function (request, reply) {
      options = options || {};
      if (_.isString(options)) {
        options = {
          path: options
        };
      }
      if (options.path) {
        const path = Path.resolve(options.path.replace(/\{([^\}]+)\}/g, function (match, token) {
          let val = request.params[token];
          if (!val) {
            val = self.state(token);
          }
          return val || match;
        }));
        // a specific file name was provided
        fs.readFile(path, function (err, stream) {
          if (err) {
            if (err.code === 'ENOENT') {
              // doesn't exist
              return reply(path + ' not found').code(404);
            } else {
              return reply(err);
            }
          }
          const mimeType = mimeTypes.lookup(path);
          reply(stream).type(mimeType).code(options.code || 200);
        });
      } else {
        // a specific handler must be provided
        const initOptions = require('./index').initOptions;
        const handlerFunction = initOptions.respondWithFileHandler;
        if (!handlerFunction) {
          return reply({
            message: 'no file handler function (use smocks "replyWithFileHandler" option)'
          }).code(500);
        }
        handlerFunction({
          request: request,
          reply: reply,
          route: self._route,
          variant: self,
          options: options,
          smocksOptions: initOptions
        });
      }
    });


    return this.respondWith(function (request, reply) {
      const self = this;
      console.error("Commented out code here around filename");
      // TODO sgoff0 where does filename come from?
      // fileName = fileName.replace(/\{([^\}]+)\}/g, function (match, token) {
      //   let val = request.params[token];
      //   if (!val) {
      //     val = self.state(token);
      //   }
      //   return val || match;
      // });
      // reply.file(fileName);
    });
  },

  variant: function () {
    return this._route.variant.apply(this._route, arguments);
  },

  route: function () {
    return this._route.route.apply(this._route, arguments);
  },

  start: function () {
    return this._route.start.apply(this._route, arguments);
  },

  toHapiPlugin: function () {
    return this._route.toHapiPlugin.apply(this._mocker, arguments);
  },

  done: function () {
    this._route.done();
  },

  global: function () {
    return this._route.global();
  }
});

module.exports = Variant;