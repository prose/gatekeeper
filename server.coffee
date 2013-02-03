# Dependencies
https = require 'https'
fs    = require 'fs'
qs    = require 'querystring'

# Create app object.
app   = (require 'express') null

# Wrapper for helper functions
lib =
  loadConfig: ->
    # Load default config from config.json
    config = JSON.parse fs.readFileSync "#{__dirname}/config.json", 'utf-8'

    # Override if env var present.
    config[key] = process.env[key.toUpperCase()] or val for key, val of config
    config

  authenticate: (code, cb) ->
    config = app.get 'config'

    # Prepare payload
    data = qs.stringify
      client_id: config.oauth_client_id
      client_secret: config.oauth_client_secret
      code: code

    # Oauth options.
    reqOptions =
      host: config.oauth_host
      port: config.oauth_port
      path: config.oauth_path
      method: config.oauth_method
      headers:
        'content-length': data.length

    body = ''
    req = https.request reqOptions, (res) ->
      res.setEncoding 'utf8'
      res.on 'data', (chunk) -> body += chunk
      res.on 'end', ->
        # Fire callback with response
        cb null, (qs.parse body).access_token

    # Make request.
    req.write data
    req.end()

    req.on 'error', (e) -> cb e.message

# Retrieve and attach config to the app object.
app.set 'config', lib.loadConfig()

# Convenience for allowing CORS on routes - GET only
app.all '*', (req, res, next) ->
  res.header
    'Access-Control-Allow-Origin': '*'
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
    'Access-Control-Allow-Headers': 'Content-Type'

  next()

app.get '/authenticate/:code', (req, res) ->
  # Log request.
  console.log "#{req.ip} requested #{req.originalUrl}"

  # Respond with auth token.
  authenticate req.params.code, (err, token) ->
    return err if err

    # If invalid token, return error.
    result = if token then "error": "bad_code" else "token": token
    console.log result

    # Send result to the client.
    res.json result

port = process.env.PORT or (app.get 'config').port

# Start app.
app.listen port, null, (err) ->
  console.log "Gatekeeper, at your service. Running on port #{port}"
