import * as _ from 'lodash';
const Logger = require('testarmada-midway-logger');
import Variant, { VariantData } from './variant-model';
import { Smocks } from '.';
import * as Hapi from '@hapi/hapi';

export interface RouteData {
  // Handler is the user defined handler.  Everything in midway.route(...)
  handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Hapi.Lifecycle.ReturnValue,
  id: string,
  label: string,
  method: string,
  path: string,
  display?: string,
  group?: string,
  actions?: any,
  config?: any,
  input?: any,
  meta?: any,
  variantLabel?: string,
}

class Route {
  private _mocker: Smocks;
  private _label: string;
  public _path: string;
  public _method: string;
  private _group;
  public _id;
  private _config;
  // private _connection;
  private _input;
  private _meta;
  private _variants;
  public _orderedVariants;
  private _actions;
  private _display;
  private _activeVariant;
  private _hasVariants;
  public mockedDirectory: string;

  public constructor(data: RouteData, mocker: Smocks) {
    this._mocker = mocker;
    this._label = data.label;
    this._path = data.path;
    this._method = data.method || 'GET';
    this._group = data.group;
    this._id = data.id || this._method + ':' + this._path;
    this._config = data.config;
    // this._connection = data.connection;
    this._input = data.input;
    this._meta = data.meta;
    this._variants = {};
    this._orderedVariants = [];
    this._actions = data.actions || {};
    this._display = data.display;
    this._activeVariant = 'default';

    if (data.handler) {
      this.variant({
        id: 'default',
        label: data.variantLabel,
        handler: data.handler
      });
    }

    if (data.actions) {
      this._actions = data.actions;
    }

  }

  public actions = {
    get: () => {
      return this._actions;
    },
    execute: (id, input, request) => {
      const action = this._actions[id];
      if (!action) {
        return null;
      } else {
        return action.handler.call(executionContext(self, request), input);
      }
    }

  }

  public id = () => {
    return this._id;
  }

  public method = () => {
    return this._method;
  }

  public group = () => {
    return this._group;
  }

  // public connection = () => {
  //   return this._connection;
  // }

  public path = () => {
    return this._path;
  }

  public action = (id, options) => {
    if (!options) {
      options = id;
      id = options.id;
    } else {
      options.id = id;
    }

    this._actions[id] = options;
    return this;
  }

  public display = (displayFunc) => {
    if (!displayFunc) {
      return this._display;
    } else {
      this._display = displayFunc;
      return this;
    }
  }

  public getDisplayValue = (request) => {
    if (this._display) {
      return this._display.call(executionContext(this, request));
    }
  }

  public label = (label?) => {
    if (!label) {
      return this._label;
    }
    this._label = label;
    return label;
  }

  public applyProfile = (profile, request) => {
    // set the default input and then we'll override
    this.resetRouteVariant(request);
    this.resetSelectedInput(request);

    this.selectVariant(profile.activeVariant, request);
    const routeInput = this.selectedRouteInput(request);

    const selectedRouteInput = this.selectedRouteInput(request);
    _.extend(selectedRouteInput, profile.selections && profile.selections.route);

    _.each(this.variants(), (variant) => {
      const selectedVariantInput = this.selectedVariantInput(variant, request);
      const selections = profile.selections && profile.selections.variants && profile.selections.variants[variant.id()];
      if (selections) {
        _.extend(selectedVariantInput, selections);
      }
    });
  }

  public variant = (data: VariantData) => {
    const variant = new Variant(data, this);
    this._variants[variant.id()] = variant;
    this._orderedVariants.push(variant);

    if (!this._hasVariants) {
      this._hasVariants = true;
    }

    return variant;
  }

  public variants = () => {
    const rtn = [];
    const index = {};
    _.each(this._orderedVariants, (variant) => {
      rtn.push(variant);
      index[variant.id()] = true;
    });
    _.each(this._mocker.variants.get(), (variant: Variant) => {
      if (!index[variant.id()]) {
        if (!variant.appliesToRoute || variant.appliesToRoute(this)) {
          rtn.push(variant);
        }
      }
    });
    return rtn;
  }

  public getVariant = (id?) => {
    const rtn = this._variants[id];
    if (rtn) {
      return rtn;
    }
    return this._mocker.variants.get(id);
  }

  public selectVariant = (id, request) => {
    let match = false;
    _.each(this._variants, (variant) => {
      if (variant.id() === id) {
        match = true;
        variant.onActivate && variant.onActivate.call(executionContext(this, request));
      }
    });
    if (!match) {
      _.each(this._mocker.variants.get(), (variant: Variant) => {
        if (variant.id() === id) {
          match = true;
          variant.onActivate && variant.onActivate.call(executionContext(this, request), this);
        }
      });
    }

    if (match) {
      this._mocker.state.routeState(request)[this._id]._activeVariant = id;
      this._activeVariant = id;
    } else {
      return new Error("no variants found with id : " + id);
    }
    return undefined;
  }


  public getActiveVariant = (request: Hapi.Request) => {
    const id = this.activeVariant(request);
    return _.find(this.variants(), (variant) => {
      return variant.id() === id;
    });
  }

  public hasVariants = () => {
    return this._hasVariants;
  }


  // public plugin = (plugin) => {
  //   return this._mocker.plugin(plugin);
  // }

  public respondWith = (responder) => {
    const variant = this.variant({ id: 'default' });
    return variant.respondWith(responder);
  }

  public respondWithFile = (options) => {
    const variant = this.variant({ id: 'default' });
    return variant.respondWithFile(options);
  }

