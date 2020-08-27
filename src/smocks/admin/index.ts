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
import formatData from './api/format-data';
import * as util from 'util';
import * as fs from 'fs';
const MIDWAY_API_PATH = require('../constants').MIDWAY_API_PATH;
// const fs = require('fs');
const Path = require('path');
const _ = require('lodash');
const Logger = require('testarmada-midway-logger');
const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot',
  '.otf': 'font/otf',
  '.woff': 'font/woff'
};
const readFile = util.promisify(fs.readFile);

export default (server, smocks) => {

  let connection = server;

  if (smocks.connection()) {
    connection = server.select(smocks.connection());
  }

  connection.route({
    method: 'GET',
    path: '/_admin',
    handler: ensureInitialized(function (request, h) {
      Logger.info('Received /admin request. Redirecting to /midway');
      return h.redirect('/midway');
    })
  });

  connection.route({
    method: 'GET',
    path: '/midway',
    handler: async (request, h) => {
      try {
        const html = await readFile(__dirname + '/config-page.html', { encoding: 'utf8' });
        // const data = formatData(smocks, request);
        const data = {};
        const retVal = html.replace('{data}', JSON.stringify(data));
        return retVal;
      } catch (err) {
        console.error("Err: ", err);
        return h.code(500);
      }

      // }
      // handler: ensureInitialized(function (request, h) {
      // return "test";
      // h = wrapReply(request, h);
      // fs.readFile(__dirname + '/config-page.html', { encoding: 'utf8' }, function (err, html) {
      //   if (err) {
      //     Logger.error(err);
      //     return h.response(err);
      //   } else {

      //     const data = formatData(mocker, request);
      //     html = html.replace('{data}', JSON.stringify(data));
      //     // return h.response(html);
      //     return html;
      //   }
      // });
    }
  });

  connection.route({
    method: 'GET',
    path: '/midway-data',
    handler: ensureInitialized(function (request, reply) {
      reply = wrapReply(request, reply);
      fs.readFile(__dirname + '/config-page.html', { encoding: 'utf8' }, function (err, html) {
        if (err) {
          Logger.error(err);
          reply(err);
        } else {
          const data = formatData(smocks, request);
          reply(data);
        }
      });
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/route/{id}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      const id = request.params.id;
      const route = smocks.findRoute(id);
      require('./api/route-update')(route, smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/action',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      const id = request.params.id;
      const route = smocks.findRoute(id);

      require('./api/execute-action')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/state/reset',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/reset-state')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/reset",
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require("./api/reset-session-variant-state")(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/reset/{key}",
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require("./api/reset-session-variant-state-by-key")(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/set/{key}",
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require("./api/set-session-variant-state-by-key")(smocks)(request, reply, respondWithConfig);
    })
  });


  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/input/reset',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/reset-input')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/global/input/{pluginId}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/global-input')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'GET',
    path: MIDWAY_API_PATH + '/profile',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/calculate-profile')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/profile',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/select-local-profile')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/profile/{name}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/select-remote-profile')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'PUT',
    path: MIDWAY_API_PATH + '/profile/{name}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/select-remote-profile')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/proxy',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      require('./api/set-proxy')(smocks)(request, reply, respondWithConfig);
    })
  });

  connection.route({
    method: 'GET',
    path: '/midway/lib/{name*}',
    handler: function (request, reply) {
      try {
        const buffer = fs.readFileSync(__dirname + '/lib/' + request.params.name);
        const ext = Path.extname(request.params.name);
        reply(buffer).header('Content-Type', MIME_TYPES[ext]).header('Cache-Control', 'max-age=31556926');
      } catch (e) {
        reply().code(404);
      }
    }
  });

  let compiledSource;
  connection.route({
    method: 'GET',
    path: '/midway/app.js',
    handler: function (request, h) {
      if (!compiledSource) {
        const source = fs.readFileSync(__dirname + '/config-page.js', { encoding: 'utf-8' });
        compiledSource = require('babel-core').transform(source, { presets: [require('babel-preset-react')] }).code;
      }
      // reply(compiledSource);
      return compiledSource;

      // when developing config page, uncomment below
      // compiledSource = undefined;
    }
  });

  connection.route({
    method: 'GET',
    path: '/midway/inputs.js',
    handler: function (request, h) {
      // reply(getInputPlugins(mocker));
      return getInputPlugins(smocks);
    }
  });

  function ensureInitialized(func) {
    return function (request, h) {

      function doInit() {
        _.each(smocks.routes.get(), function (route) {
          route.resetRouteVariant(request);
          route.resetSelectedInput(request);
        });
        smocks.plugins.resetInput(request);
        const initialState = JSON.parse(JSON.stringify(smocks.initOptions.initialState || {}));
        smocks.state.resetUserState(request, initialState);
      }
      smocks.state.initialize(request, function (err, performInitialization) {
        if (performInitialization) {
          doInit();
        }
        const returnConfig = request.query.returnConfig;
        func.call(this, request, h, !!returnConfig);
      });
    };
  }

  function wrapReply(request, h) {
    const rtn = function (payload) {
      const response = h.response(payload);
      // const response = reply.call(this, payload).hold();
      if (smocks.state.onResponse) {
        smocks.state.onResponse(request, response);
      }
      // return response.send();
      return response;
    };
    rtn.file = function () {
      // const response = reply.file.apply(reply, arguments).hold();
      // TODO sgoff0 is h.file a thing?
      console.error("Is h.file a thing?");
      const response = h.file(arguments);
      if (smocks.state.onResponse) {
        smocks.state.onResponse(request, response);
      }
      // return response.send();
      return response;
    };
    return rtn;
  }
};

function getInputPlugins(mocker) {
  const inputs = mocker.inputs.get();
  let script = '';
  _.each(inputs, function (data, id) {
    script = script + 'input["' + id + '"] = ' + data.ui + '\n';
  });
  script = 'var _inputs = function(input) {\n' + script + '\n};';
  return script;
}