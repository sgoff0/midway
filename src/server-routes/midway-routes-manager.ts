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

// import * as Smocks from 'testarmada-midway-smocks';
import Smocks from './../smocks/index';
import MidwayServer from './midway-system-routes';
import * as Logger from 'testarmada-midway-logger';
import SessionManager from './../session-manager/session-manager';
import MidwayRoutesInfo from './midway-routes-info';

export default {
  addVarinatsToSessionRoutes: function (currentRouteObject, smockRouteObject) {
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
  },

  addRoutesToSessions: function (midwayOptions) {

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
        this.addVarinatsToSessionRoutes(currentRouteObject, smockRouteObject);
      }
    }

    MidwayRoutesInfo.lockRoutes(); // Routes should not be updated as midway is started/stopped for same node process
  },

  addMidwayServerAPIs: function () {
    for (const route in MidwayServer) {
      const routeId = MidwayServer[route].id;
      const routeExists = Smocks.findRoute(routeId);
      if (routeExists === undefined) {
        Smocks.route(MidwayServer[route]);
      }
    }
  },

  addGlobalVariant: function (globalVariants, userRoutes, variant) {
    globalVariants.push(variant);
    userRoutes.forEach(function (userRouteData) {
      userRouteData.routeObject.variant(variant);
    });
  },

  addGlobalVariantForSingleRoute: function (globalVariants, smockRouteObject) {
    globalVariants.forEach(function (globalVariant) {
      smockRouteObject.variant(globalVariant);
    });
  }

};