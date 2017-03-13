var url     = require('url'),
    http    = require('http'),
    https   = require('https'),
    fs      = require('fs'),
    qs      = require('querystring'),
    express = require('express'),
    app     = express();

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
  for (var i in config) {
    if (i === 'clients') {
      for (var client in config.clients) {
        for (var clientKey in config.clients[client]) {
          var envKey;
          if (client === 'default') {
            envKey = clientKey.toUpperCase();
          } else {
            envKey = (clientKey + '_' + client).toUpperCase();
          }
          config.clients[client][clientKey] = process.env[envKey] || config.clients[client][clientKey];
        }
      }
      continue;
    }
    config[i] = process.env[i.toUpperCase()] || config[i];
  }
  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();

function authenticate(code, client, cb) {
  var data = qs.stringify({
    client_id: config.clients[client].oauth_client_id,
    client_secret: config.clients[client].oauth_client_secret,
    code: code,
    grant_type: 'authorization_code'
  });

  var reqOptions = {
    host: config.oauth_host,
    port: config.oauth_port,
    path: config.oauth_path,
    method: config.oauth_method,
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'content-length': data.length
    }
  };

  var body = "";
  var req = https.request(reqOptions, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) { body += chunk; });
    res.on('end', function() {
      cb(null, JSON.parse(body).access_token);
    });
  });

  req.write(data);
  req.end();
  req.on('error', function(e) { cb(e.message); });
}


// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/authenticate/:client/:code', function(req, res) {
  if (!config.clients[client]) {
    return res.json(404, {
      error: 'unknown_client'
    });
  }
  console.log('authenticating ' + req.params.client + ' code:' + req.params.code);
  authenticate(req.params.code, req.params.client, function(err, token) {
    if (err || !token) {
      return res.json(402, {
        error: 'bad_code'
      });
    }
    res.json({
      token: token
    });
  });
});
app.get('/authenticate/:code', function(req, res) {
  console.log('authenticating code:' + req.params.code);
  authenticate(req.params.code, 'default', function(err, token) {
    if (err || !token) {
      return res.json(402, {
        error: 'bad_code'
      });
    }
    res.json({
      token: token
    });
  });
});

var port = process.env.PORT || config.port || 9999;

app.listen(port, null, function (err) {
  console.log('Gatekeeper, at your service: http://localhost:' + port);
});
