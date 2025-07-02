// Environment configuration for data endpoints
export const ENVIRONMENT_CONFIG = {
  // Base URL for the remote data endpoint
  REMOTE_BASE_URL: 'https://result.strat.nileverest.co/strategy',
  
  // In development, we use relative paths that get proxied by Vite
  // In production, we use the full remote URL (CORS will be handled by CloudFront)
  getDataEndpoint: (year: string, month: string, day: string): string => {
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // In development, use relative path that gets proxied
      return `${ENVIRONMENT_CONFIG.REMOTE_BASE_URL}/${year}/${month}/${day}/volume_profile_strategy.json`;
    } else {
      // In production, use full remote URL (CORS configured on CloudFront)
      return `${ENVIRONMENT_CONFIG.REMOTE_BASE_URL}/${year}/${month}/${day}/volume_profile_strategy.json`;
    }
  },

}; 