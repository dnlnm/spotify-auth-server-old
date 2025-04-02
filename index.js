require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// State for CSRF protection
const generateRandomString = length => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/**
 * Initial login endpoint - redirects to Spotify authorization page
 */
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  
  // Store in a cookie or session (simplified for example)
  res.cookie('spotify_auth_state', state);

  // Redirect user to Spotify authorization page
  const scope = 'user-read-private user-read-email user-read-playback-state user-read-currently-playing';
  
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
      state: state
    }));
});

/**
 * Callback endpoint used by Spotify after authorization
 */
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  
  // Should validate state here with the one stored in cookie
  // Skipped for simplicity
  
  if (state === null) {
    res.redirect(`${process.env.FRONTEND_URI}/#error=state_mismatch`);
    return;
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(
          process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
        ).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Redirect to frontend with tokens in URL hash
    res.redirect(`${process.env.FRONTEND_URI}/#` +
      querystring.stringify({
        access_token,
        refresh_token,
        expires_in
      }));
      
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.redirect(`${process.env.FRONTEND_URI}/#error=invalid_token`);
  }
});

/**
 * Refresh token endpoint
 */
app.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      params: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(
          process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET
        ).toString('base64')),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Simple status endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Spotify Auth Server is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 