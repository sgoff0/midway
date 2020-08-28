import * as Logger from 'testarmada-midway-logger';
import Utils from './../utils/common-utils';
import Constants from '../constants';

class StateManager {
  public state = {}

  public addState = (route, stateKey, stateValue) => {
    const sessionId = Utils.getSessionId({ route: route.variant._route });
    Logger.debug('Setting stateKey and stateValue with session Id', stateKey, stateValue, sessionId);
    if (this.state[sessionId] === undefined) {
      this.state[sessionId] = {};
    }
    this.state[sessionId][stateKey] = stateValue;
  }

  public getState = (route, stateKey) => {
    const sessionId = Utils.getSessionId({ route: route.variant._route });
    if (this.state[sessionId] === undefined) {
      return undefined;
    }
    return this.state[sessionId][stateKey];
  }

  public clearState = (sessionId) => {
    if (sessionId) {
      delete this.state[sessionId];
    } else {
      delete this.state[Constants.DEFAULT_SESSION];
    }
  }
}

export default new StateManager();