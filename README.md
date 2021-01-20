On Spotify, the "Currently Playing" information for a user is inaccessible to them. Also, nine out of ten times, the song listed as "Currently Playing" on the Spotify servers for a user is different from the song that they are listening to at that moment. 

The aim of this project is to provide Spotify users a mobile application in which they can look at which song is being listed as "Currently Playing" for them on the Spotify servers.

Users would also get the chance to look at their Top Artists and Top Tracks. 

The features are not final, since I didn't have the chance to cover the complete Spotify API.

[The Quick-Start Code provided by Spotify](https://developer.spotify.com/documentation/web-api/quick-start/) was forked to proveide a stepping stone for the backend of the project. 

Below is the README from the forked repository. 
<hr>

# Spotify Accounts Authentication Examples

This project contains basic demos showing the different OAuth 2.0 flows for [authenticating against the Spotify Web API](https://developer.spotify.com/web-api/authorization-guide/).

These examples cover:

* Authorization Code flow
* Client Credentials flow
* Implicit Grant flow

## Installation

These examples run on Node.js. On [its website](http://www.nodejs.org/download/) you can find instructions on how to install it. You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm.

Once installed, clone the repository and install its dependencies running:

    $ npm install

### Using your own credentials
You will need to register your app and get your own credentials from the Spotify for Developers Dashboard.

To do so, go to [your Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) and create your application. For the examples, we registered these Redirect URIs:

* http://localhost:8888 (needed for the implicit grant flow)
* http://localhost:8888/callback

Once you have created your app, replace the `client_id`, `redirect_uri` and `client_secret` in the examples with the ones you get from My Applications.


You need to create a .env variable to store the `client_id`, `redirect_uri` and `client_secret` in the current example. 
## Running the examples
In order to run the different examples, open the folder with the name of the flow you want to try out, and run its `app.js` file. For instance, to run the Authorization Code example do:

    $ cd authorization_code
    $ node app.js

Then, open `http://localhost:8888` in a browser.
