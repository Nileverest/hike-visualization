# Data Endpoint Proxy Configuration

This project includes a Vite proxy configuration that automatically redirects local requests to the remote data endpoint.

## How it Works

The proxy is configured in `vite.config.ts` and works as follows:

### URL Translation
- **Local URL**: `http://localhost:5174/2025/03/20/volume_profile_strategy.json`
- **Remote URL**: `https://result.strat.nileverest.co/strategy/2025/03/20/volume_profile_strategy.json`

### Pattern Matching
The proxy uses a regex pattern to match date-based paths:
```
^/(\d{4}/\d{2}/\d{2}/.*\.json)$
```

This matches URLs like:
- `/2025/03/20/volume_profile_strategy.json`
- `/2025/06/07/volume_profile_strategy.json`
- `/2025/01/15/volume_profile_strategy.json`

### Configuration Details

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
2. Access data using local URLs:
   - `http://localhost:5174/2025/03/20/volume_profile_strategy.json`
   - `http://localhost:5174/2025/06/07/volume_profile_strategy.json`

### In Code
```typescript
// Instead of using the full remote URL
const remoteUrl = 'https://result.strat.nileverest.co/strategy/2025/03/20/volume_profile_strategy.json';

// Use the local proxy URL
const localUrl = '/2025/03/20/volume_profile_strategy.json';

const response = await fetch(localUrl);
```

## Testing

The project includes a `DataEndpointTester` component that allows you to:
- Test different date paths
- See the proxy in action
- View response details
- Debug any issues

## Benefits

1. **Development Convenience**: No need to hardcode remote URLs
2. **CORS Handling**: Proxy handles CORS issues automatically
3. **Consistent URLs**: Same URL structure in development and production
4. **Debugging**: Built-in logging for request/response tracking
5. **Flexibility**: Easy to change the target endpoint

## Notes

- The proxy only works during development (when running `npm run dev`)
- For production, you'll need to configure your web server or CDN to handle similar routing
- The proxy includes error handling and logging for debugging purposes 