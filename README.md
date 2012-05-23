Gatekeeper
==========

Because of some [security-related limitations](http://blog.vjeux.com/2012/javascript/github-oauth-login-browser-side.html), it's not possible to implement the OAuth Web Application Flow on a client-side only application. Here's more context related to that problem.


This is a real bummer. So we built Gatekeeper, which is the missing piece you need in order to make it work.

API
==========

    GET http://localhost:9999/authenticate/TEMPORARY_CODE

OAuth Steps
==========

Also see [documentation on Github](http://developer.github.com/v3/oauth/).

1. Redirect users to request GitHub access
   
   ```
   POST https://github.com/login/oauth/access_token
   ```

2. GitHub redirects back to your site including a temporary code you need for the next step

   You can grab it like so:
   
   ```
   var code = window.location.href.match(/\?code=(.*)/)[1];
   ```
   
3. Request the actual token using your instance of Gatekeeper, which knows your `client_secret`.
   ```
   $.getJSON('http://localhost:9999/authenticate/'+code, function(data) {
     console.log(data.token);
   });
   ```

Setup your Gatekeeper
==========

1. Adjust config.json

   ```
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