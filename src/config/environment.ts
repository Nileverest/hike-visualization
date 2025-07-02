// Environment configuration for data endpoints
export const ENVIRONMENT_CONFIG = {
  // Base URL for the remote data endpoint
  REMOTE_BASE_URL: 'https://result.strat.nileverest.co/strategy',
  
  // In development, we use relative paths that get proxied by Vite
  // In production, we use the full remote URL (CORS will be handled by CloudFront)
  getDataEndpoint: (datePath: string): string => {
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // In development, use relative path that gets proxied
      return `${ENVIRONMENT_CONFIG.REMOTE_BASE_URL}/${datePath}`;
    } else {
      // In production, use full remote URL (CORS configured on CloudFront)
      return `${ENVIRONMENT_CONFIG.REMOTE_BASE_URL}/${datePath}`;
    }
  },
  
  // Helper function to get the default data endpoint
  getDefaultDataEndpoint: (): string => {
    return ENVIRONMENT_CONFIG.getDataEndpoint('2025/03/20/volume_profile_strategy.json');
  }
}; 