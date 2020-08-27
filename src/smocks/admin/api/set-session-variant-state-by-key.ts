export { };
import formatData from './format-data';

module.exports = function (mocker) {
  return function (request, reply, respondWithConfig) {
    const key = request.params.key;
    const payload = request.payload;
    mocker.state.setSessionVariantStateByKey(request, key, payload);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};