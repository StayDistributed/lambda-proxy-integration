var amazonApiGatewayQuerystring = require('amazon-api-gateway-querystring');

module.exports = function (configFactory) {

  return function (event, context, callback) {

    var output = {
          statusCode: 200,
          headers: {},
          body: {}
        },
        requestPayload = {
          headers: event.headers,
          accessToken: event.headers && event.headers.Authorization,
          identity: event && event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims || null,
          sourceIP: event && event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp || null,
          stageVariables: event.stageVariables || {},
          path: event.path || '',
          resource: event.resource || '/',
          httpMethod: event.httpMethod || 'DEFAULT',
          origin: event.headers && [event.headers['X-Forwarded-Proto'], event.headers.Host].join('://') || '',
          stage: (event.requestContext && event.requestContext.stage || ''),
          pathParameters: Object.keys(event.pathParameters || {}).reduce(function (params, k) { params[k] = decodeURIComponent(event.pathParameters[k]); return params; }, {}),
          queryStringParameters: event.queryStringParameters || {},
          body: event.body || {}
        };

    var _config = Object.assign(
                    {
                      // base directory where start to map resource_path to files
                      methodsBaseDir: 'resources',

                      // parse querystring looking for nested params
                      // https://www.npmjs.com/package/amazon-api-gateway-querystring
                      parseQueryString: true,

                      // parse event.body looking for JSON structure
                      parseBody: true,

                      // Response Headers
                      headers: {},

                      // function called with response that returns the output object
                      response: function (response) {
                        return {
                          body: response
                        };
                      },

                      // function called with error that returns the output object
                      error: function (error) {
                        return {
                          statusCode: 500,
                          body: {
                            error: error
                          }
                        };
                      }

                    },
                    configFactory({requestPayload, event, context})
                  );


    if (_config.parseQueryString && Object.keys(requestPayload.queryStringParameters).length)
      requestPayload.queryStringParameters = amazonApiGatewayQuerystring(requestPayload.queryStringParameters);


    if (_config.parseBody && event.body) {
      try {
        var parsed = JSON.parse(event.body);
        if (parsed)
          requestPayload.body = parsed;
      } catch (e) {}
    }


    var moduleName = requestPayload.resource + '/' + requestPayload.httpMethod.toUpperCase();

    try {
      var middleware = require(require('path').dirname(module.parent.filename) + '/' + _config.methodsBaseDir + moduleName);
    }
    catch (error) {

      output = _config.error(error);
      output.headers = Object.assign(_config.headers, output.headers);

      if (output.body)
        output.body = JSON.stringify(output.body);

      callback(null, output);

      return;
    }

    middleware(requestPayload).then(function (response) {

      output = _config.response(response);
      output.headers = Object.assign(_config.headers, output.headers);

      if (output.body)
        output.body = JSON.stringify(output.body);

      callback(null, output);

    }).catch(function (error) {

      output = _config.error(error);
      output.headers = Object.assign(_config.headers, output.headers);

      if (output.body)
        output.body = JSON.stringify(output.body);

      callback(null, output);

    });

  }

}

