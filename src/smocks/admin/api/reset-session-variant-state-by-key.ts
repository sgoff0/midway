export { };
import formatData from './format-data';

module.exports = function (mocker) {
  return function (request, reply, respondWithConfig) {
    const key = request.params.key;
    mocker.state.resetSessionVariantStateByKey(request, key);

    reply(respondWithConfig ? formatData(mocker, request) : {});
  };
};