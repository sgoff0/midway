class SmocksSessionManager {
  private midwaySessions = {};
  private DEFAULT_SESSION = 'default';

  public addSessions = (sessions) => {
    this.midwaySessions = sessions;
  }

  public getRouteWithoutSession = (path) => {
    const formattedPath = this.formatPath(path);
    for (const session in this.midwaySessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      if (regex.test(formattedPath)) {
        path = formattedPath.replace('/' + session, "");
        return path;
      }
    }

    return path;
  }

  public getSessionId = (pathInput) => {
    const path = this.formatPath(pathInput);
    for (const session in this.midwaySessions) {
      const regex = new RegExp('^\\/' + session, 'i');
      const dashRegex = new RegExp('^\\/.+-' + session, 'i');
      if (regex.test(path) || dashRegex.test(path)) {
        return session;
      }
    }

    return this.DEFAULT_SESSION;
  }
  public formatPath = (path) => {
    return path.replace(/[{}}]\.*/g, '');
  }
}
export default new SmocksSessionManager();