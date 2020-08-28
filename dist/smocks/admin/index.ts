import formatData from './api/format-data';
import { MIDWAY_API_PATH } from '../constants';
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
import * as Hapi from '@hapi/hapi';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as util from 'util';
import { Smocks } from '..';
import setSessionVariantStateByKey from './api/set-session-variant-state-by-key';
const readFile = util.promisify(fs.readFile);


const Logger = require('testarmada-midway-logger');
const MIME_TYPES = {
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot',
  '.otf': 'font/otf',
  '.woff': 'font/woff'
};

export default (server: Hapi.Server, smocks: Smocks) => {

  function ensureInitialized(func) {
    return function (request, h: Hapi.ResponseToolkit) {
      Logger.debug("Ensure initialized");
      function doInit() {
        Logger.debug("doInit Admin");
        _.each(smocks.routes.get(), function (route) {
          route.resetRouteVariant(request);
          route.resetSelectedInput(request);
        });
        // smocks.plugins.resetInput(request);
        const initialState = JSON.parse(JSON.stringify(smocks.initOptions.initialState || {}));
        smocks.state.resetUserState(request, initialState);
      }

      // Static state init is sequential now
      const shouldPerformInitialization = smocks.state.initialize(request);
      if (shouldPerformInitialization) {
        doInit();
      }
      const returnConfig = request.query.returnConfig;
      return func.call(this, request, h, !!returnConfig);
    };
  }

  // TODO sgoff0 what does this do? added in https://github.com/jhudson8/smocks/commit/0ee9dd0340b4b8a278fb9eeaf212b8a2356a02c8
  // function wrapReply(request, h: Hapi.ResponseToolkit) {
  //   const rtn = function (payload) {
  //     const response = h.response.call(this, payload);
  //     if (smocks.state.onResponse) {
  //       smocks.state.onResponse(request, response);
  //     }
  //     return response;
  //   };
  //   rtn.file = function (...args: any[]) {
  //     const response = h.file.apply(h, ...args);
  //     if (smocks.state.onResponse) {
  //       smocks.state.onResponse(request, response);
  //     }
  //     return response;
  //   };
  //   return rtn;
  // }

  server.route({
    method: 'GET',
    path: '/_admin',
    handler: ensureInitialized(function (request, h) {
      Logger.info('Received /admin request. Redirecting to /midway');
      return h.redirect('/midway');
    })
  });

  server.route({
    method: 'GET',
    path: '/midway',
    handler: ensureInitialized(async (request, h) => {
      // handler: async (request, h) => {
      try {
        const html = await readFile(__dirname + '/config-page.html', { encoding: 'utf8' });
        // const data = {};
        const data = formatData(smocks, request);
        const retVal = html.replace('{data}', JSON.stringify(data));
        // reply(html);
        return retVal;;
      } catch (err) {
        console.error("Err: ", err);
        return h.response().code(500);
      }
    })
  });

  server.route({
    method: 'GET',
    path: '/midway-data',
    handler: ensureInitialized((request, h) => {
      // const reply = wrapReply(request, h);
      try {
        const data = formatData(smocks, request);
        return data;
      } catch (err) {
        Logger.error(err);
        return err;
      }
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/route/{id}',
    handler: ensureInitialized(function (request, h, respondWithConfig) {
      // const reply = wrapReply(request, h);
      const id = request.params.id;
      const route = smocks.findRoute(id);
      return RouteUpdate(route, smocks)(request, h, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/action',
    handler: ensureInitialized(function (request, h, respondWithConfig) {
      // reply = wrapReply(request, h);
      const id = request.params.id;
      const route = smocks.findRoute(id);

      ExecuteAction(smocks)(request, h, respondWithConfig);
    })
  });

  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/state/reset',
    handler: ensureInitialized(function (request, h, respondWithConfig) {
      // reply = wrapReply(request, h);
      ResetState(smocks)(request, h, respondWithConfig);
    })
  });

  server.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/reset",
    handler: ensureInitialized(function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
      // reply = wrapReply(request, h);
      return resetSessionVariantState(smocks)(request, h, respondWithConfig);
    })
  });

  server.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/reset/{key}",
    handler: ensureInitialized(function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
      // reply = wrapReply(request, h);
      return resetSessionVariantStateByKey(smocks)(request, h, respondWithConfig);
    })
  });

  server.route({
    method: "POST",
    path: MIDWAY_API_PATH + "/sessionVariantState/set/{key}",
    handler: ensureInitialized(function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
      // reply = wrapReply(request, h);
      return setSessionVariantStateByKey(smocks)(request, h, respondWithConfig);
    })
  });


  server.route({
    method: 'POST',
    path: MIDWAY_API_PATH + '/input/reset',
    handler: ensureInitialized(function (request, h: Hapi.ResponseToolkit, respondWithConfig) {
      // reply = wrapReply(request, h);
      return ResetInput(smocks)(request, h, respondWithConfig);
    })
  });

  // server.route({
  //   method: 'POST',
  //   path: MIDWAY_API_PATH + '/global/input/{pluginId}',
  //   handler: ensureInitialized(function (request, h, respondWithConfig) {
  //     reply = wrapReply(request, h);
  //     GlobalInput(smocks)(request, h, respondWithConfig);
  //   })
  // });

  // server.route({
  //   method: 'GET',
  //   path: MIDWAY_API_PATH + '/profile',
  //   handler: ensureInitialized(function (request, h, respondWithConfig) {
  //     reply = wrapReply(request, h);
  //     require('./api/calculate-profile')(smocks)(request, h, respondWithConfig);
  //   })
  // });

  // server.route({
  //   method: 'POST',
  //   path: MIDWAY_API_PATH + '/profile',
  //   handler: ensureInitialized(function (request, h, respondWithConfig) {
  //     reply = wrapReply(request, h);
  //     SelectLocalProfile(smocks)(request, h, respondWithConfig);
  //   })
  // });

  // server.route({
  //   method: 'POST',
  //   path: MIDWAY_API_PATH + '/profile/{name}',
  //   handler: ensureInitialized(function (request, h, respondWithConfig) {
  //     reply = wrapReply(request, h);
  //     SelectRemoteProfile(smocks)(request, h, respondWithConfig);
  //   })
  // });

  // server.route({
  //   method: 'PUT',
  //   path: MIDWAY_API_PATH + '/profile/{name}',
  //   handler: ensureInitialized(function (request, h, respondWithConfig) {
  //     reply = wrapReply(request, h);
  //     SelectRemoteProfile(smocks)(request, h, respondWithConfig);
  //   })
  // });

  // server.route({
  //   method: 'POST',
  //   path: MIDWAY_API_PATH + '/proxy',
  //   handler: ensureInitialized(function (request, h, respondWithConfig) {
  //     reply = wrapReply(request, h);
  //     SetProxy(smocks)(request, h, respondWithConfig);
  //   })
  // });

  server.route({
    method: 'GET',
    path: '/midway/lib/{name*}',
    handler: function (request, h) {
      try {
        const buffer = fs.readFileSync(__dirname + '/lib/' + request.params.name);
        const ext = path.extname(request.params.name);
        return h.response(buffer).header('Content-Type', MIME_TYPES[ext]).header('Cache-Control', 'max-age=31556926');
      } catch (e) {
        return h.response().code(404);
      }
    }
  });

  let compiledSource;
  server.route({
    method: 'GET',
    path: '/midway/app.js',
    handler: function (request, h) {
      if (!compiledSource) {
        const source = fs.readFileSync(__dirname + '/config-page.js', { encoding: 'utf-8' });
        compiledSource = require('babel-core').transform(source, { presets: [require('babel-preset-react')] }).code;
      }
      return compiledSource;

      // when developing config page, uncomment below
      // compiledSource = undefined;
    }
  });

  server.route({
    method: 'GET',
    path: '/midway/inputs.js',
    handler: function (request, h) {
      return getInputPlugins(smocks);
    }
  });
};

function getInputPlugins(smocks) {
  const inputs = smocks.inputs.get();
  let script = '';
  _.each(inputs, function (data, id) {
    script = script + 'input["' + id + '"] = ' + data.ui + '\n';
  });
  script = 'var _inputs = function(input) {\n' + script + '\n};';
  return script;
}