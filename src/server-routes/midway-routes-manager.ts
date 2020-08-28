import Smocks from './../smocks/index';
import MidwayServer from './midway-system-routes';
import * as Logger from 'testarmada-midway-logger';
import SessionManager from './../session-manager/session-manager';
import MidwayRoutesInfo from './midway-routes-info';

export const addVarinatsToSessionRoutes = (currentRouteObject, smockRouteObject) => {
  for (const variant in currentRouteObject._variants) {
    const variantToSet = {
      id: undefined,
      label: undefined,
      handler: undefined,
      input: undefined
    };
    const currentVariant = currentRouteObject._variants[variant];
    if (currentVariant._id != 'default') {
      variantToSet.id = currentVariant._id;
      variantToSet.label = currentVariant._label;
      variantToSet.handler = currentVariant.handler;
      variantToSet.input = currentVariant._input;
      smockRouteObject.variant(variantToSet);
    }
  }
};

export const addRoutesToSessions = (midwayOptions) => {

  const sessions = SessionManager.addSessions(midwayOptions.sessions);
  Smocks.addSessions(sessions);

  for (const sessionId in sessions) {
    for (let routeCount = 0; routeCount < midwayOptions.userRoutes.length; routeCount++) {
      const sessionRoute = {
        id: undefined,
        label: undefined,
        path: undefined
      };
      const currentRoute = midwayOptions.userRoutes[routeCount];
      const currentRouteData = currentRoute.routeData;
      const currentRouteObject = currentRoute.routeObject;

      Logger.debug('Current Route: [' + sessionId + ']: ' + JSON.stringify(currentRouteData, null, 2));
      Logger.debug('Current RouteObject: [' + sessionId + ']: ' + currentRouteObject);

      for (const routeInfo in currentRouteData) {
        sessionRoute[routeInfo] = currentRouteData[routeInfo];
      }
      sessionRoute.id = sessionRoute.id + '-' + sessionId;
      sessionRoute.label = sessionRoute.label + '-session-id-' + sessionId;
      sessionRoute.path = '/' + sessionId + sessionRoute.path;
      const smockRouteObject = Smocks.route(sessionRoute);

      const sessionRouteData = { 'routeObject': smockRouteObject, 'routeData': sessionRoute };
      MidwayRoutesInfo.addSessionRoute(sessionRouteData);

      // Add variants for routes
      addVarinatsToSessionRoutes(currentRouteObject, smockRouteObject);
    }
  }

  MidwayRoutesInfo.lockRoutes(); // Routes should not be updated as midway is started/stopped for same node process
};

export const addMidwayServerAPIs = () => {
  for (const route in MidwayServer) {
    const routeId = MidwayServer[route].id;
    const routeExists = Smocks.findRoute(routeId);
    if (routeExists === undefined) {
      Smocks.route(MidwayServer[route]);
    }
  }
};

export const addGlobalVariant = (globalVariants, userRoutes, variant) => {
  globalVariants.push(variant);
  userRoutes.forEach(function (userRouteData) {
    userRouteData.routeObject.variant(variant);
  });
};

export const addGlobalVariantForSingleRoute = (globalVariants, smockRouteObject) => {
  globalVariants.forEach(function (globalVariant) {
    smockRouteObject.variant(globalVariant);
  });
};