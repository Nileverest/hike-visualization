# Data Endpoint Configuration

This project includes an environment-aware configuration that handles data endpoint URLs differently in development and production environments.

## How it Works

The configuration is managed in `src/config/environment.ts` and works as follows:

### Development Environment
- **Local URL**: `http://localhost:5174/2025/03/20/volume_profile_strategy.json`
- **Remote URL**: `https://result.strat.nileverest.co/strategy/2025/03/20/volume_profile_strategy.json`
- **Proxy**: Vite dev server proxies requests using the configuration in `vite.config.ts`

### Production Environment
- **Direct URL**: `https://result.strat.nileverest.co/strategy/2025/03/20/volume_profile_strategy.json`
- **No Proxy**: Requests go directly to the remote endpoint

## Configuration Details

### Environment Configuration (`src/config/environment.ts`)
```typescript
export const ENVIRONMENT_CONFIG = {
  REMOTE_BASE_URL: 'https://result.strat.nileverest.co/strategy',
  
  getDataEndpoint: (datePath: string): string => {
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // In development, use relative path that gets proxied
      return `/${datePath}`;
    } else {
      // In production, use full remote URL
      return `${ENVIRONMENT_CONFIG.REMOTE_BASE_URL}/${datePath}`;
    }
  },
  
  getDefaultDataEndpoint: (): string => {
    return ENVIRONMENT_CONFIG.getDataEndpoint('2025/03/20/volume_profile_strategy.json');
  }
};
```

### Vite Proxy Configuration (`vite.config.ts`)
```typescript
server: {
  proxy: {
    '^/(\\d{4}/\\d{2}/\\d{2}/.*\\.json)$': {
      target: 'https://result.strat.nileverest.co',
      changeOrigin: true,
      rewrite: (path) => `/strategy${path}`,
      configure: (proxy, options) => {
        // Logging for debugging
        proxy.on('proxyReq', (proxyReq, req, res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      },
    }
  }
}
```

## Usage

### In Development
1. Start the development server: `npm run dev`
2. The app automatically uses relative paths that get proxied
3. Access data using local URLs that are automatically redirected

### In Production
1. Build the app: `npm run build`
2. Deploy the built files
3. The app automatically uses full remote URLs

### In Code
```typescript
import { ENVIRONMENT_CONFIG } from './config/environment';

// Get the default data endpoint (works in both dev and prod)
const dataUrl = ENVIRONMENT_CONFIG.getDefaultDataEndpoint();

// Get a custom data endpoint
const customUrl = ENVIRONMENT_CONFIG.getDataEndpoint('2025/06/07/volume_profile_strategy.json');

const response = await fetch(dataUrl);
```

## Pattern Matching

The proxy uses a regex pattern to match date-based paths:
```
^/(\d{4}/\d{2}/\d{2}/.*\.json)$
```

This matches URLs like:
- `/2025/03/20/volume_profile_strategy.json`
- `/2025/06/07/volume_profile_strategy.json`
- `/2025/01/15/volume_profile_strategy.json`

## Testing

Use the DataEndpointTester component to test both development and production scenarios:

1. **Development Testing**: The tester shows "Development (using proxy)" and uses relative paths
2. **Production Testing**: The tester shows "Production (direct URL)" and uses full remote URLs
3. **Quick Test Buttons**: Test common date paths
4. **Custom Path Input**: Test any custom date path

## Benefits

- **Seamless Development**: No need to change URLs when switching between environments
- **Production Ready**: Works correctly when deployed to production
- **Environment Aware**: Automatically detects and adapts to the current environment
- **Maintainable**: Centralized configuration makes it easy to update endpoints 