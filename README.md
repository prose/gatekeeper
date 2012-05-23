Gatekeeper
==========

Because of some [security-related limitations](http://blog.vjeux.com/2012/javascript/github-oauth-login-browser-side.html), Github prevents you from implementing the OAuth Web Application Flow on a client-side only application.

This is a real bummer. So we built Gatekeeper, which is the missing piece you need in order to make it work.

API
==========
    
```
GET http://localhost:9999/authenticate/TEMPORARY_CODE
```

OAuth Steps
==========

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

Setup your Gatekeeper
==========

1. Adjust config.json

   ```js
   {
     "client_id": "GITHUB_APPLICATION_CLIENT_ID",
     "client_secret": "GITHUB_APPLICATION_CLIENT_SECRET",
     "host": "github.com",
     "port": 443,
     "path": "/login/oauth/access_token",
     "method": "POST",
     "server": {
       "port": 9999
     }
   }
   ```

2. Serve it

   ```
   $ node server.js
   ```