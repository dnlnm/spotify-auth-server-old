# Spotify Auth Server

A simple Node.js server that handles the OAuth authentication flow for the Spotify Now Playing desktop application.

## Features

- Handles the OAuth 2.0 authorization code flow with PKCE for Spotify
- Provides endpoints for authentication and token refresh
- Securely manages client secrets without exposing them to the frontend
- Supports redirection back to the desktop application

## Setup Instructions

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   REDIRECT_URI=http://localhost:3000/callback
   FRONTEND_URI=http://localhost:1420
   PORT=3000
   ```
4. Start the development server:
   ```
   npm run dev
   ```

### Production Deployment

#### Deploying to Heroku

1. Create a Heroku account if you don't have one
2. Install the Heroku CLI and log in
3. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
4. Set the environment variables:
   ```
   heroku config:set CLIENT_ID=your_spotify_client_id
   heroku config:set CLIENT_SECRET=your_spotify_client_secret
   heroku config:set REDIRECT_URI=https://your-app-name.herokuapp.com/callback
   heroku config:set FRONTEND_URI=app://com.tauri-app.app
   ```
5. Deploy the app:
   ```
   git push heroku main
   ```

#### Deploying to Netlify (with Netlify Functions)

1. Create a `netlify.toml` file:
   ```toml
   [build]
     functions = "functions"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```
2. Convert the Express app to Netlify Functions (requires additional setup)

#### Deploying to Railway

1. Create a Railway account
2. Connect your GitHub repository
3. Add the environment variables in the Railway dashboard
4. Deploy the app

## Configuring the Desktop App

After deploying the auth server, update the desktop app code:

1. In `src/lib/spotify.ts`, update the `AUTH_SERVER_URL` constant:
   ```typescript
   const AUTH_SERVER_URL = 'https://your-deployed-server-url';
   ```

2. Update your Spotify app in the Spotify Developer Dashboard:
   - Add your deployed server callback URL to the Redirect URIs:
     `https://your-deployed-server-url/callback`

## Security Considerations

- Never expose your Spotify Client Secret in the frontend code
- Implement proper CORS restrictions in production
- Consider adding rate limiting for production use
- Implement proper state validation to prevent CSRF attacks

## License

MIT 