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
export { };
let midwaySessions = {};

module.exports = {
  DEFAULT_SESSION: 'default',

  addSessions: function (sessions) {
    midwaySessions = sessions;
  },

  getRouteWithoutSession: function (path) {
    const formattedPath = this.formatPath(path);
    for (const session in midwaySessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      if (regex.test(formattedPath)) {
        path = formattedPath.replace('/' + session, "");
        return path;
      }
    }

    return path;
  },

  getSessionId: function (path) {
    var path = this.formatPath(path);
    for (const session in midwaySessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      const dashRegex = new RegExp('^\\/.+-' + session, 'i');
      if (regex.test(path) || dashRegex.test(path)) {
        return session;
      }
    }

    return this.DEFAULT_SESSION;
  },
  formatPath: function (path) {
    return path.replace(/[{}}]\.*/g, '');
  }
};