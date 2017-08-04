# lambda-proxy-integration
AWS API Gateway Lambda Proxy Integration middleware

## API Gateway
set resource path like your folder structure and vice-versa

GET /user/friendlist
will map to:
/path-to-your-lambda-function-root/user/friendlist/GET.js

## Lambda Integration
Inside your file you have to export a Promise:

```javascript
// File: /resources/user/friendlist/GET.js

module.exports = function (requestPayload) {

  return new Promise(function (resolve, reject) {
  
    if (/*some errors*/) {

      // the params of "reject" will be passed to the error function
      return reject({
        code: 500,
        message: 'Server error'
      });
    }

    // the params of "resolve" will be passed to the response function
    resolve({
      success: true
    });

  });
};

```

In the root of lambda function, you export the integration created like this:

```javascript
// File: /index.js

var createIntegration = require('lambda-proxy-integration');

const lambdaProxyIntegration = createIntegration(function ({ requestPayload }) {

        return {

          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
          },

          // "response" params comes from resolve params
          response: function (response) {
            var body = {};

            return {
              body: response
            };
          },

          // "error" params comes from reject params
          error: function (error) {
            return {
              statusCode: error.code || 500,
              body: {
                error: error
              }
            }
          }

        };

      });


exports.handler = lambdaProxyIntegration;
```