  public activeVariant = (request: Hapi.Request) => {
    const variantFromRequestHeader = request.headers['x-request-variant'];
    const variantFromRouteState = this._mocker.state.routeState(request)[this._id]._activeVariant;

    const sessionFromRequestHeader = request.headers["x-request-session"];
    let variantFromSession;
    if (sessionFromRequestHeader) {
      const sessionVariantState = this._mocker.state.sessionVariantState(request)[sessionFromRequestHeader];
      variantFromSession = sessionVariantState ? sessionVariantState[this._id] : undefined;
    }

    // x-request-variant request header takes precedence over variant set in state
    // causes an http 500 response status code if a variant is set that doesn't actually exist
    return variantFromRequestHeader || variantFromSession || variantFromRouteState;

  }

  public done = () => {
    return this._mocker;
  }

  public input = (input?) => {
    if (input) {
      this._input = input;
      return this;
    } else {
      return this._input;
    }
  }

  public config = (config?) => {
    if (config) {
      this._config = config;
      return this;
    } else {
      return this._config;
    }
  }

  public meta = (meta) => {
    if (meta) {
      this._meta = meta;
      return this;
    } else {
      return this._meta;
    }
  }

  // reset selected route variant
  public resetRouteVariant = (request) => {
    const routeState: any = this._mocker.state.routeState(request)[this.id()] = {};
    const variants = this.variants();
    for (let i = 0; i < variants.length; i++) {
      routeState._activeVariant = variants[i].id();
      this._activeVariant = variants[i].id();
      break;
    }
  }

  public resetSelectedInput = (request) => {
    Logger.debug("Reset Selected Input");
    let rootInput = this._mocker.state.routeState(request)[this.id()];
    if (!rootInput) {
      this._mocker.state.routeState(request)[this.id()] = {};
      rootInput = this._mocker.state.routeState(request)[this.id()];
    }
    const selectedRouteInput = rootInput._input = {};
    rootInput._variantInput = {};
    const route = this;

    function setDefaultValue(key, data, obj) {
      const value = _.isFunction(data.defaultValue) ? data.defaultValue.call(executionContext(route, request)) : data.defaultValue;
      if (value !== undefined) {
        obj[key] = value;
      }
    }

    _.each(this.input(), (data, key) => {
      setDefaultValue(key, data, selectedRouteInput);
    });

    _.each(this.variants(), (variant) => {
      // console.log("This (SVI): ", route);
      route.selectVariantInput({}, variant, request);
      const selectedVariantInput = route.selectedVariantInput(variant, request);
      _.each(variant.input(), (data, key) => {
        setDefaultValue(key, data, selectedVariantInput);
      });
    });
  }

  public selectRouteInput = (selectedInput, request) => {
    const input = this._mocker.state.routeState(request);
    input[this.id()]._input = selectedInput || {};
    return this;
  }

  public selectedRouteInput = (request) => {
    const input = this._mocker.state.routeState(request);
    return input[this.id()]._input;
  }

  public getInputValue = (id, request) => {
    const routeInput = this.selectedRouteInput(request);
    if (!_.isUndefined(routeInput[id])) {
      return routeInput[id];
    }

    const variant = this.getActiveVariant(request);
    const variantInput = this.selectedVariantInput(variant, request);
    return variantInput[id];
  }

  public selectedVariantInput = (variant: Variant, request: Hapi.Request) => {
    const smocksState = this._mocker.state;
    // TODO sgoff0 first read files
    Logger.warn("Routes not yet loaded from file, make sure they are being read then this may work");
    const smocksRouteState = smocksState.routeState(request);
    const routeIdState = smocksRouteState[this._id];
    let input = routeIdState?._variantInput;
    // let input = this._mocker.state.routeState(request)[this.id()]._variantInput;
    if (!input) {
      input = this._mocker.state.routeState(request)[this.id()]._variantInput = {};
    }
    input = input[variant.id()];
    if (!input) {
      input = input[variant.id()] = {};
    }
    return input;
  }

  public selectVariantInput = (selectedInput, variant, request) => {
    const routeState = this._mocker.state.routeState(request);
    const id = this.id();
    const routeStateForId = routeState[id];
    const variantInput = routeStateForId?._variantInput;
    const input = this._mocker.state.routeState(request)[this.id()];
    input._variantInput[variant.id()] = selectedInput;
  }

  public getMetaValue = (id) => {
    return this._meta && this._meta[id];
  }

  // public start = () => {
  //   this._mocker.start.apply(this._mocker, arguments);
  // }

  // public toHapiPlugin = () => {
  //   return this._mocker.toHapiPlugin.apply(this._mocker, arguments);
  // }

  public _handleRequest = async (request, h: Hapi.ResponseToolkit) => {
    const mocker = this._mocker;
    const variant = this.getActiveVariant(request);

    if (variant) {
      if (variant.handler) {
        const context = executionContext(this, request);
        return await variant.handler.call(context, request, h);
      } else {
        Logger.error('no variant handler found for ' + this._path + ':' + variant.id());
        return h.response('no variant handler found for ' + this._path + ':' + variant.id()).code(500);
      }
    } else {
      Logger.error('no selected handler found for ' + this._path);
      return h.response('no selected handler found for ' + this.path).code(500);
    }
  }

  public route = (data) => {
    // if (!this.isDone) {
    //   this.done();
    // }

    return this._mocker.route(data);
  }

  // public global = () => {
  //   return this._mocker.global();
  // }

}

export default Route;

function executionContext(route, request) {
  const variant = route.getActiveVariant(request);
  return {
    state: function (id, value) {
      const details = {
        route: route,
        variant: variant
      };

      if (value !== undefined) {
        route._mocker.state.userState(request, details)[id] = value;
      } else {
        return route._mocker.state.userState(request, details)[id];
      }
    },
    input: function (id) {
      return route.getInputValue(id, request);
    },
    meta: function (id) {
      return route.getMetaValue(id);
    },
    route: route,
    variant: variant
  };
}