import * as Hapi from '@hapi/hapi';
class StaticState {
  public doInitialize = true;
  public ROUTE_STATE = {};
  public USER_STATE = {};
  public SESSION_VARIANT_STATE = {};

  public initialize = (request) => {
    console.log("Calaled initialize");
    // const _doInitialize = this.doInitialize;
    const shouldInitializeNow = this.doInitialize;
    this.doInitialize = false;
    return shouldInitializeNow;
    // callback(undefined, _doInitialize);
  }

  public userState = (request) => {
    return this.USER_STATE;
  }

  public resetUserState = (request, initialState) => {
    this.USER_STATE = initialState;
  }

  public routeState = (request) => {
    return this.ROUTE_STATE;
  }

  public resetRouteState = (request) => {
    this.ROUTE_STATE = {};
  }

  public sessionVariantState = (request) => {
    return this.SESSION_VARIANT_STATE;
  }

  public resetSessionVariantState = (request) => {
    this.SESSION_VARIANT_STATE = {};
  }

  public resetSessionVariantStateByKey = (request, key) => {
    delete this.SESSION_VARIANT_STATE[key];
  }

  public setSessionVariantStateByKey = (request, key, payload) => {
    this.SESSION_VARIANT_STATE[key] = payload;
  }

  public onResponse = (request, h: Hapi.ResponseToolkit) => {
    h.state('__smocks_state', 'static', { encoding: 'none', clearInvalid: true, path: '/' });
  }
}

export default new StaticState();