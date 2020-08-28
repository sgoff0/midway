/**
 * Exposes HAPI integration for the mock server
 */
import smocks from './index';
import adminApi from './admin/index';
import * as Hapi from '@hapi/hapi';
import * as _ from 'lodash';
import Route from './route-model';

const Logger = require('testarmada-midway-logger');

const _inputs = {
  boolean: require('./admin/api/input-plugins/checkbox'),
  text: require('./admin/api/input-plugins/text'),
  select: require('./admin/api/input-plugins/select'),
  multiselect: require('./admin/api/input-plugins/multiselect')
};

export default {
  toPlugin: function (hapiPluginOptions, smocksOptions) {
    const register: any = function (server, pluginOptions, next) {
      function _next(err?) {
        if (err) {
          next(err);
        } else {
          configServer(server);
          next();
        }
      }

      hapiPluginOptions = hapiPluginOptions || {};
      smocksOptions = smocksOptions || {};

      smocks._sanityCheckRoutes();
      // allow for plugin state override
      if (register.overrideState) {
        smocksOptions.state = register.overrideState;
      }
      smocksOptions = smocks._sanitizeOptions(smocksOptions);
      // deprecate smocks.initOptions in favor of smocks.options
      smocks.initOptions = smocks.options = smocksOptions;
      console.log(".toPlugin Setting smocksOptions.state to smocks", smocksOptions.state);
      smocks.state = smocksOptions.state;

      if (hapiPluginOptions.onRegister) {
        hapiPluginOptions.onRegister(server, pluginOptions, _next);
      } else {
        _next();
      }
    };
    return register;
  },

  start: (hapiOptions, smocksOptions) => {
    if (!smocks.id()) {
      throw new Error('You must set an id value for the smocks instance... smocks.id("my-project")');
    }

    hapiOptions = hapiOptions || {};
    const hapiServerOptions = hapiOptions.server;
    let hapiConnectionOptions = hapiOptions.connection;
    if (!hapiServerOptions && !hapiConnectionOptions) {
      hapiConnectionOptions = hapiOptions;
    }
    smocksOptions = smocks._sanitizeOptions(smocksOptions || {});
    console.log(".start Setting smocksOptions.state to smocks", smocksOptions.state);
    smocks.state = smocksOptions.state;
    smocks.initOptions = smocksOptions;
    smocks._sanityCheckRoutes();

    if (!hapiConnectionOptions.routes) {
      hapiConnectionOptions.routes = { cors: true };
    }

    const server = new Hapi.Server(hapiServerOptions);
    server.connection(hapiConnectionOptions);

    configServer(server);
    server.start(function (err) {
      if (err) {
        Logger.error(err.message);
        process.exit(1);
      }
    });
    Logger.info('started smocks server on ' + hapiConnectionOptions.port + '.  visit http://localhost:' + hapiConnectionOptions.port + '/midway to configure');

    return {
      server: server,
      start: (options) => {
        // TODO sgoff0 self doens't exist here
        (this as any).start(options);
        // self.start(options);
      }
    };
  }
};


// TODO sgoff0 what does this do? Added in https://github.com/jhudson8/smocks/commit/5a354862a7c98a18d47f114cf7ed30987d7ada10
// Cors related?
function wrapReply(request, reply) {
  const rtn = function () {
    const response = reply.apply(this, arguments);
    if (smocks.state.onResponse) {
      smocks.state.onResponse(request, response);
    }
    // _.each(plugins, function (plugin) {
    //   if (plugin.onResponse) {
    //     plugin.onResponse(request, response);
    //   }
    // });
    return response;
  };
  _.each(['continue', 'file', 'view', 'close', 'proxy', 'redirect'], function (key) {
    rtn[key] = function () {
      reply[key].apply(reply, arguments);
    };
  });
  return rtn;
}

function configServer(server) {
  // set the input types on the smocks object
  smocks.input = function (type, options) {
    _inputs[type] = options;
  };
  smocks.inputs = {
    get: function () {
      return _inputs;
    }
  };

  const _routes = smocks.routes.get();
  // const _plugins = smocks.plugins.get();

  _.each(_routes, (route: Route) => {
    if (route.hasVariants()) {

      let connection = server;

      if (route.connection()) {
        connection = server.select(route.connection());
      }
      connection.route({
        method: route.method(),
        path: route.path(),
        config: route.config(),
        handler: function (request, reply) {

          function doInit() {
            _.each(_routes, function (route) {
              route.resetRouteVariant(request);
              route.resetSelectedInput(request);
            });
            // smocks.plugins.resetInput(request);
            const initialState = JSON.parse(JSON.stringify(smocks.initOptions.initialState || {}));
            smocks.state.resetUserState(request, initialState);
            console.log("Smocks state: ", smocks.state);
          }

          function doExecute() {
            if (smocks.state.onRequest) {
              smocks.state.onRequest(request, reply);
            }

            const pluginIndex = 0;
            function handlePlugins() {
              // const plugin = _plugins[pluginIndex++];
              // if (plugin) {
              //   if (plugin.onRequest) {
              //     plugin.onRequest.call(smocks._executionContext(request, route, plugin), request, reply, handlePlugins);
              //   } else {
              //     handlePlugins();
              //   }
              // } else {
              reply = wrapReply(request, reply);
              route._handleRequest.call(route, request, reply);
              // }
            }

            handlePlugins();
          }

          smocks.state.initialize(request, function (err, performInitialization) {
            if (performInitialization) {
              doInit();
            }
            doExecute();
          });
        }
      });
    }
  });

  adminApi(server, smocks);
}