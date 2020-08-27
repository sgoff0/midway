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