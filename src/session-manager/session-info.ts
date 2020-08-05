class SessionInfo {
  public midwaySessions = {};

  public getSessions = () => {
    return this.midwaySessions;
  }

  public setSession = (sessions) => {
    this.midwaySessions = sessions;
  }
}
export default new SessionInfo();