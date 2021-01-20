/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

require('dotenv').config()
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const { privateDecrypt } = require('crypto');

var client_id = process.env.CLIENT_ID; // Your client id
var client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = "http://localhost:8888/callback"; // Your redirect uri
var access_token;
var refresh_token;
var user_id;


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {
  const scope = 'user-read-currently-playing user-top-read playlist-read-private user-read-private user-read-email user-follow-read user-library-read';

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
          user_id = body.id
        });
        
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/getPlaylists', function(req, res) {
  var authOptions = {
    url: `https://api.spotify.com/v1/users/${user_id}/playlists`,
    headers: { 'Authorization': 'Bearer ' + access_token},
  };
   // Requests the playlists of the user
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var playlists = body
      console.log(playlists)
      res.send({
        'playlists': playlists,
        status: 200
      })
    }
  })
});

app.get('/checkUserFollowsList', function(req, res){
  var playlist_id = req.query.playlist_id || null;
  var follower_id = req.query.follower_id || null;

  var authOptions = {
    url: `https://api.spotify.com/v1/playlists/${playlist_id}/followers/contains?ids=${follower_id}`,
    headers: { 'Authorization': 'Bearer ' + access_token}
  };

  // Requests whether a user follows a playlist
  request.get(authOptions, function(error, response, body){
    if (!error && response.statusCode === 200) {
      var follows = body
      console.log(follows)
      res.send({
        'follows': follows,
        status: 200
      })
    }
  })
});

app.get('/getTopArtistsTracks', function(req, res) {
  var type = req.query.type;
  console.log('Type is set to ' + type)
  var authOptions = {
    url: `https://api.spotify.com/v1/me/top/${type}`,
    headers: { 'Authorization': 'Bearer ' + access_token}
  };
  // Requests the top artists or the top tracks of the user
  request.get(authOptions, function(error, response, body){
    if (!error && response.statusCode === 200) {
      res.send({
        'top_element': body,
        status: 200
      })
    }
  })
});

app.get('/checkCurrentlyPlaying', function(req,res) {
  var authOptions = {
    url: `https://api.spotify.com/v1/me/player/currently-playing`,
    headers: { 'Authorization': 'Bearer ' + access_token}
  };

  // Requests the object currently being played on the user's Spotify account.
  request.get(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      console.log(body)
      res.send({
        'currently_playing': body,
        status: 200
      })
    }
  })
});

console.log('Listening on 8888');
app.listen(8888);
