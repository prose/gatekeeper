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
  log('Configuration');
  for (var i in config) {
    config[i] = process.env[i.toUpperCase()] || config[i];
    if (i === 'oauth_client_id' || i === 'oauth_client_secret') {
      log(i + ':', config[i], true);
    } else {
      log(i + ':', config[i]);
    }  
  }
  return config;
}

var config = loadConfig();

function authenticate(code, cb) {
  var data = qs.stringify({
    client_id: config.oauth_client_id,
    client_secret: config.oauth_client_secret,
    code: code
  });

  var reqOptions = {
    host: config.oauth_host,
    port: config.oauth_port,
    path: config.oauth_path,
    method: config.oauth_method,
    headers: { 'content-length': data.length }
  };

  var body = "";
  var req = https.request(reqOptions, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) { body += chunk; });
    res.on('end', function() {
      cb(null, qs.parse(body).access_token);
    });
  });

  req.write(data);
  req.end();
  req.on('error', function(e) { cb(e.message); });
}

function log(label, value, sanitized) {
  value = value || '';
  if (sanitized){
    if (typeof(value) === 'string' && value.length > 10){
      console.log(label, value.substring(3,0) + '...');
    } else {
      console.log(label, '...');
    }
  } else {
    console.log(label, value);
  }
}


// Convenience for allowing CORS on routes - GET only
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.get('/authenticate/:code', function(req, res) {
  log('authenticating code:', req.params.code, true);
  authenticate(req.params.code, function(err, token) {
    if ( err || !token ) {
      result = {"error": "bad_code"};
      log(result.error);
    } else {
      result = {"token": token};
      log("token", result.token, true);
    }    
    res.json(result);
  });
});

var port = process.env.PORT || config.port || 9999;

app.listen(port, null, function (err) {
  log('Gatekeeper, at your service: http://localhost:' + port);
});
