import * as _ from 'lodash';
const Logger = require('testarmada-midway-logger');
import Route from './route-model';
import Variant from './variant-model';
// const SessionManager = require('./admin/api/util/session-manager');
import SessionManager from './admin/api/util/session-manager';

import staticState from './state/static-state';


export class Smocks {
  public _id: string;
  private _connection;
  private _routes = [];
  private _plugins = [];
  private _variants: Record<string, Variant> = {};
  private _profiles = {};
  private _actions = {};
  public options = {};

  public input = undefined;
  public inputs = undefined;

  public state = undefined;

  private static instance: Smocks;
  private constructor() {
  }
  public static getInstance(): Smocks {
    if (!Smocks.instance) {
      Smocks.instance = new Smocks();
    }
    return Smocks.instance;
  }

  public plugins = {
    get: () => {
      return this._plugins;
    },

    resetInput: (request) => {
      const state = this.state.routeState(request);
      const pluginState = state._pluginState = {};
      _.each(this._plugins, (plugin) => {
        const input = plugin.input();
        if (input) {
          pluginState[plugin.id()] = {};
          _.each(input, (data: any, id) => {
            this.plugins.updateInput(plugin.id(), id, data.defaultValue, request);
          });
        }
      });
    },

    updateInput: (pluginId, id, value, request) => {
      const input = this.state.routeState(request)._pluginState;
      let pluginInput = input[pluginId];
      if (!pluginInput) {
        pluginInput = {};
        input[pluginId] = pluginInput;
      }
      pluginInput[id] = value;
    },

    getInput: (request) => {
      return this.state.routeState(request)._pluginState;
    },

    getInputValue: (pluginId, id, request) => {
      const input = this.state.routeState(request)._pluginState[pluginId];
      return input && input[id];
    }
  };

  public routes = {
    get: (id?) => {
      if (!id) {
        return this._routes;
      }
      for (let i = 0; i < this._routes.length; i++) {
        if (this._routes[i].id() === id) {
          return this._routes[i];
        }
      }
    }
  }

  public variants = {
    get: (id?) => {
      if (!id) {
        return _.map(this._variants, (variant: Variant) => { return variant; });
        // return this._vari;
      }
      return this._variants[id];
    }
  }

  public actions = {
    get: () => {
      return this._actions;
    },
    execute: (id, input, request) => {
      const action = this._actions[id];
      if (!action) {
        return false;
      } else {
        action.handler.call(this._executionContext(request), input);
        return true;
      }
    }
  }

  public profiles = {
    applyProfile: (profile, request) => {
      if (_.isString(profile)) {
        profile = this._profiles[profile];
      }
      if (profile) {
        // reset the state first
        this.state.resetRouteState(request);
        _.each(this._routes, (route) => {
          route.applyProfile((route._id && profile[route._id]) || {}, request);
        });

        // FIXME we're only resetting global plugin state where we should be saving that in a profile
        this.plugins.resetInput(request);
        return true;
      } else {
        return false;
      }
    },

    get: (id) => {
      if (!id) {
        return this._profiles;
      }
      return this._profiles[id];
    }
  }

  public initOptions = undefined;

  public id(id?: string) {
    if (!id) {
      return this._id;
    }
    this._id = id;
    return this;
  }

  public connection(connection) {
    if (connection) {
      this._connection = connection;
    }
    return this._connection;
  }

  public addSessions(sessions) {
    if (sessions) {
      SessionManager.addSessions(sessions);
    }
  }

  public route(data) {
    if (!data.path) {
      throw new Error('Routes must be in the form of {path: "...", method: "..."}');
    } else {
      const route = new Route(data, this);
      this._routes.push(route);
      return route;
    }
  }

  public method(route, method) {
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
  }

  // public variant(data) {
  //   const variant = new Variant(data, this);
  //   this._variants[variant.id()] = variant;
  //   return variant;
  // }

  public profile(id, profile) {
    this._profiles[id] = profile;
  }

  public action(id, options) {
    if (!options) {
      options = id;
      id = options.id;
    } else {
      options.id = id;
    }

    this._actions[id] = options;
    return this;
  }

  // public actions() {
  //   return this._actions;
  // }
  public execute(id, input, request) {
    const action = this._actions[id];
    if (!action) {
      return false;
    } else {
      // TODO
      action.handler.call(this._executionContext(request), input);
      return true;
    }
  }

  public applyProfile(profile, request) {
    if (_.isString(profile)) {
      profile = this._profiles[profile];
    }
    if (profile) {
      // reset the state first
      this.state.resetRouteState(request);
      _.each(this._routes, (route) => {
        route.applyProfile((route._id && profile[route._id]) || {}, request);
      });

      // FIXME we're only resetting global plugin state where we should be saving that in a profile
      this.plugins.resetInput(request);
      return true;
    } else {
      return false;
    }
  }

  public getProfile(id) {
    if (!id) {
      return this._profiles;
    }
    return this._profiles[id];
  }

  public getPlugins() {
    return this._plugins;
  }


  public getRoutes(id) {
    if (!id) {
      return this._routes;
    }
    for (let i = 0; i < this._routes.length; i++) {
      if (this._routes[i].id() === id) {
        return this._routes[i];
      }
    }
  }

  // public getVariants(id) {
  //   if (!id) {
  //     return _.map(this._variants, (variant) => { return variant; });
  //   }
  //   return this._variants[id];
  // }

  // global: function () {
  //   return this;
  // },

  // done: function () {
  //   return this;
  // },

  public findRoute(id) {
    return _.find(this._routes, (route) => {
      return route._id === id;
    });
  }

  public _sanitizeOptions(options) {
    options = _.clone(options || {});
    // always use static state
    options.state = staticState;

    return options;
  }

  public _sanityCheckRoutes() {
    const routeIndex = {};
    _.each(this._routes, (route) => {
      let id = route.id();
      if (routeIndex[id]) {
        Logger.error('duplicate route key "' + id + '"');
        process.exit(1);
      } else {
        routeIndex[id] = true;
      }

      const variants = route.variants();
      const variantIndex = {};
      _.each(variants, (variant) => {
        id = variant.id();
        if (variantIndex[id]) {
          Logger.error('duplicate variant key "' + id + '" for route "' + route.id() + '"');
          process.exit(1);
        } else {
          variantIndex[id] = true;
        }
      });
    });
  }

  public _executionContext(request, route?, plugin?) {
    const variant = route.getActiveVariant(request);
    const details = {
      route: route,
      variant: variant
    };

    return {
      state: (id, value) => {
        if (value !== undefined) {
          this.state.userState(request, details)[id] = value;
        } else {
          return this.state.userState(request, details)[id];
        }
      },
      input: (id) => {
        if (plugin) {
          return this.plugins.getInputValue(plugin.id(), id, request);
        }
        return route && route.getInputValue(id, request);
      },
      meta: (id) => {
        return route && route.getMetaValue(id);
      },
      route: route,
      variant: variant
    };
  }
}

export default Smocks.getInstance();