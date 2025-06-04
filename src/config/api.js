export const API_CONFIG = {
  clientId: process.env.YOUTUBE_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ]
};

export const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'; 