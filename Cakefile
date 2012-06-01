fs            = require 'fs'
{spawn, exec} = require 'child_process'

# Config
# ----------

config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'))

# ANSI terminal colors.
# ----------

red   = '\033[0;31m'
green = '\033[0;32m'
reset = '\033[0m'

# Commands
# ----------

herokuCreate = "heroku create --stack cedar"
herokuPush   = "git push heroku master"
herokuConfig = "heroku config:add NODE_ENV=production"

herokuConfig = (client, secret) ->
  "heroku config:add OAUTH_CLIENT_ID=#{client} OAUTH_CLIENT_SECRET=#{secret}"

# Helpers
# ----------

# Log a message with a color.
log = (message, color, explanation) ->
  console.log "#{color or ''}#{message}#{reset} #{explanation or ''}"

# Tasks
# ----------

option '-c', '--client [CLIENT_ID]', 'Client ID'
option '-s', '--secret [CLIENT_SECRET]', 'Client Secret'

task 'heroku:config', 'Reconfigure heroku', (options) ->
  exec herokuConfig(options.client, options.secret), (err, stdout, stderr) ->
    throw err if err
    log stdout
    log 'Sucessfully configured the app on heroku.', green

task 'heroku:create', 'Create the app on the cedar stack', (options) ->
  exec herokuCreate, (err, stdout, stderr) ->
    throw err if err
    log stdout
    log 'Sucessfully created the app on heroku.', green

task 'heroku:push', 'Push changes to heroku', (options) ->
  exec herokuPush, (err, stdout, stderr) ->
    throw err if err
    log stdout
    log 'Sucessfully pushed app to heroku.', green