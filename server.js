var url     = require('url'),
    fs      = require('fs'),
    request = require('request'),
    express = require('express'),
    app     = express();

// Load config defaults from JSON file.
// Environment variables override defaults.
function loadConfig() {
  var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
  for (var i in config) {
    config[i] = process.env[i.toUpperCase()] || config[i];
  }
  console.log('Configuration');
  console.log(config);
  return config;
}

var config = loadConfig();

function authenticate(code, cb) {
  var data = {
    client_id: config.oauth_client_id,
    client_secret: config.oauth_client_secret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: 'http://lieu.io/prose/'
  };

  var reqOptions = {
    url: config.oauth_host + config.oauth_path,
    qs: data
  };


  request.post(reqOptions, function (error, res, body) {
    if (error) { cb(e.message); }
    try {
      body = JSON.parse(body);
    }
    catch (e) {
      cb(e.message);
    }
    cb(null, body.access_token);
  });
}


// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/authenticate/:code', function(req, res) {
  console.log('authenticating code:' + req.params.code);
  authenticate(req.params.code, function(err, token) {
    var result = err || !token ? {"error": "bad_code"} : { "token": token };
    console.log(result);
    if (err) {
      console.log(err);
    }
    res.json(result);
  });
});

var port = process.env.PORT || config.port || 9999;

app.listen(port, null, function (err) {
  console.log('Gatekeeper, at your service: http://localhost:' + port);
});
