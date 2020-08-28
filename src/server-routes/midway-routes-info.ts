let isRoutesLocked = false;
const sessionRoutes = [];

export default {

  addSessionRoute: function (sessionRoute) {
    if (!isRoutesLocked) {
      sessionRoutes.push(sessionRoute);
    }
  },

  lockRoutes: function () {
    isRoutesLocked = true;
  },

  getUserRoutesForSession: function (sessionId) {
    const routes = {};
    const regex = new RegExp('^\\/' + sessionId, 'i');

    for (const route in sessionRoutes) {
      const routeObject = sessionRoutes[route].routeObject;
      const path = routeObject._path;

      if (regex.test(path)) {
        routes[routeObject._id] = routeObject;
      }
    }

    return routes;
  }
};