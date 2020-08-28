/**
 * Exposes HAPI integration for the mock server
 */
import smocks from './index';
import adminApi from './admin/index';
import * as _ from 'lodash';
import Route from './route-model';
import * as Hapi from '@hapi/hapi';

// const Logger = require('testarmada-midway-logger');
import * as Logger from 'testarmada-midway-logger';

const _inputs = {
  boolean: require('./admin/api/input-plugins/checkbox'),
  text: require('./admin/api/input-plugins/text'),
  select: require('./admin/api/input-plugins/select'),
  multiselect: require('./admin/api/input-plugins/multiselect')
};

const defaultSmocksOptions = {
  state: undefined,
};

const defaultHapiPluginOptions = {
  onRegister: undefined
};

export default {
  toPlugin: function (smocksOptions = defaultSmocksOptions) {
    return {
      name: 'smocks-plugin',
      version: '2.0.0',
      register: function (server, options) {
        smocks._sanityCheckRoutes();
        // allow for plugin state override
        // if (register.overrideState) {
        //   smocksOptions.state = register.overrideState;
        // }
        smocksOptions = smocks._sanitizeOptions(smocksOptions);
        // deprecate smocks.initOptions in favor of smocks.options
        smocks.initOptions = smocks.options = smocksOptions;
        smocks.state = smocksOptions.state;

        configServer(server);
      }
    };
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
    const server = new Hapi.Server({
      ...hapiServerOptions,
      ...hapiConnectionOptions
    });

    configServer(server);
    server.start();
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
<<<<<<< HEAD
function wrapReply(request, reply) {
  const rtn = function () {
    const response = reply.apply(this, arguments);
=======
function wrapReply(request, h: Hapi.ResponseToolkit, plugins) {
  const rtn = function (...args: any[]) {
    const response = h.response.apply(this, ...args);
>>>>>>> User endpoint working but gives chunked content error via postman, admin doesn't show user route
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
  _.each(['file', 'view', 'close', 'proxy', 'redirect', 'response', 'code'], function (key) {
    rtn[key] = function (...args: any[]) {
      h[key].apply(h, ...args);
    };
  });
  return rtn;
}

function configServer(server: Hapi.Server) {
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

      server.route({
        method: route.method(),
        path: route.path(),
        // config: route.config(),
        handler: async function (request, h: Hapi.ResponseToolkit) {
          // TODO sgoff0 figure me out
          // Logger.warn("Temp todo on hapi return");

          // return "Temp TODO";

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

          async function doExecute() {
            if (smocks.state.onRequest) {
              smocks.state.onRequest(request, h);
            }

            let pluginIndex = 0;
            async function handlePlugins() {
              // const plugin = _plugins[pluginIndex++];
              // if (plugin) {
              //   // Thus far this block is false
              //   if (plugin.onRequest) {
              //     plugin.onRequest.call(smocks._executionContext(request, route, plugin), request, h, handlePlugins);
              //   } else {
              //     handlePlugins();
              //   }
              // } else {
              Logger.warn("Not currently wrapping reply (h)");
              // const wrappedH = wrapReply(request, h, _plugins);
              // route._handleRequest.call(route, request, wrappedH);
              // const retVal = await route._handleRequest.call(route, request, h);
              const retVal = await route._handleRequest(request, h);
              // return "Message to show";
              return retVal;
              // }
              // return "Oops - Fallback message";
            }

            return handlePlugins();
          }

          // Called on request to endpoint such as /portal
          // Currently only static state is supported, and it's not async
          const shouldPerformInitialization = smocks.state.initialize(request);
          if (shouldPerformInitialization) {
            doInit();
          }
          return await doExecute();
          // smocks.state.initialize(request, function (err, performInitialization) {
          //   // Only seems to be true the first time
          //   if (performInitialization) {
          //     doInit();
          //   }
          // });

          // return "TEMP TODO";
        }
      });
    }
  });

  adminApi(server, smocks);
}