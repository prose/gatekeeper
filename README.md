Gatekeeper
==========

Because of some [security-related limitations](http://blog.vjeux.com/2012/javascript/github-oauth-login-browser-side.html), Github prevents you from implementing the OAuth Web Application Flow on a client-side only application.

This is a real bummer. So we built Gatekeeper, which is the missing piece you need in order to make it work.

Gatekeeper works well with [Github.js](http://github.com/michael/github), which helps you accessing the [Github API](http://developer.github.com/v3/) from the browser.

## API

```
GET http://localhost:9999/authenticate/TEMPORARY_CODE
```

## OAuth Steps

Also see the [documentation on Github](http://developer.github.com/v3/oauth/).

1. Redirect users to request GitHub access.

```
GET https://github.com/login/oauth/authorize
```

2. GitHub redirects back to your site including a temporary code you need for the next step.

You can grab it like so:

```js
var code = window.location.href.match(/\?code=(.*)/)[1];
```

3. Request the actual token using your instance of Gatekeeper, which knows your `client_secret`.

```js
$.getJSON('http://localhost:9999/authenticate/'+code, function(data) {
  console.log(data.token);
});
```

## Setup your Gatekeeper

1. Clone it

```
git clone git@github.com:anvaka/gatekeeper.git
```

2. Install Dependencies

```
cd gatekeeper && npm install
```

3. Adjust config.json

```js
{
  "default" : {
    "client_id": "GITHUB_APPLICATION_CLIENT_ID",
    "client_secret": "GITHUB_APPLICATION_CLIENT_SECRET"
  },
  "oauth_host": "github.com",
  "oauth_port": 443,
  "oauth_path": "/login/oauth/access_token",
  "oauth_method": "POST"
}
```

If you want to support multiple apps (e.g. one for localhost development, one
for beta and one for production), you can adjust your config with use case name:

```js
{
  "local": {
    "client_id": "GITHUB_APPLICATION_LOCAL_CLIENT_ID",
    "client_secret": "GITHUB_APPLICATION_LOCAL_CLIENT_SECRET"
  },
  "beta": {
    "client_id": "GITHUB_APPLICATION_BETA_CLIENT_ID",
    "client_secret": "GITHUB_APPLICATION_BETA_CLIENT_SECRET"
  },
  "default" : {
    "client_id": "GITHUB_APPLICATION_CLIENT_ID",
    "client_secret": "GITHUB_APPLICATION_CLIENT_SECRET"
  },
  "oauth_host": "github.com",
  "oauth_port": 443,
  "oauth_path": "/login/oauth/access_token",
  "oauth_method": "POST"
}
```

You can also set environment variables to override the settings if you don't
want Git to track your adjusted config.json file:

``` sh
export BETA='{"client_id": "CLIENT_ID", "client_secret": "CLIENT_SECRET"}'
```

4. Serve it

```
$ node server.js
```

## Deploy on Heroku

0. Install [heroku CLI](https://devcenter.heroku.com/articles/heroku-command).
Login to heroku:

```
heroku login
```

1. Create a new Heroku app

```
heroku apps:create
```

2. Rename it (optional)

```
heroku apps:rename NEW_NAME
```

3. Provide OAUTH_CLIENT_ID and OAUTH_CLIENT_SECRET:

```
heroku config:set DEFAULT='{"client_id": "CLIENT_ID", "client_secret": "CLIENT_SECRET"}'
```

4. Push changes to heroku

```
git push heroku master
```

5. Verify it is working:

```
curl your_app_name.herokuapp.com/
```

Should return something like `Cannot GET /`

