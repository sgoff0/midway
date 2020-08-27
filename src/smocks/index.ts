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
const _ = require('lodash');
const Logger = require('testarmada-midway-logger');
const Route = require('./route-model');
const Variant = require('./variant-model');
// const Plugin = require('./plugin-model');
const SessionManager = require('./admin/api/util/session-manager');

const _routes = [];
const _plugins = [];
const _variants = {};
const _profiles = {};
const _actions = {};

const smocksInstance = {
  _id: undefined,
  _connection: undefined,
  _executionContext: undefined,
  state: undefined,

  id: function (id) {
    if (!id) {
      return smocksInstance._id;
    }
    smocksInstance._id = id;
    return smocksInstance;
  },

  connection: function (connection) {
    if (connection) {
      smocksInstance._connection = connection;
    }
    return smocksInstance._connection;
  },

  addSessions: function (sessions) {
    if (sessions) {
      SessionManager.addSessions(sessions);
    }
  },

  route: function (data) {
    if (!data.path) {
      throw new Error('Routes must be in the form of {path: "...", method: "..."}');
    } else {
      const route = new Route(data, smocksInstance);
      _routes.push(route);
      return route;
    }
  },

  method: function (route, method) {
    if (route.hasVariants()) {
      // we need a new route
      const _route = this.route({ path: route.path });
      _route._method = method;
      return _route;
    } else {
      // we can repurpose the current route
      route._method = method;
      return route;
    }
  },

  variant: function (data) {
    const variant = new Variant(data, this);
    _variants[variant.id()] = variant;
    return variant;
  },

  profile: function (id, profile) {
    _profiles[id] = profile;
  },

  action: function (id, options) {
    if (!options) {
      options = id;
      id = options.id;
    } else {
      options.id = id;
    }

    _actions[id] = options;
    return this;
  },

  actions: {
    get: function () {
      return _actions;
    },
    execute: function (id, input, request) {
      const action = _actions[id];
      if (!action) {
        return false;
      } else {
        action.handler.call(smocksInstance._executionContext(request), input);
        return true;
      }
    }
  },

  profiles: {
    applyProfile: function (profile, request) {
      if (_.isString(profile)) {
        profile = _profiles[profile];
      }
      if (profile) {
        // reset the state first
        smocksInstance.state.resetRouteState(request);
        _.each(_routes, function (route) {
          route.applyProfile((route._id && profile[route._id]) || {}, request);
        });

        // FIXME we're only resetting global plugin state where we should be saving that in a profile
        smocksInstance.plugins.resetInput(request);
        return true;
      } else {
        return false;
      }
    },

    get: function (id) {
      if (!id) {
        return _profiles;
      }
      return _profiles[id];
    }
  },

  // plugin: function (data) {
  //   const plugin = new Plugin(data, this);
  //   if (plugin.plugin) {
  //     plugin.plugin(this);
  //   }
  //   _plugins.push(plugin);
  //   return this;
  // },

  plugins: {
    get: function () {
      return _plugins;
    },

    resetInput: function (request) {
      const state = smocksInstance.state.routeState(request);
      const pluginState = state._pluginState = {};
      _.each(_plugins, function (plugin) {
        const input = plugin.input();
        if (input) {
          pluginState[plugin.id()] = {};
          _.each(input, function (data, id) {
            smocksInstance.plugins.updateInput(plugin.id(), id, data.defaultValue, request);
          }, this);
        }
      });
    },

    updateInput: function (pluginId, id, value, request) {
      const input = smocksInstance.state.routeState(request)._pluginState;
      let pluginInput = input[pluginId];
      if (!pluginInput) {
        pluginInput = {};
        input[pluginId] = pluginInput;
      }
      pluginInput[id] = value;
    },

    getInput: function (request) {
      return smocksInstance.state.routeState(request)._pluginState;
    },

    getInputValue: function (pluginId, id, request) {
      const input = smocksInstance.state.routeState(request)._pluginState[pluginId];
      return input && input[id];
    }
  },

  routes: {
    get: function (id) {
      if (!id) {
        return _routes;
      }
      for (let i = 0; i < _routes.length; i++) {
        if (_routes[i].id() === id) {
          return _routes[i];
        }
      }
    }
  },

  variants: {
    get: function (id) {
      if (!id) {
        return _.map(_variants, function (variant) { return variant; });
      }
      return _variants[id];
    }
  },

  global: function () {
    return this;
  },

  done: function () {
    return this;
  },

  findRoute: function (id) {
    return _.find(_routes, function (route) {
      return route._id === id;
    });
  },

  _sanitizeOptions: function (options) {
    options = _.clone(options || {});
    if (options.state) {
      if (options.state === 'cookie' || options.state === 'request') {
        const CookieState = require('./state/cookie-state');
        options.state = new CookieState();
      } else if (options.state === 'static') {
        options.state = require('./state/static-state');
      }
      if (!options.state.initialize) {
        Logger.error('state handler *must* implement "initialize" method: ', options.state);
        process.exit(1);
      }
    } else {
      options.state = require('./state/static-state');
    }

    return options;
  },

  _sanityCheckRoutes: function () {
    const routeIndex = {};
    _.each(_routes, function (route) {
      let id = route.id();
      if (routeIndex[id]) {
        Logger.error('duplicate route key "' + id + '"');
        process.exit(1);
      } else {
        routeIndex[id] = true;
      }

      const variants = route.variants();
      const variantIndex = {};
      _.each(variants, function (variant) {
        id = variant.id();
        if (variantIndex[id]) {
          Logger.error('duplicate variant key "' + id + '" for route "' + route.id() + '"');
          process.exit(1);
        } else {
          variantIndex[id] = true;
        }
      });
    });
  },

  _executionContext: function (request, route, plugin) {
    const variant = route.getActiveVariant(request);
    const details = {
      route: route,
      variant: variant
    };

    return {
      state: function (id, value) {
        if (value !== undefined) {
          smocksInstance.state.userState(request, details)[id] = value;
        } else {
          return smocksInstance.state.userState(request, details)[id];
        }
      },
      input: function (id) {
        if (plugin) {
          return smocksInstance.plugins.getInputValue(plugin.id(), id, request);
        }
        return route && route.getInputValue(id, request);
      },
      meta: function (id) {
        return route && route.getMetaValue(id);
      },
      route: route,
      variant: variant
    };
  }
};

// TODO sgoff0 do I need these plugins?
// require('./plugins/har-viewer-plugin');
// require('./plugins/proxy-plugin');

// module.exports = smocksInstance;
export default smocksInstance;