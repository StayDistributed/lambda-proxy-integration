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
module.exports = function (requestPayload) {

  return new Promise(function (resolve, reject) {
  
    if (/*some errors*/) {
      return reject({
        code: 500,
        message: 'Server error'
      });
    }

    resolve({
      success: true
    });

  });
};

```


```javascript
var createIntegration = require('lambda-proxy-integration');

const lambdaProxyIntegration = createIntegration(function ({ requestPayload }) {

        return {

          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
          },

          response: function (response) {
            var body = {};

            return {
              body: response
            };
          },

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

