import formatData from './api/format-data';
import { MIDWAY_API_PATH } from '../constants';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import RouteUpdate from './api/route-update';
import ExecuteAction from './api/execute-action';
import ResetState from './api/reset-state';
import ResetInput from './api/reset-input';
import GlobalInput from './api/global-input';
import SelectLocalProfile from './api/select-local-profile';
import SelectRemoteProfile from './api/select-remote-profile';
import SetProxy from './api/set-proxy';
import resetSessionVariantState from './api/reset-session-variant-state';
import resetSessionVariantStateByKey from './api/reset-session-variant-state-by-key';


const Logger = require('testarmada-midway-logger');
const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot',
  '.otf': 'font/otf',
  '.woff': 'font/woff'
};

export default function (server, mocker) {

  server.route({
    method: 'GET',
    path: '/_admin',
    handler: ensureInitialized(function (request, reply) {
      Logger.info('Received /admin request. Redirecting to /midway');
      reply.redirect('/midway');
    })
  });

  server.route({
    method: 'GET',
    path: '/midway',
    handler: ensureInitialized(function (request, reply) {
      reply = wrapReply(request, reply);
      fs.readFile(__dirname + '/config-page.html', { encoding: 'utf8' }, function (err, html) {
        if (err) {
          Logger.error(err);
          reply(err);
        } else {
          const data = formatData(mocker, request);
          html = html.replace('{data}', JSON.stringify(data));
          reply(html);
        }
      });
    })
  });

  server.route({
    method: 'GET',
    path: '/midway-data',
    handler: ensureInitialized(function (request, reply) {
      reply = wrapReply(request, reply);
      fs.readFile(__dirname + '/config-page.html', { encoding: 'utf8' }, function (err, html) {
        if (err) {
          Logger.error(err);
          reply(err);
        } else {
          const data = formatData(mocker, request);
          reply(data);
        }
      });
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/route/{id}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      const id = request.params.id;
      const route = mocker.findRoute(id);
      RouteUpdate(route, mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/action',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      const id = request.params.id;
      const route = mocker.findRoute(id);

      ExecuteAction(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/state/reset',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      ResetState(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/reset",
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      resetSessionVariantState(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/reset/{key}",
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      resetSessionVariantStateByKey(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/set/{key}",
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      resetSessionVariantStateByKey(mocker)(request, reply, respondWithConfig);
    })
  });


  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/input/reset',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      ResetInput(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/global/input/{pluginId}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      GlobalInput(mocker)(request, reply, respondWithConfig);
    })
  });

  // server.route({
  //   method: 'GET',
  //   path: MIDWAY_API_PATH + '/profile',
  //   handler: ensureInitialized(function (request, reply, respondWithConfig) {
  //     reply = wrapReply(request, reply);
  //     require('./api/calculate-profile')(mocker)(request, reply, respondWithConfig);
  //   })
  // });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/profile',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      SelectLocalProfile(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/profile/{name}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      SelectRemoteProfile(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'PUT',
    path: MIDWAY_API_PATH + '/profile/{name}',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      SelectRemoteProfile(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/proxy',
    handler: ensureInitialized(function (request, reply, respondWithConfig) {
      reply = wrapReply(request, reply);
      SetProxy(mocker)(request, reply, respondWithConfig);
    })
  });

  server.route({
    method: 'GET',
    path: '/midway/lib/{name*}',
    handler: function (request, reply) {
      try {
        const buffer = fs.readFileSync(__dirname + '/lib/' + request.params.name);
        const ext = path.extname(request.params.name);
        reply(buffer).header('Content-Type', MIME_TYPES[ext]).header('Cache-Control', 'max-age=31556926');
      } catch (e) {
        reply().code(404);
      }
    }
  });

  let compiledSource;
  server.route({
    method: 'GET',
    path: '/midway/app.js',
    handler: function (request, reply) {
      if (!compiledSource) {
        const source = fs.readFileSync(__dirname + '/config-page.js', { encoding: 'utf-8' });
        compiledSource = require('babel-core').transform(source, { presets: [require('babel-preset-react')] }).code;
      }
      reply(compiledSource);

      // when developing config page, uncomment below
      // compiledSource = undefined;
    }
  });

  server.route({
    method: 'GET',
    path: '/midway/inputs.js',
    handler: function (request, reply) {
      reply(getInputPlugins(mocker));
    }
  });

  function ensureInitialized(func) {
    return function (request, reply) {

      function doInit() {
        _.each(mocker.routes.get(), function (route) {
          route.resetRouteVariant(request);
          route.resetSelectedInput(request);
        });
        // mocker.plugins.resetInput(request);
        const initialState = JSON.parse(JSON.stringify(mocker.initOptions.initialState || {}));
        mocker.state.resetUserState(request, initialState);
      }
      mocker.state.initialize(request, function (err, performInitialization) {
        if (performInitialization) {
          doInit();
        }
        const returnConfig = request.query.returnConfig;
        func.call(this, request, reply, !!returnConfig);
      });
    };
  }

  // TODO sgoff0 what does this do? added in https://github.com/jhudson8/smocks/commit/0ee9dd0340b4b8a278fb9eeaf212b8a2356a02c8
  function wrapReply(request, reply) {
    const rtn = function (payload) {
      const response = reply.call(this, payload).hold();
      if (mocker.state.onResponse) {
        mocker.state.onResponse(request, response);
      }
      return response.send();
    };
    rtn.file = function () {
      const response = reply.file.apply(reply, arguments).hold();
      if (mocker.state.onResponse) {
        mocker.state.onResponse(request, response);
      }
      return response.send();
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