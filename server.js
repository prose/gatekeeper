var url = require('url'),
  http = require('http'),
  https = require('https'),
  fs = require('fs'),
  qs = require('querystring'),
  express = require('express'),
  app = express();

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = require('./config.json');
  Object.keys(config).forEach(function(key) {
    var envValue = process.env[key.toUpperCase()];
    if (!envValue) return;

    config[key] = (typeof config[key] === 'object') ? JSON.parse(envValue) : envValue;
  });

  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();

function authenticate(code, useCase, cb) {
  var oauth = config[useCase] || config.default;

  if (!oauth) {
    cb(new Error('Could not find oauth settings'), null);
    return;
  }

  var data = qs.stringify({
    client_id: oauth.client_id,
    client_secret: oauth.client_secret,
    code: code
  });

  var reqOptions = {
    host: config.oauth_host,
    port: config.oauth_port,
    path: config.oauth_path,
    method: config.oauth_method,
    headers: {
      'content-length': data.length
    }
  };

  var body = "";
  var req = https.request(reqOptions, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body += chunk;
    });
    res.on('end', function() {
      cb(null, qs.parse(body).access_token);
    });
  });

  req.write(data);
  req.end();
  req.on('error', function(e) {
    cb(e.message);
  });
}


// Convenience for allowing CORS on routes - GET only
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/authenticate/:code', function(req, res) {
  console.log('authenticating code:', req.params.code);
  console.log('use case: ', req.query.case);
  authenticate(req.params.code, req.query.case, function(err, token) {
      var result = err || !token ? {
        "error": "bad_code"
      } : {
        "token": token
      };
      console.log(result);
      res.json(result);
    });
});

var port = process.env.PORT || config.port || 9999;

app.listen(port, null, function(err) {
  console.log('Gatekeeper, at your service: http://localhost:' + port);
});
