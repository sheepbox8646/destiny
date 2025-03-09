export const config = {
  baseUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://sticky-with.netlify.app'
} 