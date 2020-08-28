import * as _ from 'lodash';
const mimeTypes = require('mime-types');
import * as fs from 'fs';
import * as Path from 'path';
import Route from './route-model';
import * as Hapi from '@hapi/hapi';
import * as util from 'util';
import Smocks from './index';
const readFile = util.promisify(fs.readFile);

/**
 * Variants allows to return a different data set for a given mocked route. 
 * Variants can be selected in the admin UI to determine what type of response a route should have. 
 * Routes are defined using the variant method on the Route object (returned by calling the route method). 
 */
export interface VariantData {
  // the variant id - used for the RESTful admin API and profile settings
  id?: string,
  // the variant label - used for display on the admin panel
  label?: string,
  // the HAPI route handler which provides the route response
  handler?: (request: Hapi.Request, h: Hapi.ResponseToolkit) => Hapi.Lifecycle.ReturnValue,
  input?: any,
  appliesToRoute?: any,
}
class Variant {
  private _id;
  private _label;
  public handler;
  private _route: Route;
  private _input;
  public appliesToRoute;
  public state;
  public onActivate;

  public constructor(data: VariantData = {}, route: Route) {
    // if (_.isString(data)) {
    //   data = { id: data };
    // }
    this._id = data.id || 'default';
    this._label = data.label;
    this.handler = data.handler;
    this._route = route;
    this._input = data.input;
    this.appliesToRoute = data.appliesToRoute;
  }


  public id = () => {
    return this._id;
  }

  public label = (label) => {
    if (label) {
      this._label = label;
      return this;
    } else {
      return this._label;
    }
  }

  public input = (input) => {
    if (input) {
      this._input = input;
      return this;
    } else {
      return this._input;
    }
  }

  // public plugin = (plugin) => {
  //   return this._route.plugin(plugin);
  // }

  public respondWith = (handler) => {
    this.handler = handler;
    this.done();
    return this;
  }

  public respondWithFile = (options) => {
    return this.respondWith(async (request, h: Hapi.ResponseToolkit) => {
      options = options || {};
      if (_.isString(options)) {
        options = {
          path: options
        };
      }
      if (options.path) {
        const path = Path.resolve(options.path.replace(/\{([^\}]+)\}/g, (match, token) => {
          let val = request.params[token];
          if (!val) {
            val = this.state(token);
          }
          return val || match;
        }));
        // a specific file name was provided
        try {
          const stream = await readFile(path, 'utf-8');
          const mimeType = mimeTypes.lookup(path);
          return h.response(stream).type(mimeType).code(options.code || 200);
        } catch (err) {
          if (err.code === 'ENOENT') {
            // doesn't exist
            return h.response(path + ' not found').code(404);
          } else {
            return err;
          }
        }
      } else {
        // a specific handler must be provided
        const initOptions = Smocks.initOptions;
        const handlerFunction = initOptions.respondWithFileHandler;
        if (!handlerFunction) {
          return h.response({
            message: 'no file handler function (use smocks "replyWithFileHandler" option)'
          }).code(500);
        }
        handlerFunction({
          request: request,
          h: h,
          route: this._route,
          variant: this,
          options: options,
          smocksOptions: initOptions
        });
      }
    });


    return this.respondWith((request, reply) => {
      // const self = this;
      console.error("Commented out code here around filename");
      // TODO sgoff0 where does filename come from?
      throw new Error("TODO sgoff0 where does filename come from?");
      // fileName = fileName.replace(/\{([^\}]+)\}/g, (match, token) => {
      //   let val = request.params[token];
      //   if (!val) {
      //     val = self.state(token);
      //   }
      //   return val || match;
      // });
      // reply.file(fileName);
    });
  }

  public variant = (...args: any[]) => {
    // This is for the chaining call of route({...}).variant({...}).variant({...}); that users can pass
    // Currently the subsequent call isn't working properly
    // return this._route.variant.apply(this._route, args);
    return this._route.variant.call(this._route, ...args);
  }

  public route = (...args: any[]) => {
    // return this._route.route.apply(this._route, ...args);
    return this._route.route.call(this._route, ...args);
  }

  // public start = (...args: any[]) => {
  //   return this._route.start.apply(this._route, ...args);
  // }

  // public toHapiPlugin = (...args: any[]) => {
  //   return this._route.toHapiPlugin.apply(this._mocker, ...args);
  // }

  public done = () => {
    this._route.done();
  }

  // public global = () => {
  //   return this._route.global();
  // }
}
export default Variant;