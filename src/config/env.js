// Environment configuration for Vite
const env = {
  // Access environment variables through process.env
  NODE_ENV: process.env.NODE_ENV,
  VITE_API_URL: process.env.VITE_API_URL,
  VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
  VITE_GOOGLE_CLIENT_SECRET: process.env.VITE_GOOGLE_CLIENT_SECRET,
  VITE_REDIRECT_URI: process.env.VITE_REDIRECT_URI,
  ELECTRON: process.env.ELECTRON === 'true'
};

export default env; 